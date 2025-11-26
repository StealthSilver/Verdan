import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";

// Chart.js + React wrapper
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const VERDAN_GREEN = "#48845C";

interface Tree {
  _id: string;
  treeName: string;
  treeType?: string;
  coordinates: { lat: number; lng: number };
  datePlanted: string; // ISO
  timestamp?: string; // ISO
  status: string;
  verified: boolean;
}

interface Site {
  _id: string;
  name: string;
  status: "active" | "inactive";
  address: string;
}

export default function SiteAnalytics() {
  const { siteId: rawId } = useParams<{ siteId: string }>();
  const siteId = rawId ? decodeURIComponent(rawId).trim() : undefined;
  const navigate = useNavigate();
  const { token, role, logout } = useAuth();

  const [site, setSite] = useState<Site | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasScheduledRefresh = useRef(false);
  const initialLoadDone = useRef(false);

  // Guard: admin only
  useEffect(() => {
    if (role === "user") {
      navigate("/user/dashboard");
    }
  }, [role, navigate]);

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
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch site + trees; auto-refresh every 15s (without full-page loading)
  useEffect(() => {
    let timer: number | undefined;
    const fetchData = async () => {
      if (!token || !siteId) {
        // prerequisites missing; don't keep spinner forever
        setLoading(false);
        return;
      }
      // Show loading only on the very first fetch
      const isInitialLoad = !initialLoadDone.current;
      if (isInitialLoad) setLoading(true);
      setError("");
      try {
        const siteRes = await API.get(`/admin/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSite(siteRes.data);
        const treesRes = await API.get(`/admin/sites/${siteId}/trees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrees(treesRes.data || []);
        if (!initialLoadDone.current) initialLoadDone.current = true;
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load analytics");
      } finally {
        // Stop showing the spinner after the first fetch completes
        if (isInitialLoad) setLoading(false);
      }
    };

    fetchData();
    // Avoid duplicate intervals in StrictMode by gating with ref
    if (!hasScheduledRefresh.current) {
      timer = window.setInterval(fetchData, 15000);
      hasScheduledRefresh.current = true;
    }
    return () => {
      if (timer) window.clearInterval(timer);
      hasScheduledRefresh.current = false;
    };
  }, [token, siteId]);

  // Transformations
  const treesByDate = useMemo(() => {
    const map = new Map<string, number>();
    trees.forEach((t) => {
      const d = new Date(t.datePlanted);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        .toISOString()
        .slice(0, 10); // YYYY-MM-DD
      map.set(key, (map.get(key) || 0) + 1);
    });
    const entries = Array.from(map.entries()).sort((a, b) =>
      a[0] < b[0] ? -1 : 1
    );
    return entries;
  }, [trees]);

  const treesByType = useMemo(() => {
    const map = new Map<string, number>();
    trees.forEach((t) => {
      const type = t.treeType || "Unknown";
      map.set(type, (map.get(type) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [trees]);

  const verificationCounts = useMemo(() => {
    const verified = trees.filter((t) => t.verified).length;
    const unverified = trees.filter((t) => !t.verified).length;
    return [
      ["Verified", verified],
      ["Unverified", unverified],
    ];
  }, [trees]);

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    const allowedStatuses = ["healthy", "dead", "sick", "needs attention"];
    trees.forEach((t) => {
      const s = t.status?.toLowerCase() || "unknown";
      if (allowedStatuses.includes(s)) {
        map.set(s, (map.get(s) || 0) + 1);
      }
    });
    return Array.from(map.entries());
  }, [trees]);

  // Chart data with Verdan brand colors
  const lineData = useMemo(() => {
    const labels = treesByDate.map((e) => e[0]);
    const data = treesByDate.map((e) => e[1]);
    return {
      labels,
      datasets: [
        {
          label: "Trees Planted",
          data,
          borderColor: VERDAN_GREEN,
          backgroundColor: `${VERDAN_GREEN}15`,
          pointBackgroundColor: VERDAN_GREEN,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [treesByDate]);

  const typeBarData = useMemo(() => {
    const labels = treesByType.map((e) => e[0]);
    const data = treesByType.map((e) => e[1]);
    // Create a cohesive color palette that complements Verdan green
    const treeTypeColors = [
      "#48845C", // Main Verdan green
      "#5B9A6F", // Lighter green
      "#6B8E7A", // Muted green
      "#7AA68C", // Sage green
      "#8BB39E", // Light sage
      "#4A7C59", // Forest green
      "#5C8A69", // Medium green
      "#3E6B4A", // Dark forest
      "#6BA382", // Mint green
      "#859B8C", // Gray green
    ];
    return {
      labels,
      datasets: [
        {
          label: "Tree Count",
          data,
          backgroundColor: labels.map(
            (_, i) => `${treeTypeColors[i % treeTypeColors.length]}E6`
          ),
          borderColor: labels.map(
            (_, i) => treeTypeColors[i % treeTypeColors.length]
          ),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [treesByType]);

  const verificationPieData = useMemo(() => {
    const labels = verificationCounts.map((e) => e[0]);
    const data = verificationCounts.map((e) => e[1]);
    return {
      labels,
      datasets: [
        {
          label: "Trees",
          data,
          backgroundColor: [
            VERDAN_GREEN, // Verdan green for verified
            "#e5e7eb", // Light gray for unverified
          ],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 3,
          hoverBackgroundColor: [
            "#5B9A6F", // Lighter green on hover
            "#d1d5db", // Darker gray on hover
          ],
        },
      ],
    };
  }, [verificationCounts]);

  const statusBarData = useMemo(() => {
    const labels = statusCounts.map((e) => e[0]);
    const data = statusCounts.map((e) => e[1]);
    // Status-specific colors for health indicators
    const statusColors: { [key: string]: string } = {
      healthy: "#22c55e", // Green for healthy
      sick: "#f59e0b", // Amber/yellow for sick
      dead: "#ef4444", // Red for dead
      "needs attention": "#f97316", // Orange for needs attention
    };

    return {
      labels,
      datasets: [
        {
          label: "Tree Count",
          data,
          backgroundColor: labels.map(
            (label) => `${statusColors[label] || "#6b7280"}E6`
          ),
          borderColor: labels.map((label) => statusColors[label] || "#6b7280"),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [statusCounts]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#374151",
          font: {
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle" as const,
        },
      },
      title: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        borderColor: VERDAN_GREEN,
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#f3f4f6",
          lineWidth: 1,
        },
        border: {
          color: "#e5e7eb",
          width: 1,
        },
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#f9fafb",
          lineWidth: 1,
        },
        border: {
          color: "#e5e7eb",
          width: 1,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#374151",
          font: {
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle" as const,
        },
      },
      title: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        borderColor: VERDAN_GREEN,
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: VERDAN_GREEN, borderTopColor: "transparent" }}
          />
          <p className="text-gray-600 text-sm">Loading analytics...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced navbar */}
      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ borderBottomColor: VERDAN_GREEN + "15" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={verdanLogo} alt="Verdan Logo" className="h-7" />

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaArrowLeft className="text-gray-600" />
                <span className="font-medium text-gray-800 text-sm hidden sm:block">
                  Back
                </span>
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaUserCircle className="text-2xl text-gray-600" />
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
                        onClick={() => {
                          navigate("/profile");
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        Profile
                      </li>
                      <li
                        onClick={() => {
                          navigate("/admin/dashboard");
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        Dashboard
                      </li>
                      <li
                        onClick={() => {
                          logout();
                          navigate("/");
                        }}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER WITH SITE INFO */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Site Analytics
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  site?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {site?.status || "Unknown"}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              ID: {site?._id || siteId}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {site?.name} {site?.address && `• ${site.address}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Total Trees</p>
              <p className="text-lg font-bold text-gray-900">{trees.length}</p>
            </div>
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Trees
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {trees.length}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${VERDAN_GREEN}15` }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: VERDAN_GREEN }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v18m9-9H3"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Verified
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {verificationCounts.find((v) => v[0] === "Verified")?.[1] ||
                    0}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tree Types
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {treesByType.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Days Active
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {treesByDate.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line: Trees per day */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 h-[400px]">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
              Trees Planted Over Time
            </h2>
            <div className="h-[320px]">
              <Line data={lineData} options={commonOptions} />
            </div>
          </div>

          {/* Bar: Types */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 h-[400px]">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
              Trees by Type
            </h2>
            <div className="h-[320px]">
              <Bar data={typeBarData} options={commonOptions} />
            </div>
          </div>

          {/* Pie: Verification distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 h-[400px]">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
              Verification Status
            </h2>
            <div className="h-[320px]">
              <Pie data={verificationPieData} options={pieOptions} />
            </div>
          </div>

          {/* Bar: Status distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 h-[400px]">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
              Tree Health Status
            </h2>
            <div className="h-[320px]">
              <Bar data={statusBarData} options={commonOptions} />
            </div>
          </div>
        </div>

        {trees.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 py-16 text-center mt-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: VERDAN_GREEN + "15" }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: VERDAN_GREEN }}
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
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Analytics Available
            </h3>
            <p className="text-gray-600 mb-4">
              Plant trees at this site to see detailed analytics and insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
