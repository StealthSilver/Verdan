import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";

const VERDAN_GREEN = "#48845C";

interface UserMe {
  id: string;
  name: string;
  email: string;
  role: string;
  siteId?: string; // for non-admin users
}

interface AdminSite {
  _id: string;
  name: string;
  address: string;
  status: string;
  coordinates?: { lat: number; lng: number };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      if (!token) return;
      try {
        setLoading(true);
        const res = await API.get<UserMe>("/auth/me", {
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

  // Fetch sites depending on role
  useEffect(() => {
    const fetchSites = async () => {
      if (!token) return;
      if (!role) return;
      try {
        setLoading(true);
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
      } catch (err: any) {
        // Non-fatal; profile still shows basic info
        setError(err?.response?.data?.message || "Failed to fetch site data");
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, [token, role]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading && !user)
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
            Loading profile...
          </p>
        </div>
      </div>
    );

  if (error && !user)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR (same style as dashboard) */}
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
                role === "admin" ? "/admin/Dashboard" : "/user/dashboard"
              )
            }
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <FaUserCircle className="text-5xl text-gray-300" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.name}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">{user?.email}</p>
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sites Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Assigned {role === "admin" ? "Sites" : "Site"}
          </h3>
          {role === "admin" && (
            <div className="space-y-4">
              {adminSites.length === 0 && (
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
                    {s.coordinates && (
                      <span className="text-xs text-gray-500 font-mono">
                        ({s.coordinates.lat.toFixed(2)},{" "}
                        {s.coordinates.lng.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {role === "user" && (
            <div>
              {!userSite && (
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
      </div>
    </div>
  );
}
