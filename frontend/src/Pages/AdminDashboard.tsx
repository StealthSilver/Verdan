import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";
import AddSite from "./AddSite";
import type { Site as SiteType } from "./AddSite";

const VERDAN_GREEN = "#48845C";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Site {
  _id: string;
  name: string;
  address: string;
  status: "active" | "inactive";
  teamMembers: Array<any>;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type?: string;
}

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [showSiteDrawer, setShowSiteDrawer] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteType | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    siteId: null as string | null,
    siteName: "",
  });
  const [deleting, setDeleting] = useState(false);

  // Dropdown outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch user
  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await API.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  // Fetch all sites (admin)
  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const res = await API.get<Site[]>("/admin/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSites(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch sites");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token, location.pathname, refreshCounter]);

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
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAdd = () => {
    setEditingSite(null);
    setShowSiteDrawer(true);
  };

  const handleUpdate = (site: Site) => {
    setEditingSite({
      _id: site._id,
      name: site.name,
      address: site.address,
      coordinates: site.coordinates,
      status: site.status,
      type: site.type || "",
    });
    setShowSiteDrawer(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.siteId || !token) return;
    const id = deleteConfirm.siteId;
    const backup = sites.find((s) => s._id === id);

    setSites((prev) => prev.filter((s) => s._id !== id));
    setDeleteConfirm({ show: false, siteId: null, siteName: "" });
    setDeleting(true);

    try {
      await API.delete(`/admin/sites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err: any) {
      if (backup) setSites((prev) => [...prev, backup]);
      alert(err?.response?.data?.message || "Failed to delete site");
    } finally {
      setDeleting(false);
    }
  };

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
        {/* HEADER WITH ADD BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              All Sites
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Admin can manage all sites
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            + Add New Site
          </button>
        </div>

        {/* SITES TABLE - Desktop */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Site Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Site ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sites.map((site) => (
                  <tr
                    key={site._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {site.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {site._id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {site.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          site.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {site.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
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
                          onClick={() =>
                            navigate(`/admin/dashboard/${site._id}`)
                          }
                        >
                          View
                        </button>
                        <button
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          onClick={() =>
                            navigate(`/admin/Dashboard/${site._id}/team`)
                          }
                        >
                          Team
                        </button>
                        <button
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          onClick={() => {
                            setEditingSite({
                              _id: site._id,
                              name: site.name,
                              address: site.address,
                              coordinates: site.coordinates,
                              status: site.status,
                              type: site.type || "",
                            });
                            setShowSiteDrawer(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                          onClick={() =>
                            setDeleteConfirm({
                              show: true,
                              siteId: site._id,
                              siteName: site.name,
                            })
                          }
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

        {/* SITES CARDS - Mobile/Tablet */}
        <div className="md:hidden space-y-4">
          {sites.map((site) => (
            <div
              key={site._id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {site.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {site.address}
                  </p>
                </div>
                <span
                  className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    site.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {site.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3 font-mono">
                ID: {site._id.slice(0, 12)}...
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-md text-white transition-opacity"
                  style={{ backgroundColor: VERDAN_GREEN }}
                  onClick={() => navigate(`/admin/dashboard/${site._id}`)}
                >
                  View
                </button>
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  onClick={() => navigate(`/admin/Dashboard/${site._id}/team`)}
                >
                  Team
                </button>
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  onClick={() => handleUpdate(site)}
                >
                  Edit
                </button>
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  onClick={() =>
                    setDeleteConfirm({
                      show: true,
                      siteId: site._id,
                      siteName: site.name,
                    })
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sites.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
            <p className="text-gray-500 mb-4">No sites created yet</p>
            <button
              onClick={handleAdd}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: VERDAN_GREEN }}
            >
              Add Your First Site
            </button>
          </div>
        )}
      </div>

      {/* DRAWER */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          showSiteDrawer ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowSiteDrawer(false)}
        />
        <div
          className={`relative h-full w-full max-w-2xl bg-white transition-transform duration-300 ${
            showSiteDrawer ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <AddSite
            site={editingSite || undefined}
            onClose={() => {
              setShowSiteDrawer(false);
              setEditingSite(null);
            }}
            onSiteSaved={() => setRefreshCounter((c) => c + 1)}
          />
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Site
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteConfirm.siteName}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() =>
                    setDeleteConfirm({
                      show: false,
                      siteId: null,
                      siteName: "",
                    })
                  }
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Site"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
