import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const VERDAN_GREEN = "#48845C";

interface Site {
  _id: string;
  name: string;
  status: "active" | "inactive";
}

interface TreeImage {
  _id?: string;
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
  plantedBy?: {
    name: string;
  };
}

export default function PublicTreeView() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [siteId, setSiteId] = useState<string>("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const fetchTree = async () => {
      if (!treeId) return;

      try {
        setLoading(true);

        // Fetch from public endpoint (no authentication required)
        const res = await API.get<any>(`/public/trees/${treeId}`);

        if (res && res.data && res.data.tree) {
          setTree(res.data.tree);

          // Extract siteId for authenticated navigation
          const extractedSiteId =
            typeof res.data.tree.siteId === "object"
              ? res.data.tree.siteId._id
              : res.data.tree.siteId;
          setSiteId(extractedSiteId);

          // Show auth prompt if user is logged in
          if (token && role) {
            setShowAuthPrompt(true);
          }

          // Set selectedImageIndex to the latest image
          if (res.data.tree.images && res.data.tree.images.length > 0) {
            const sorted = [...res.data.tree.images].sort(
              (a: TreeImage, b: TreeImage) => {
                const dateA = new Date(a.timestamp).getTime();
                const dateB = new Date(b.timestamp).getTime();
                return dateA - dateB;
              },
            );
            setSelectedImageIndex(sorted.length - 1);
          }
        }
      } catch (err: any) {
        console.error("Error fetching tree:", err);
        setError(err?.response?.data?.message || "Failed to fetch tree data");
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [treeId, token, role]);

  const handleSignIn = () => {
    navigate("/");
  };

  const handleGoToAuthView = () => {
    if (siteId && role) {
      if (role === "admin") {
        navigate(`/admin/dashboard/${siteId}/${treeId}`);
      } else {
        navigate(`/user/site/${siteId}/${treeId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div
              className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent animate-spin"
              style={{ borderTopColor: VERDAN_GREEN }}
            />
          </div>
          <p className="text-gray-600 font-medium">Loading tree details...</p>
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
            Tree Not Found
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {error || "The requested tree could not be found"}
          </p>
          <button
            onClick={handleSignIn}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const site = typeof tree.siteId === "object" ? tree.siteId : null;
  const siteName = site?.name || "Unknown Site";
  const siteStatus = site?.status || "unknown";

  // Sort images chronologically (earliest first)
  const sortedImages = [...(tree.images || [])].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateA - dateB;
  });

  const getStatusColor = (status: string) => {
    const s = status.trim().toLowerCase();
    if (s === "healthy") return "bg-[#B8E6C0] text-[#14532d]";
    if (s === "sick") return "bg-[#F8E3A1] text-[#7c2d12]";
    if (s === "dead") return "bg-[#F2B8B5] text-[#7f1d1d]";
    if (s === "need attention" || s === "needs attention")
      return "bg-[#F7CDAA] text-[#7c2d12]";
    return "bg-blue-100 text-blue-800";
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
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="Harit Logo" className="h-8" />
              <span className="text-2xl font-bold text-gray-800">हरित</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {token && role ? (
                <>
                  <button
                    onClick={handleGoToAuthView}
                    className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm font-medium text-white rounded-lg transition-colors"
                    style={{ backgroundColor: VERDAN_GREEN }}
                  >
                    Go to Full View
                  </button>
                  <button
                    onClick={() => setShowAuthPrompt(false)}
                    className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                  >
                    Read-Only
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: VERDAN_GREEN }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Prompt Banner - Only show if authenticated */}
      {showAuthPrompt && token && role && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  You're signed in as <strong>{role}</strong>. Switch to full
                  view to access all features and make updates.
                </span>
              </div>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="text-green-600 hover:text-green-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public View Banner - Only show if not authenticated */}
      {(!token || !role) && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                You're viewing in <strong>read-only mode</strong>. Sign in for
                full access.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {tree.treeName}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                tree.status,
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
              <span className="text-xs text-gray-500 block mb-1">Location</span>
              <p className="text-sm font-medium text-gray-900">
                {tree.coordinates.lat.toFixed(6)},{" "}
                {tree.coordinates.lng.toFixed(6)}
              </p>
            </div>
            {tree.plantedBy && (
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  Planted By
                </span>
                <p className="text-sm font-medium text-gray-900">
                  {tree.plantedBy.name}
                </p>
              </div>
            )}
          </div>
          {tree.remarks && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 block mb-1">Remarks</span>
              <p className="text-sm text-gray-700">{tree.remarks}</p>
            </div>
          )}
        </div>

        {/* Growth Timeline */}
        {sortedImages.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
              Growth Timeline ({sortedImages.length} records)
            </h2>

            {/* Main Image Display */}
            <div className="mb-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img
                  src={sortedImages[selectedImageIndex]?.url}
                  alt={`${tree.treeName} - Record ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Record {selectedImageIndex + 1} of {sortedImages.length}
                </span>
                <span className="text-gray-500">
                  {new Date(
                    sortedImages[selectedImageIndex]?.timestamp,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {sortedImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {sortedImages.map((img, idx) => (
                  <button
                    key={img._id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
