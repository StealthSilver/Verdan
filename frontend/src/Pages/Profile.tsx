import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { avatarDataUrl } from "../utils/avatars";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { messageFromUnknown } from "../utils/apiError";
import { useToast } from "../context/ToastContext";
import NotificationBell from "../components/NotificationBell/NotificationBell";

const VERDAN_GREEN = "#48845C";

interface UserMe {
  _id: string;
  name: string;
  email: string;
  role: string;
  siteId?: string; // for non-admin users
  designation?: string;
  gender?: string;
  organization?: string;
}

interface AdminSite {
  _id: string;
  name: string;
  address: string;
  status: string;
  coordinates?: { lat: string; lng: string };
}

interface UserSiteDashboard {
  siteId: string;
  siteName: string;
  location?: string; // controller uses location field, site model uses address
  status: string;
}

export default function Profile() {
  const { token, logout, role, email: authEmail, avatarId, setAvatarId } = useAuth();
  const toast = useToast();
  const [user, setUser] = useState<UserMe | null>(null);
  const [adminSites, setAdminSites] = useState<AdminSite[]>([]);
  const [userSite, setUserSite] = useState<UserSiteDashboard | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [pendingAvatarId, setPendingAvatarId] = useState<number>(avatarId);

  // Outside click for dropdown
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

  // Fetch basic user info
  useEffect(() => {
    const run = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }
      try {
        setLoadingUser(true);
        const res = await API.get<UserMe>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setError("");
      } catch (err: unknown) {
        const errorMsg = messageFromUnknown(err, "Failed to fetch user data");
        setError(errorMsg);
      } finally {
        setLoadingUser(false);
      }
    };
    run();
  }, [token]);

  useEffect(() => {
    setPendingAvatarId(avatarId);
  }, [avatarId]);

  // Fetch sites depending on role
  useEffect(() => {
    const fetchSites = async () => {
      if (!token || !role) {
        setLoadingSites(false);
        return;
      }
      try {
        setLoadingSites(true);
        if (role === "admin") {
          const res = await API.get<AdminSite[]>("/admin/sites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdminSites(res.data);
        } else if (role === "user") {
          const res = await API.get<UserSiteDashboard>("/user/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserSite(res.data);
        }
      } catch {
        // Non-fatal; profile still shows basic info
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, [token, role]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // If no token, redirect to login
  if (!token) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR (same style as dashboard) */}
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

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Profile
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Your account information and assigned site details
            </p>
          </div>
          <button
            onClick={() =>
              navigate(
                role === "admin" ? "/admin/Dashboard" : "/user/dashboard",
              )
            }
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Loading State */}
        {loadingUser && !user && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
                <div
                  className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent animate-spin"
                  style={{ borderTopColor: VERDAN_GREEN }}
                />
              </div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !user && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* User Info Card */}
        {user && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="group relative"
                aria-label="Change avatar"
                title="Change avatar"
              >
                <img
                  src={avatarDataUrl(avatarId)}
                  alt="Profile avatar"
                  className="h-16 w-16 rounded-2xl border border-gray-200 bg-white shadow-sm"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/5 transition-colors" />
              </button>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {user.role}
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 max-w-full">
                    <span className="shrink-0">ID:</span>
                    <span className="font-mono break-all">{user._id}</span>
                    <button
                      type="button"
                      className="ml-1 shrink-0 rounded-md p-1 hover:bg-blue-200/50 transition-colors"
                      aria-label="Copy user ID"
                      title="Copy user ID"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(user._id);
                          toast.info("ID copied");
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M5.75 3A2.75 2.75 0 0 0 3 5.75v7.5A2.75 2.75 0 0 0 5.75 16h3.5A2.75 2.75 0 0 0 12 13.25v-7.5A2.75 2.75 0 0 0 9.25 3h-3.5z" />
                        <path d="M12.75 4.5c.2.39.31.84.31 1.31v7.44c0 1.8-1.45 3.25-3.25 3.25H6.5a.75.75 0 0 0 .75.75h3.5A2.75 2.75 0 0 0 13.5 14.5V7a2.75 2.75 0 0 0-.75-1.89z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Modal */}
        {avatarModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label="Choose avatar"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setAvatarModalOpen(false);
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    Choose your avatar
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Pixel plant characters (saved to your account)
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg px-2 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  aria-label="Close"
                  onClick={() => setAvatarModalOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="px-5 py-5">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }, (_, id) => id).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPendingAvatarId(id)}
                      className={`rounded-2xl border p-2 transition-all hover:shadow-sm ${
                        pendingAvatarId === id
                          ? "border-[#48845C] ring-2 ring-[#48845C]/20 bg-emerald-50/60"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                      aria-label={`Choose avatar ${id + 1}`}
                    >
                      <img
                        src={avatarDataUrl(id)}
                        alt=""
                        className="h-14 w-14 mx-auto"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setAvatarModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: VERDAN_GREEN }}
                    onClick={async () => {
                      if (!token) return;
                      try {
                        await API.patch(
                          "/auth/me/avatar",
                          { avatarId: pendingAvatarId },
                          { headers: { Authorization: `Bearer ${token}` } },
                        );
                        setAvatarId(pendingAvatarId);
                        toast.info("Avatar updated");
                        setAvatarModalOpen(false);
                      } catch (err: unknown) {
                        toast.error(
                          messageFromUnknown(err, "Failed to update avatar"),
                        );
                      }
                    }}
                  >
                    Save
                  </button>
                </div>

                {!authEmail && (
                  <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    Email isn’t loaded yet, but avatar will still be saved for your
                    account when you’re authenticated.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sites Section */}
        {user && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assigned {role === "admin" ? "Sites" : "Site"}
            </h3>
            {role === "admin" && (
              <div className="space-y-4">
                {loadingSites && adminSites.length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    Loading sites...
                  </div>
                )}
                {!loadingSites && adminSites.length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    No sites assigned yet.
                  </div>
                )}
                {adminSites.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-sm text-gray-600 mt-1 truncate max-w-md">
                        {s.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.coordinates &&
                        s.coordinates.lat &&
                        s.coordinates.lng && (
                          <span className="text-xs text-gray-500 font-mono">
                            ({parseFloat(s.coordinates.lat).toFixed(2)},{" "}
                            {parseFloat(s.coordinates.lng).toFixed(2)})
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {role === "user" && (
              <div>
                {loadingSites && !userSite && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    Loading site...
                  </div>
                )}
                {!loadingSites && !userSite && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    No site assigned.
                  </div>
                )}
                {userSite && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <p className="font-medium text-gray-900">
                      {userSite.siteName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {userSite.location || "Location unavailable"}
                    </p>
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userSite.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {userSite.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
