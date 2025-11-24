import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import UpdateTreeRecord from "./UpdateTreeRecord";
import verdanLogo from "../assets/verdan_light.svg";

interface Site {
  _id: string;
  name: string;
  status: "active" | "inactive";
}

interface TreeImage {
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
  images: TreeImage[];
  siteId: Site | string;
}

export default function TreeDetail() {
  const { siteId, treeId } = useParams<{ siteId: string; treeId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRecordDrawer, setShowRecordDrawer] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const fetchTree = async () => {
      if (!token || !treeId) return;

      try {
        setLoading(true);
        const res = await API.get<Tree>(`/admin/trees/${treeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTree(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch tree data");
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [token, treeId, refreshCounter]);

  const handleAddRecord = () => {
    // Open drawer instead of navigating to separate page
    setShowRecordDrawer(true);
  };

  const handleBack = () => {
    navigate(`/admin/dashboard/${siteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-3">Error</h2>
          <p className="text-gray-700 mb-6">{error || "Tree not found"}</p>
          <button
            onClick={handleBack}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: "#48845C" }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const site = typeof tree.siteId === "object" ? tree.siteId : null;
  const siteName = site?.name || "Unknown Site";
  const siteStatus = site?.status || "unknown";
  const siteIdValue = site?._id || siteId || "";

  // Sort images by timestamp (latest first)
  const sortedImages = [...(tree.images || [])].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });

  const firstRecord = sortedImages.length > 0 ? sortedImages[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* NAVBAR */}
      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ borderBottomColor: "#48845C15" }}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">Tree Details</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  siteStatus === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {siteStatus}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Site:</span> {siteName}
              </p>
              <p className="text-xs font-mono text-gray-500">
                ID: {siteIdValue}
              </p>
            </div>
          </div>
          {firstRecord && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm w-full max-w-sm">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">
                Latest Record
              </h2>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(firstRecord.timestamp).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Time:</span>{" "}
                  {new Date(firstRecord.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Timeline Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
                Timeline
              </h2>
              <div className="space-y-4">
                {sortedImages.length === 0 ? (
                  <p className="text-gray-500 text-xs">No records yet</p>
                ) : (
                  sortedImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative pl-6 border-l-2 border-emerald-500"
                    >
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <div className="text-[10px] text-gray-700 font-medium">
                        {new Date(image.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(image.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              {/* Tree Information */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-wide">
                  Tree Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Tree Name:</span>
                    <p className="font-semibold text-lg">{tree.treeName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tree ID:</span>
                    <p className="font-mono text-sm">{tree._id.slice(-8)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tree Type:</span>
                    <p className="font-semibold">{tree.treeType || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tree.status === "healthy"
                          ? "bg-green-100 text-green-800"
                          : tree.status === "sick"
                          ? "bg-yellow-100 text-yellow-800"
                          : tree.status === "dead"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {tree.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Date Planted:</span>
                    <p>{new Date(tree.datePlanted).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Coordinates:</span>
                    <p className="font-mono text-xs">
                      {tree.coordinates.lat.toFixed(6)},{" "}
                      {tree.coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                {tree.remarks && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-600">Remarks:</span>
                    <p className="text-gray-800">{tree.remarks}</p>
                  </div>
                )}
              </div>

              {/* First Record */}
              {firstRecord && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-wide">
                    Latest Record (Image)
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <img
                      src={firstRecord.url}
                      alt="Latest tree record"
                      className="w-full max-w-md mx-auto rounded-lg object-cover aspect-video mb-4 border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="text-xs text-gray-600 flex gap-6">
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(firstRecord.timestamp).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span>{" "}
                        {new Date(firstRecord.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Past Records */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 tracking-wide">
                    Past Records
                  </h2>
                  <button
                    onClick={handleAddRecord}
                    className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: "#48845C" }}
                  >
                    + Add New Record
                  </button>
                </div>

                {sortedImages.length === 0 ? (
                  <p className="text-center py-10 text-gray-600">
                    No records available. Click "Add New Record" to add the
                    first record.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedImages.map((image, index) => (
                      <div
                        key={index}
                        className="group bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col"
                      >
                        <div className="relative w-full h-40 mb-3 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={image.url}
                            alt={`Tree record ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                        <div className="text-[11px] text-gray-600 flex items-center justify-between mt-auto">
                          <span className="font-medium">
                            {new Date(image.timestamp).toLocaleDateString()}
                          </span>
                          <span>
                            {new Date(image.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Slide-in Update Record Drawer */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          showRecordDrawer
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            showRecordDrawer ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowRecordDrawer(false)}
        />
        <div
          className={`relative h-full w-full max-w-2xl bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ${
            showRecordDrawer ? "translate-x-0" : "translate-x-full"
          } overflow-y-auto`}
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
    </div>
  );
}
