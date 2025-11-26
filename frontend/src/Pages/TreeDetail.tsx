import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import UpdateTreeRecord from "./UpdateTreeRecord";
import verdanLogo from "../assets/verdan_light.svg";

const VERDAN_GREEN = "#48845C";

interface Site {
  _id: string;
  name: string;
  status: "active" | "inactive";
}

interface TreeImage {
  _id?: string; // Mongoose assigns _id to subdocuments by default
  url: string;
  timestamp: string;
}

interface Tree {
  _id: string;
  treeName: string;
  treeType?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  datePlanted: string;
  timestamp?: string;
  status: string;
  remarks?: string;
  verified: boolean;
  images: TreeImage[];
  siteId: Site | string;
}

export default function TreeDetail() {
  const { siteId, treeId } = useParams<{ siteId: string; treeId: string }>();
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRecordDrawer, setShowRecordDrawer] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    recordId: null as string | null,
    timestamp: "",
    deleting: false,
  });

  useEffect(() => {
    const fetchTree = async () => {
      if (!token || !treeId) return;

      try {
        setLoading(true);
        const isUser = role === "user";
        let res;
        if (isUser) {
          // Use user site-scoped endpoint when siteId present
          if (siteId) {
            try {
              res = await API.get<Tree>(
                `/user/sites/${siteId}/trees/${treeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (e) {
              // Fallback to list then filter
              const list = await API.get<any>(`/user/sites/${siteId}/trees`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const arr = list.data.trees || list.data;
              const found = Array.isArray(arr)
                ? arr.find((t: any) => t._id === treeId)
                : null;
              if (!found) throw new Error("Tree not found in accessible site");
              setTree(found);
              return;
            }
          } else {
            throw new Error("Missing site context for user access");
          }
        } else {
          res = await API.get<Tree>(`/admin/trees/${treeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (res) {
          setTree(res.data);
          // Set selectedImageIndex to the latest image (last in chronologically sorted array)
          if (res.data.images && res.data.images.length > 0) {
            const sorted = [...res.data.images].sort((a, b) => {
              const dateA = new Date(a.timestamp).getTime();
              const dateB = new Date(b.timestamp).getTime();
              return dateA - dateB;
            });
            setSelectedImageIndex(sorted.length - 1);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch tree data");
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [token, treeId, refreshCounter, role, siteId]);

  const handleAddRecord = () => {
    setShowRecordDrawer(true);
  };

  const handleBack = () => {
    if (role === "user") navigate(`/user/site/${siteId}`);
    else navigate(`/admin/dashboard/${siteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: VERDAN_GREEN, borderTopColor: "transparent" }}
          />
          <p className="text-gray-600 text-sm">Loading tree details...</p>
        </div>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Tree
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {error || "Tree not found"}
          </p>
          <button
            onClick={handleBack}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            Back to Site
          </button>
        </div>
      </div>
    );
  }

  const site = typeof tree.siteId === "object" ? tree.siteId : null;
  const siteName = site?.name || "Unknown Site";
  const siteStatus = site?.status || "unknown";
  const siteIdValue = site?._id || siteId || "";

  // Sort images chronologically (earliest first) so first record is the first uploaded
  const sortedImages = [...(tree.images || [])].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateA - dateB;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "sick":
        return "bg-yellow-100 text-yellow-800";
      case "dead":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ borderBottomColor: VERDAN_GREEN + "15" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={verdanLogo} alt="Verdan Logo" className="h-7" />
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {tree.treeName}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  tree.status
                )}`}
              >
                {tree.status.charAt(0).toUpperCase() + tree.status.slice(1)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tree.verified
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {tree.verified ? "Verified" : "Pending"}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              ID: {tree._id.slice(-8)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">{siteName}</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  siteStatus === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {siteStatus}
              </span>
            </div>
          </div>
          <button
            onClick={handleAddRecord}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95 whitespace-nowrap self-start sm:self-auto"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            + Add New Record
          </button>
        </div>

        {/* Tree Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
            Tree Information
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-500 block mb-1">Type</span>
              <p className="text-sm font-medium text-gray-900">
                {tree.treeType || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">
                Date Planted
              </span>
              <p className="text-sm font-medium text-gray-900">
                {new Date(tree.datePlanted).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Verified</span>
              <p className="text-sm font-medium">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    tree.verified
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {tree.verified ? "Yes" : "No"}
                </span>
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">
                Total Records
              </span>
              <p className="text-sm font-medium text-gray-900">
                {sortedImages.length}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <span className="text-xs text-gray-500 block mb-1">Latitude</span>
              <p className="text-sm font-mono text-gray-900">
                {tree.coordinates.lat.toFixed(6)}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">
                Longitude
              </span>
              <p className="text-sm font-mono text-gray-900">
                {tree.coordinates.lng.toFixed(6)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-gray-500 block mb-1">
                Last Updated
              </span>
              <p className="text-sm font-medium text-gray-900">
                {sortedImages.length > 0
                  ? new Date(
                      sortedImages[sortedImages.length - 1].timestamp
                    ).toLocaleDateString()
                  : "No records"}
              </p>
            </div>
          </div>
          {tree.remarks && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 block mb-1">Remarks</span>
              <p className="text-sm text-gray-700">{tree.remarks}</p>
            </div>
          )}
        </div>

        {/* Timeline & Records Section */}
        {sortedImages.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: VERDAN_GREEN + "15" }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: VERDAN_GREEN }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No records available yet</p>
            <button
              onClick={handleAddRecord}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: VERDAN_GREEN }}
            >
              Add First Record
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Timeline - Desktop (Left Side) */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-5">
                  Record Timeline
                </h2>
                <div className="space-y-0">
                  {sortedImages.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative pl-8 pb-6 cursor-pointer group ${
                        index === sortedImages.length - 1 ? "pb-0" : ""
                      }`}
                    >
                      {/* Timeline line */}
                      {index !== sortedImages.length - 1 && (
                        <div
                          className="absolute left-[11px] top-4 w-0.5 h-full"
                          style={{
                            backgroundColor:
                              selectedImageIndex === index
                                ? VERDAN_GREEN
                                : "#e5e7eb",
                          }}
                        />
                      )}
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedImageIndex === index
                            ? "border-transparent"
                            : "border-gray-300 bg-white group-hover:border-gray-400"
                        }`}
                        style={{
                          backgroundColor:
                            selectedImageIndex === index
                              ? VERDAN_GREEN
                              : undefined,
                          borderColor:
                            selectedImageIndex === index
                              ? VERDAN_GREEN
                              : undefined,
                        }}
                      >
                        {selectedImageIndex === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      {/* Content */}
                      <div
                        className={`transition-colors ${
                          selectedImageIndex === index
                            ? "opacity-100"
                            : "opacity-70 group-hover:opacity-100"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(image.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(image.timestamp).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        {index === 0 && (
                          <span
                            className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: VERDAN_GREEN }}
                          >
                            First
                          </span>
                        )}
                        {index === sortedImages.length - 1 &&
                          sortedImages.length > 1 && (
                            <span
                              className="inline-block mt-1.5 ml-1 px-2 py-0.5 text-xs font-medium rounded-full text-white"
                              style={{ backgroundColor: VERDAN_GREEN }}
                            >
                              Latest
                            </span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline - Mobile (Horizontal) */}
            <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
                Timeline
              </h2>
              <div className="flex gap-3 min-w-max pb-2">
                {sortedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
                      selectedImageIndex === index
                        ? "bg-opacity-10"
                        : "hover:bg-gray-50"
                    }`}
                    style={{
                      backgroundColor:
                        selectedImageIndex === index
                          ? VERDAN_GREEN + "15"
                          : undefined,
                    }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mb-2 ${
                        selectedImageIndex === index ? "" : "bg-gray-300"
                      }`}
                      style={{
                        backgroundColor:
                          selectedImageIndex === index
                            ? VERDAN_GREEN
                            : undefined,
                      }}
                    />
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        selectedImageIndex === index
                          ? "text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {new Date(image.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {index === 0 && (
                      <span
                        className="text-xs mt-1 px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: VERDAN_GREEN }}
                      >
                        First
                      </span>
                    )}
                    {index === sortedImages.length - 1 &&
                      sortedImages.length > 1 && (
                        <span
                          className="text-xs mt-1 px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: VERDAN_GREEN }}
                        >
                          Latest
                        </span>
                      )}
                  </button>
                ))}
              </div>
            </div>

            {/* Records Content */}
            <div className="flex-1 space-y-6">
              {/* Selected Record (Large View) */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-video relative bg-gray-100">
                  <img
                    src={sortedImages[selectedImageIndex]?.url}
                    alt={`Tree record ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23f3f4f6' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='24'%3EImage unavailable%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="font-medium">
                          {new Date(
                            sortedImages[selectedImageIndex]?.timestamp
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-white/80">
                          {new Date(
                            sortedImages[selectedImageIndex]?.timestamp
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          Record {selectedImageIndex + 1} of{" "}
                          {sortedImages.length}
                        </span>
                        <button
                          type="button"
                          disabled={!sortedImages[selectedImageIndex]?._id}
                          onClick={() => {
                            const current = sortedImages[selectedImageIndex];
                            if (!current?._id) return;
                            setDeleteConfirm({
                              show: true,
                              recordId: current._id,
                              timestamp: current.timestamp,
                              deleting: false,
                            });
                          }}
                          className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Records Grid */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    All Records ({sortedImages.length})
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {sortedImages.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedImageIndex === index
                          ? "ring-2 ring-offset-2"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        borderColor:
                          selectedImageIndex === index
                            ? VERDAN_GREEN
                            : undefined,
                        ...(selectedImageIndex === index && {
                          boxShadow: `0 0 0 2px ${VERDAN_GREEN}`,
                        }),
                      }}
                    >
                      <img
                        src={image.url}
                        alt={`Tree record ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(image.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </div>
                      {image._id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({
                              show: true,
                              recordId: image._id || null,
                              timestamp: image.timestamp,
                              deleting: false,
                            });
                          }}
                          className="absolute top-2 left-2 px-2 py-1 text-[10px] font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      )}
                      {index === 0 && (
                        <div
                          className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-medium rounded text-white"
                          style={{ backgroundColor: VERDAN_GREEN }}
                        >
                          First
                        </div>
                      )}
                      {index === sortedImages.length - 1 &&
                        sortedImages.length > 1 && (
                          <div
                            className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-medium rounded text-white"
                            style={{ backgroundColor: VERDAN_GREEN }}
                          >
                            Latest
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-in Update Record Drawer */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          showRecordDrawer ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowRecordDrawer(false)}
        />
        <div
          className={`relative h-full w-full max-w-2xl bg-white transition-transform duration-300 ${
            showRecordDrawer ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {showRecordDrawer && (
            <UpdateTreeRecord
              embedded
              siteId={siteIdValue}
              treeId={treeId}
              onClose={() => setShowRecordDrawer(false)}
              onRecordSaved={() => setRefreshCounter((c) => c + 1)}
            />
          )}
        </div>
      </div>
      {/* DELETE RECORD CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Record
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this record from{" "}
                <span className="font-semibold">
                  {new Date(deleteConfirm.timestamp).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() =>
                    setDeleteConfirm({
                      show: false,
                      recordId: null,
                      timestamp: "",
                      deleting: false,
                    })
                  }
                  disabled={deleteConfirm.deleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={deleteConfirm.deleting}
                  onClick={async () => {
                    if (!token || !treeId || !deleteConfirm.recordId) return;
                    const recordId = deleteConfirm.recordId;
                    setDeleteConfirm((prev) => ({ ...prev, deleting: true }));
                    const backup = tree?.images || [];
                    // Optimistically update local state
                    setTree((prev) =>
                      prev
                        ? {
                            ...prev,
                            images: prev.images.filter(
                              (img: any) =>
                                String((img as any)._id) !== String(recordId)
                            ),
                          }
                        : prev
                    );
                    try {
                      const isUser = role === "user" && siteId;
                      const delUrl = isUser
                        ? `/user/sites/${siteId}/trees/${treeId}/records/${recordId}`
                        : `/admin/trees/${treeId}/records/${recordId}`;
                      await API.delete(delUrl, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      // Adjust selected index if needed
                      setSelectedImageIndex((idx) =>
                        idx >= sortedImages.length - 1
                          ? Math.max(0, sortedImages.length - 2)
                          : idx
                      );
                      setDeleteConfirm({
                        show: false,
                        recordId: null,
                        timestamp: "",
                        deleting: false,
                      });
                    } catch (err: any) {
                      console.error(err);
                      alert(
                        err?.response?.data?.message ||
                          "Failed to delete record"
                      );
                      // Rollback on error
                      setTree((prev) =>
                        prev ? { ...prev, images: backup } : prev
                      );
                      setDeleteConfirm({
                        show: false,
                        recordId: null,
                        timestamp: "",
                        deleting: false,
                      });
                    }
                  }}
                >
                  {deleteConfirm.deleting ? "Deleting..." : "Delete Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
