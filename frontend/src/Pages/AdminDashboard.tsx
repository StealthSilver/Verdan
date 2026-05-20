import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { avatarDataUrl } from "../utils/avatars";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import AddSite from "./AddSite";
import type { Site as SiteType } from "./AddSite";
import { messageFromUnknown } from "../utils/apiError";
import { useToast } from "../context/ToastContext";
import NotificationBell from "../components/NotificationBell/NotificationBell";

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
  teamMembers: unknown[];
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type?: string;
}

export default function AdminDashboard() {
  const { token, logout, avatarId } = useAuth();
  const toast = useToast();
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
  const [addressPreview, setAddressPreview] = useState<{
    open: boolean;
    siteName: string;
    address: string;
  }>({ open: false, siteName: "", address: "" });

  const copyText = async (value: string, doneMsg: string) => {
    const text = value?.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.info(doneMsg);
    } catch {
      // ignore
    }
  };

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
      } catch (err: unknown) {
        setError(messageFromUnknown(err, "Failed to fetch user data"));
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
      } catch (err: unknown) {
        setError(messageFromUnknown(err, "Failed to fetch sites"));
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
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            Back to Login
          </button>
        </div>
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
      coordinates: {
        lat: String(site.coordinates.lat),
        lng: String(site.coordinates.lng),
      },
      status: site.status,
      type: site.type || "",
    });
    setShowSiteDrawer(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.siteId || !token) return;
    const id = deleteConfirm.siteId;
    const backup = sites.find((s) => s._id === id);

    setSites((prev: Site[]) => prev.filter((s: Site) => s._id !== id));
    setDeleteConfirm({ show: false, siteId: null, siteName: "" });
    setDeleting(true);

    try {
      await API.delete(`/admin/sites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.danger("Site deleted successfully");
    } catch (err: unknown) {
      if (backup) setSites((prev: Site[]) => [...prev, backup]);
      toast.error(messageFromUnknown(err, "Failed to delete site"));
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
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="Harit Logo" className="h-8" />
              <span className="text-2xl font-bold text-gray-800">हरित</span>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={avatarDataUrl(avatarId)}
                  alt="Profile avatar"
                  className="h-8 w-8 rounded-xl border border-gray-200 bg-white"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="font-medium text-gray-800 text-sm hidden sm:block">
                  {user?.name}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {user?.name}
                      </p>
                      {user?.name ? (
                        <button
                          type="button"
                          className="shrink-0 rounded-md p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 transition-colors"
                          aria-label="Copy username"
                          title="Copy username"
                          onClick={() => copyText(user.name, "Username copied")}
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M5.75 3A2.75 2.75 0 0 0 3 5.75v7.5A2.75 2.75 0 0 0 5.75 16h3.5A2.75 2.75 0 0 0 12 13.25v-7.5A2.75 2.75 0 0 0 9.25 3h-3.5z" />
                            <path d="M12.75 4.5c.2.39.31.84.31 1.31v7.44c0 1.8-1.45 3.25-3.25 3.25H6.5a.75.75 0 0 0 .75.75h3.5A2.75 2.75 0 0 0 13.5 14.5V7a2.75 2.75 0 0 0-.75-1.89z" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
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
                      onClick={() => navigate("/settings")}
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
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER WITH ADD BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
              All Sites
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/sites/analytics")}
              className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: VERDAN_GREEN }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Show Analytics
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: VERDAN_GREEN }}
            >
              + Add New Site
            </button>
          </div>
        </div>

        {/* SITES TABLE - Desktop */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-hidden">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[28%] px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Site Name
                  </th>
                  <th className="w-[14%] px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Site ID
                  </th>
                  <th className="w-[28%] px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-[20%] sticky right-0 z-10 bg-gray-50 px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-gray-900 break-words whitespace-normal">
                        {site.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {site._id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-2 min-w-0">
                        <div
                          className="text-sm text-gray-700 max-w-[10rem] lg:max-w-[12rem] truncate"
                          title={site.address}
                        >
                          {site.address}
                        </div>
                        {site.address?.trim() ? (
                          <button
                            type="button"
                            className="shrink-0 rounded-md p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            onClick={() =>
                              setAddressPreview({
                                open: true,
                                siteName: site.name,
                                address: site.address,
                              })
                            }
                            aria-label="View full address"
                            title="View full address"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0V6.5zM10 8a.75.75 0 00-.75.75v5a.75.75 0 001.5 0v-5A.75.75 0 0010 8z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        ) : null}
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
                    <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-nowrap justify-end gap-2">
                        <button
                          className="px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
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
                          className="px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
                          onClick={() =>
                            navigate(`/admin/Dashboard/${site._id}/team`)
                          }
                        >
                          Team
                        </button>
                        <button
                          className="px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
                          onClick={() => {
                            setEditingSite({
                              _id: site._id,
                              name: site.name,
                              address: site.address,
                              coordinates: {
                                lat: String(site.coordinates.lat),
                                lng: String(site.coordinates.lng),
                              },
                              status: site.status,
                              type: site.type || "",
                            });
                            setShowSiteDrawer(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap"
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
                  <h3 className="font-semibold text-gray-900 break-words whitespace-normal">
                    {site.name}
                  </h3>
                  <div className="mt-1 flex items-start gap-2">
                    <p
                      className="text-xs text-gray-500 truncate"
                      title={site.address}
                    >
                      {site.address}
                    </p>
                    {site.address?.trim() ? (
                      <button
                        type="button"
                        className="shrink-0 rounded-md p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() =>
                          setAddressPreview({
                            open: true,
                            siteName: site.name,
                            address: site.address,
                          })
                        }
                        aria-label="View full address"
                        title="View full address"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0V6.5zM10 8a.75.75 0 00-.75.75v5a.75.75 0 001.5 0v-5A.75.75 0 0010 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
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
              <div className="grid grid-cols-4 gap-2">
                <button
                  className="px-2 py-2 text-xs font-medium rounded-md text-white transition-opacity whitespace-nowrap"
                  style={{ backgroundColor: VERDAN_GREEN }}
                  onClick={() => navigate(`/admin/dashboard/${site._id}`)}
                >
                  View
                </button>
                <button
                  className="px-2 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => navigate(`/admin/Dashboard/${site._id}/team`)}
                >
                  Team
                </button>
                <button
                  className="px-2 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => handleUpdate(site)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap"
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

      {/* Address Preview Modal */}
      {addressPreview.open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Full address"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setAddressPreview({ open: false, siteName: "", address: "" });
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {addressPreview.siteName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Full address</div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg px-2 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                aria-label="Close"
                onClick={() =>
                  setAddressPreview({ open: false, siteName: "", address: "" })
                }
              >
                ×
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="text-sm text-gray-800 break-words whitespace-pre-wrap">
                {addressPreview.address}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() =>
                    setAddressPreview({
                      open: false,
                      siteName: "",
                      address: "",
                    })
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            onSiteSaved={() => {
              const isEdit = !!editingSite;
              setRefreshCounter((c) => c + 1);
              if (isEdit) toast.info("Site updated successfully");
              else toast.success("Site added successfully");
            }}
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
