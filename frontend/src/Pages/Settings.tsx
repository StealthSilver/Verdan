import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { avatarDataUrl } from "../utils/avatars";
import { messageFromUnknown } from "../utils/apiError";
import NotificationBell from "../components/NotificationBell/NotificationBell";

const VERDAN_GREEN = "#48845C";

type Preferences = {
  autoRefresh: boolean;
  refreshIntervalSec: 15 | 30 | 60;
  compactMode: boolean;
};

const DEFAULT_PREFS: Preferences = {
  autoRefresh: true,
  refreshIntervalSec: 15,
  compactMode: false,
};

const PREFS_KEY = "harit:preferences:v1";

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    const interval =
      parsed.refreshIntervalSec === 30 || parsed.refreshIntervalSec === 60
        ? parsed.refreshIntervalSec
        : 15;
    return {
      autoRefresh: parsed.autoRefresh ?? DEFAULT_PREFS.autoRefresh,
      refreshIntervalSec: interval,
      compactMode: parsed.compactMode ?? DEFAULT_PREFS.compactMode,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: Preferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

type UserMe = { name: string; email: string; role: string; _id: string };

export default function Settings() {
  const navigate = useNavigate();
  const { token, logout, role, avatarId } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserMe | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [prefs, setPrefs] = useState<Preferences>(() => loadPrefs());

  const dashboardPath = useMemo(() => {
    if (role === "admin") return "/admin/Dashboard";
    if (role === "user") return "/user/dashboard";
    return "/";
  }, [role]);

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

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const run = async () => {
      try {
        setLoadingUser(true);
        const res = await API.get<UserMe>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setError("");
      } catch (err: unknown) {
        setError(messageFromUnknown(err, "Failed to fetch user data"));
      } finally {
        setLoadingUser(false);
      }
    };
    run();
  }, [token, navigate]);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const handleLogout = () => {
    logout();
    navigate("/");
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

            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={avatarDataUrl(avatarId)}
                  alt="Profile avatar"
                  className="h-8 w-8 rounded-xl border border-gray-200 bg-white"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="font-medium text-gray-800 text-sm hidden sm:block">
                  {user?.name || "User"}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="font-semibold text-sm text-gray-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user?.email || ""}
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account and preferences
            </p>
          </div>
          <button
            onClick={() => navigate(dashboardPath)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
          >
            ← Back to Dashboard
          </button>
        </div>

        {loadingUser && !user && (
          <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-600">
            Loading settings...
          </div>
        )}

        {error && !user && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Two-column on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Basic account information
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                {user?.role || role || "user"}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </div>
                <div className="mt-1 text-sm text-gray-900 break-words">
                  {user?.name || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </div>
                <div className="mt-1 text-sm text-gray-900 break-words">
                  {user?.email || "—"}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors active:scale-95"
                >
                  Open Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem(PREFS_KEY);
                      setPrefs(DEFAULT_PREFS);
                    } catch {
                      // ignore
                    }
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
                >
                  Reset preferences
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            <p className="text-sm text-gray-500 mt-1">
              These settings affect how the portal behaves on this device
            </p>

            <div className="mt-5 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    Auto-refresh dashboards
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Keep data updated automatically
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPrefs((p) => ({ ...p, autoRefresh: !p.autoRefresh }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    prefs.autoRefresh ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                  aria-pressed={prefs.autoRefresh}
                  aria-label="Toggle auto-refresh"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      prefs.autoRefresh ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">
                    Refresh interval
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    How often to refresh dashboards (when enabled)
                  </div>
                </div>
                <select
                  value={prefs.refreshIntervalSec}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      refreshIntervalSec: (Number(e.target.value) as 15 | 30 | 60),
                    }))
                  }
                  className="w-full sm:w-44 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                  disabled={!prefs.autoRefresh}
                >
                  <option value={15}>Every 15s</option>
                  <option value={30}>Every 30s</option>
                  <option value={60}>Every 60s</option>
                </select>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">Compact mode</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Tighter spacing for smaller screens
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPrefs((p) => ({ ...p, compactMode: !p.compactMode }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    prefs.compactMode ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                  aria-pressed={prefs.compactMode}
                  aria-label="Toggle compact mode"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      prefs.compactMode ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <div className="font-medium text-gray-900">Note</div>
                <div className="mt-1">
                  Some pages may still use fixed refresh timers. This settings
                  page stores your preferences now so we can progressively apply
                  them across the portal.
                </div>
              </div>
            </div>
          </div>

          {/* Admin-only */}
          {(user?.role || role) === "admin" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Admin settings
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Quick links for admin workflows
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/sites/analytics")}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-opacity active:scale-95"
                  style={{ backgroundColor: VERDAN_GREEN }}
                >
                  Open All Sites Analytics
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/Dashboard")}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors active:scale-95"
                >
                  Open Admin Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
                >
                  Manage Avatar (Profile)
                </button>
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div className="bg-white rounded-lg border border-red-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>
            <p className="text-sm text-gray-600 mt-1">
              You can safely log out from this device.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700">
                Logging out will remove your session from this browser.
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

