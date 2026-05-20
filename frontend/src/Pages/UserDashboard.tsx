import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { avatarDataUrl } from "../utils/avatars";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import { messageFromUnknown } from "../utils/apiError";
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

export default function UserDashboard() {
  const { token, logout, avatarId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [addressPreview, setAddressPreview] = useState<{
    open: boolean;
    siteName: string;
    address: string;
  }>({ open: false, siteName: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // local UI state minimal for user view
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Fetch assigned sites
  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const res = await API.get<Site[]>("/user/sites/assigned", {
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
  }, [token, location.pathname]);

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

  // no add/edit/delete at user level; actions are plant-scoped

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
                    <p className="font-semibold text-sm text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <ul className="py-1">
                    <li
                      onClick={() =>
                        navigate("/notifications", {
                          state: { from: location.pathname },
                        })
                      }
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      Notifications
                    </li>
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
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Assigned Sites
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor your assigned sites
            </p>
          </div>
        </div>

        {/* SITES TABLE - Desktop */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-hidden">
            <table className="w-full table-fixed divide-y divide-gray-200">
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
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 min-w-0">
                        <div
                          className="text-sm text-gray-700 max-w-[20rem] truncate"
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          onClick={() => navigate(`/user/site/${site._id}`)}
                        >
                          Manage Plants
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
                  <h3
                    className="font-semibold text-gray-900"
                    title={site.name}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {site.name}
                  </h3>
                  <div className="mt-1 flex items-start gap-2 min-w-0">
                    <p className="text-xs text-gray-500 truncate" title={site.address}>
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
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  onClick={() => navigate(`/user/site/${site._id}`)}
                >
                  Manage Plants
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sites.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
            <p className="text-gray-500 mb-4">No sites assigned yet</p>
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
    </div>
  );
}
