import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";
import AddPlants from "./AddPlants";

const VERDAN_GREEN = "#48845C";

interface Site {
  _id: string;
  name: string;
  address: string;
  status: "active" | "inactive";
  coordinates: {
    lat: number;
    lng: number;
  };
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
  images?: {
    url: string;
    timestamp: string;
  }[];
  plantedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SiteDashboard() {
  const { siteId: rawSiteId } = useParams<{ siteId: string }>();
  const siteId = rawSiteId ? decodeURIComponent(rawSiteId).trim() : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout, role } = useAuth();

  const [site, setSite] = useState<Site | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showPlantDrawer, setShowPlantDrawer] = useState(false);
  const [editingTreeId, setEditingTreeId] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    treeId: null as string | null,
    treeName: "",
  });
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await API.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch site and trees
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !siteId) {
        if (!siteId) setError("Site ID missing");
        return;
      }
      setLoading(true);
      setError("");

      try {
        const isUser = role === "user";
        if (isUser) {
          // Users: fetch site via admin fallback if accessible endpoints absent (optional), else minimal site info
          // Attempt to get trees first (will include count + trees)
          const treesRes = await API.get(`/user/sites/${siteId}/trees`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Support either { count, trees } or array response
          const treesArray = treesRes.data?.trees || treesRes.data;
          setTrees(Array.isArray(treesArray) ? treesArray : []);
          // Construct minimal site object if not previously set
          if (!site) {
            setSite({
              _id: siteId,
              name: "Site",
              address: "",
              status: "active",
              coordinates: { lat: 0, lng: 0 },
            });
          }
        } else {
          const siteRes = await API.get(`/admin/sites/${siteId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSite(siteRes.data);
          const treesRes = await API.get(`/admin/sites/${siteId}/trees`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fetchedTrees = treesRes.data || [];

          // Only update trees if we're not in the middle of a verification process
          // This prevents overriding optimistic updates
          if (!verifying) {
            setTrees(fetchedTrees);
          } else {
            console.log("Skipping tree update during verification process");
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch site");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, siteId, location.state?.refresh, refreshCounter, role, verifying]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBack = () => {
    if (role === "user") navigate("/user/dashboard");
    else navigate("/admin/Dashboard");
  };

  const handleAddPlants = () => {
    setEditingTreeId(null);
    setShowPlantDrawer(true);
  };

  const handleViewAnalytics = () => {
    if (!siteId) return;
    if (role === "user") return; // Only admins have analytics
    navigate(`/admin/dashboard/${siteId}/analytics`);
  };

  const performDeleteTree = async () => {
    if (!deleteConfirm.treeId || !token || !siteId) return;
    const id = deleteConfirm.treeId;
    const backup = trees.find((t) => t._id === id);

    // Optimistic removal
    setTrees((prev) => prev.filter((t) => t._id !== id));
    setDeleteConfirm({ show: false, treeId: null, treeName: "" });
    setDeleting(true);
    try {
      const isUser = role === "user";
      if (isUser) {
        await API.delete(`/user/sites/${siteId}/trees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const treesRes = await API.get(`/user/sites/${siteId}/trees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrees(treesRes.data.trees || treesRes.data?.trees || treesRes.data);
      } else {
        await API.delete(`/admin/trees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const treesRes = await API.get(`/admin/sites/${siteId}/trees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrees(treesRes.data);
      }
    } catch (err: any) {
      // Rollback on error
      if (backup) setTrees((prev) => [...prev, backup]);
      alert(err?.response?.data?.message || "Failed to delete tree");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateTree = (treeId: string) => {
    if (role === "user") navigate(`/user/site/${siteId}/${treeId}`);
    else navigate(`/admin/dashboard/${siteId}/${treeId}`);
  };

  const handleEditTree = (treeId: string) => {
    setEditingTreeId(treeId);
    setShowPlantDrawer(true);
  };

  const handleVerifyTree = async (treeId: string) => {
    if (!token || role === "user") return;
    console.log(`Starting verification for tree: ${treeId}`);
    setVerifying(treeId);

    // Update local state optimistically first
    setTrees((prev) => {
      const updated = prev.map((tree) =>
        tree._id === treeId ? { ...tree, verified: true } : tree
      );
      console.log("Optimistically updated trees state before API call");
      return updated;
    });

    try {
      const response = await API.patch(
        `/admin/verify/${treeId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Verification API response:", response.data);

      // Verify the API response matches our optimistic update
      if (response.data.verified === true) {
        console.log("Verification confirmed by server");
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      // Rollback optimistic update on error
      setTrees((prev) =>
        prev.map((tree) =>
          tree._id === treeId ? { ...tree, verified: false } : tree
        )
      );
      alert(err?.response?.data?.message || "Failed to verify tree");
    } finally {
      setVerifying(null);
      console.log(`Verification process completed for tree: ${treeId}`);
    }
  };
  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted"></div>
            <div
              className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent animate-spin"
              style={{ borderTopColor: VERDAN_GREEN }}
            />
          </div>
          <p className="text-muted-foreground font-medium">
            Loading site dashboard...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  if (!site)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Site not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* THIN NAVBAR */}
      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ borderBottomColor: VERDAN_GREEN + "15" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={verdanLogo} alt="Verdan Logo" className="h-7" />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaUserCircle className="text-2xl text-gray-600" />
                <span className="font-medium text-gray-800 text-sm hidden sm:block">
                  {user?.name}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="font-semibold text-sm text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <ul className="py-1">
                    <li
                      onClick={() => navigate("/profile")}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      Profile
                    </li>
                    <li
                      onClick={() => navigate("/setting")}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      Settings
                    </li>
                    <li
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-200 transition-colors"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER WITH BUTTONS */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {site.name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  site.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {site.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono">ID: {site._id}</p>
            <p className="text-sm text-gray-600 mt-1">{site.address}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            {role !== "user" && (
              <button
                onClick={handleViewAnalytics}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                style={{ backgroundColor: VERDAN_GREEN }}
              >
                View Analytics
              </button>
            )}
            <button
              onClick={handleAddPlants}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
              style={{ backgroundColor: VERDAN_GREEN }}
            >
              + Add Plants
            </button>
          </div>
        </div>

        {/* TREES TABLE - Desktop */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tree ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Coordinates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trees.map((tree, index) => (
                  <tr
                    key={tree._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tree.images?.length ? (
                        <img
                          src={
                            [...tree.images].sort(
                              (a, b) =>
                                new Date(b.timestamp).getTime() -
                                new Date(a.timestamp).getTime()
                            )[0].url
                          }
                          alt={tree.treeName}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23f3f4f6' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <span className="text-xs text-gray-400">N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-gray-500">
                        {tree._id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {tree.treeName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(tree.datePlanted).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(
                        tree.timestamp || tree.datePlanted
                      ).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {tree.coordinates.lat.toFixed(6)},{" "}
                      {tree.coordinates.lng.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tree.verified
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {tree.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditTree(tree._id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleUpdateTree(tree._id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                          style={{
                            backgroundColor: VERDAN_GREEN,
                            color: "white",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "0.9")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                        >
                          Details
                        </button>
                        {role !== "user" && !tree.verified && (
                          <button
                            onClick={() => handleVerifyTree(tree._id)}
                            disabled={verifying === tree._id}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {verifying === tree._id ? "Verifying..." : "Verify"}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              show: true,
                              treeId: tree._id,
                              treeName: tree.treeName,
                            })
                          }
                          className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TREES CARDS - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {trees.map((tree, index) => (
            <div
              key={tree._id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex gap-3 mb-3">
                {tree.images?.length ? (
                  <img
                    src={
                      [...tree.images].sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )[0].url
                    }
                    alt={tree.treeName}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f3f4f6' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {tree.treeName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    #{index + 1} • ID: {tree._id.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-900">
                    {new Date(tree.datePlanted).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="text-gray-900">
                    {new Date(
                      tree.timestamp || tree.datePlanted
                    ).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coordinates:</span>
                  <span className="text-gray-900 text-xs font-mono">
                    {tree.coordinates.lat.toFixed(4)},{" "}
                    {tree.coordinates.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tree.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tree.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateTree(tree._id)}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-md text-white transition-opacity"
                  style={{ backgroundColor: VERDAN_GREEN }}
                >
                  Details
                </button>
                <button
                  onClick={() => handleEditTree(tree._id)}
                  className="flex-1 px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                {role !== "user" && !tree.verified && (
                  <button
                    onClick={() => handleVerifyTree(tree._id)}
                    disabled={verifying === tree._id}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    {verifying === tree._id ? "Verifying..." : "Verify"}
                  </button>
                )}
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      show: true,
                      treeId: tree._id,
                      treeName: tree.treeName,
                    })
                  }
                  className="flex-1 px-3 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {trees.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
            <p className="text-gray-500 mb-4">
              No trees planted at this site yet
            </p>
            <button
              onClick={handleAddPlants}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: VERDAN_GREEN }}
            >
              Add Your First Plant
            </button>
          </div>
        )}
      </div>

      {/* DRAWER */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          showPlantDrawer ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowPlantDrawer(false)}
        />
        <div
          className={`relative h-full w-full max-w-2xl bg-white transition-transform duration-300 ${
            showPlantDrawer ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {siteId && (
            <AddPlants
              siteId={siteId}
              treeId={editingTreeId || undefined}
              onClose={() => {
                setShowPlantDrawer(false);
                setEditingTreeId(null);
              }}
              onTreeSaved={() => setRefreshCounter((c) => c + 1)}
            />
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Tree
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteConfirm.treeName}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() =>
                    setDeleteConfirm({
                      show: false,
                      treeId: null,
                      treeName: "",
                    })
                  }
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={performDeleteTree}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Tree"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
