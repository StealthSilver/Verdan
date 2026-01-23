import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../api";

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
  const { token, logout, role } = useAuth();
  const [user, setUser] = useState<UserMe | null>(null);
  const [adminSites, setAdminSites] = useState<AdminSite[]>([]);
  const [userSite, setUserSite] = useState<UserSiteDashboard | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debug: Log auth state
  useEffect(() => {
    console.log("Profile - Auth state:", { token: !!token, role });
  }, [token, role]);

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
        console.log("Fetching user profile data...");
        const res = await API.get<UserMe>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User profile data received:", res.data);
        setUser(res.data);
        setError("");
      } catch (err: any) {
        console.error("Failed to fetch user data:", err);
        const errorMsg =
          err?.response?.data?.message || "Failed to fetch user data";
        console.error("Error message:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoadingUser(false);
      }
    };
    run();
  }, [token]);

  // Fetch sites depending on role
  useEffect(() => {
    const fetchSites = async () => {
      if (!token || !role) {
        setLoadingSites(false);
        return;
      }
      try {
        setLoadingSites(true);
        console.log(`Fetching sites for role: ${role}`);
        if (role === "admin") {
          const res = await API.get<AdminSite[]>("/admin/sites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Admin sites received:", res.data);
          setAdminSites(res.data);
        } else if (role === "user") {
          const res = await API.get<UserSiteDashboard>("/user/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("User site received:", res.data);
          setUserSite(res.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch site data:", err);
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
              <FaUserCircle className="text-5xl text-gray-300" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {user.role}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ID: {user._id.slice(0, 8)}...
                  </span>
                </div>
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
