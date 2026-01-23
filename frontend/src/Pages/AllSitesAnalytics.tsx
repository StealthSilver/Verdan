import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
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
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

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
  TimeScale,
  Filler,
);

const VERDAN_GREEN = "#48845C";

// Modern chart color palette
const CHART_COLORS = {
  primary: "#48845C",
  emerald: "#10B981",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  blue: "#3B82F6",
  indigo: "#6366F1",
  purple: "#8B5CF6",
  amber: "#F59E0B",
  rose: "#F43F5E",
  gray: "#9CA3AF",
};

interface Tree {
  _id: string;
  treeName: string;
  treeType?: string;
  coordinates: { lat: number; lng: number };
  datePlanted: string;
  timestamp?: string;
  status: string;
  verified: boolean;
}

interface Site {
  _id: string;
  name: string;
  status: "active" | "inactive";
  address: string;
  trees?: Tree[];
}

export default function AllSitesAnalytics() {
  const navigate = useNavigate();
  const { token, role, logout } = useAuth();

  const [sites, setSites] = useState<Site[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
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

  // Fetch all sites + their trees; auto-refresh every 15s
  useEffect(() => {
    let timer: number | undefined;
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const isInitialLoad = !initialLoadDone.current;
      if (isInitialLoad) setLoading(true);
      setError("");
      try {
        // Fetch all sites
        const sitesRes = await API.get<Site[]>("/admin/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allSites = sitesRes.data;

        // Fetch trees for each site
        const sitesWithTrees = await Promise.all(
          allSites.map(async (site) => {
            try {
              const treesRes = await API.get(`/admin/sites/${site._id}/trees`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return { ...site, trees: treesRes.data?.trees || [] };
            } catch (err) {
              console.error(`Failed to fetch trees for site ${site._id}`, err);
              return { ...site, trees: [] };
            }
          }),
        );

        setSites(sitesWithTrees);
        if (!initialLoadDone.current) initialLoadDone.current = true;
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load analytics");
      } finally {
        if (isInitialLoad) setLoading(false);
      }
    };

    fetchData();
    if (!hasScheduledRefresh.current) {
      timer = window.setInterval(fetchData, 15000);
      hasScheduledRefresh.current = true;
    }
    return () => {
      if (timer) window.clearInterval(timer);
      hasScheduledRefresh.current = false;
    };
  }, [token]);

  // Calculate total trees across all sites
  const totalTrees = useMemo(() => {
    return sites.reduce((sum, site) => sum + (site.trees?.length || 0), 0);
  }, [sites]);

  // Trees per site comparison
  const treesPerSite = useMemo(() => {
    return sites.map((site) => ({
      siteName: site.name,
      count: site.trees?.length || 0,
      status: site.status,
    }));
  }, [sites]);

  // Tree type distribution across all sites
  const allTreeTypes = useMemo(() => {
    const typeMap = new Map<string, number>();
    sites.forEach((site) => {
      site.trees?.forEach((tree) => {
        const type = tree.treeType || "Unknown";
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });
    });
    return Array.from(typeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 types
  }, [sites]);

  // Verification stats across all sites
  const verificationStats = useMemo(() => {
    let verified = 0;
    let unverified = 0;
    sites.forEach((site) => {
      site.trees?.forEach((tree) => {
        if (tree.verified) verified++;
        else unverified++;
      });
    });
    return { verified, unverified };
  }, [sites]);

  // Health status across all sites
  const healthStatus = useMemo(() => {
    const statusMap = new Map<string, number>();
    const orderedStatuses = ["healthy", "sick", "dead", "needs attention"];

    orderedStatuses.forEach((s) => statusMap.set(s, 0));

    sites.forEach((site) => {
      site.trees?.forEach((tree) => {
        const raw = (tree.status || "").trim().toLowerCase();
        const s =
          raw === "need attention" || raw === "needs_attention"
            ? "needs attention"
            : raw;
        if (orderedStatuses.includes(s)) {
          statusMap.set(s, (statusMap.get(s) || 0) + 1);
        }
      });
    });

    return orderedStatuses.map(
      (s) => [s, statusMap.get(s) || 0] as [string, number],
    );
  }, [sites]);

  // Planting timeline across all sites
  const plantingTimeline = useMemo(() => {
    const dateMap = new Map<string, number>();
    sites.forEach((site) => {
      site.trees?.forEach((tree) => {
        const d = new Date(tree.datePlanted);
        const key = new Date(d.getFullYear(), d.getMonth(), d.getDate())
          .toISOString()
          .slice(0, 10);
        dateMap.set(key, (dateMap.get(key) || 0) + 1);
      });
    });
    return Array.from(dateMap.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [sites]);

  // Site comparison - top performers
  const topSites = useMemo(() => {
    return [...treesPerSite].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [treesPerSite]);

  // Active vs Inactive sites
  const siteStatusCounts = useMemo(() => {
    const active = sites.filter((s) => s.status === "active").length;
    const inactive = sites.filter((s) => s.status === "inactive").length;
    return { active, inactive };
  }, [sites]);

  // Chart Data Configurations

  // 1. Trees per site - Bar chart
  const treesPerSiteData = useMemo(() => {
    const labels = treesPerSite.map((s) => s.siteName);
    const data = treesPerSite.map((s) => s.count);
    const colors = labels.map((_, i) => {
      const colorKeys = Object.keys(CHART_COLORS);
      return CHART_COLORS[
        colorKeys[i % colorKeys.length] as keyof typeof CHART_COLORS
      ];
    });

    return {
      labels,
      datasets: [
        {
          label: "Trees Planted",
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [treesPerSite]);

  // 2. Tree types distribution - Bar chart
  const treeTypesData = useMemo(() => {
    const labels = allTreeTypes.map((e) => e[0]);
    const data = allTreeTypes.map((e) => e[1]);
    const colors = [
      CHART_COLORS.primary,
      CHART_COLORS.emerald,
      CHART_COLORS.teal,
      CHART_COLORS.cyan,
      CHART_COLORS.blue,
      CHART_COLORS.indigo,
      CHART_COLORS.purple,
      CHART_COLORS.amber,
      CHART_COLORS.rose,
      CHART_COLORS.gray,
    ];

    return {
      labels,
      datasets: [
        {
          label: "Tree Count",
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderColor: labels.map((_, i) => colors[i % colors.length]),
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [allTreeTypes]);

  // 3. Verification status - Doughnut chart
  const verificationData = useMemo(() => {
    return {
      labels: ["Verified", "Unverified"],
      datasets: [
        {
          label: "Trees",
          data: [verificationStats.verified, verificationStats.unverified],
          backgroundColor: [VERDAN_GREEN, CHART_COLORS.gray],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 4,
          hoverBackgroundColor: [CHART_COLORS.emerald, "#6B7280"],
          hoverOffset: 8,
        },
      ],
    };
  }, [verificationStats]);

  // 4. Health status - Bar chart
  const healthData = useMemo(() => {
    const labels = healthStatus.map((e) => e[0]);
    const data = healthStatus.map((e) => e[1]);
    const statusColors: { [key: string]: string } = {
      healthy: CHART_COLORS.emerald,
      sick: CHART_COLORS.amber,
      dead: CHART_COLORS.rose,
      "needs attention": CHART_COLORS.purple,
    };

    return {
      labels,
      datasets: [
        {
          label: "Tree Count",
          data,
          backgroundColor: labels.map(
            (label) => statusColors[label] || CHART_COLORS.gray,
          ),
          borderColor: labels.map(
            (label) => statusColors[label] || CHART_COLORS.gray,
          ),
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [healthStatus]);

  // 5. Planting timeline - Line chart
  const timelineData = useMemo(() => {
    const labels = plantingTimeline.map((e) => e[0]);
    const data = plantingTimeline.map((e) => e[1]);

    return {
      labels,
      datasets: [
        {
          label: "Trees Planted",
          data,
          borderColor: VERDAN_GREEN,
          backgroundColor: "rgba(72, 132, 92, 0.15)",
          pointBackgroundColor: VERDAN_GREEN,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
          borderWidth: 3,
        },
      ],
    };
  }, [plantingTimeline]);

  // 6. Site status - Pie chart
  const siteStatusData = useMemo(() => {
    return {
      labels: ["Active Sites", "Inactive Sites"],
      datasets: [
        {
          label: "Sites",
          data: [siteStatusCounts.active, siteStatusCounts.inactive],
          backgroundColor: [CHART_COLORS.emerald, CHART_COLORS.gray],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 4,
          hoverBackgroundColor: [CHART_COLORS.teal, "#6B7280"],
          hoverOffset: 8,
        },
      ],
    };
  }, [siteStatusCounts]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 13 },
        padding: 16,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6B7280",
          font: { size: 11 },
          padding: 8,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        min: 0,
        ticks: { color: "#6B7280", font: { size: 11 }, padding: 12 },
        grid: { color: "rgba(229, 231, 235, 0.5)", lineWidth: 1 },
        border: { display: false },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#374151",
          font: { size: 13, weight: 500 as const },
          padding: 24,
          usePointStyle: true,
          pointStyle: "circle" as const,
        },
      },
      title: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 16,
        cornerRadius: 12,
      },
    },
  };

  // Loading state
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
            Loading site analytics...
          </p>
        </div>
      </div>
    );

  // Error state
  if (error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-3 text-sm font-medium text-primary-foreground rounded-xl transition-all hover:opacity-90 shadow-lg"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  const statCards = [
    {
      label: "Total Sites",
      value: sites.length,
      color: VERDAN_GREEN,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      label: "Total Trees",
      value: totalTrees,
      color: CHART_COLORS.emerald,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      label: "Active Sites",
      value: siteStatusCounts.active,
      color: CHART_COLORS.blue,
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      label: "Verified Trees",
      value: verificationStats.verified,
      color: CHART_COLORS.purple,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
  ];

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

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FaArrowLeft className="text-xs" />
                  <span className="hidden sm:block">Back to Dashboard</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Site Comparison Analytics
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Compare tree plantation data across all sites
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${stat.color}15`,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Performers Section */}
        {topSites.length > 0 && (
          <div className="mb-8 bg-card rounded-2xl border border-border p-6 shadow-card">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Top Performing Sites
            </h2>
            <div className="space-y-3">
              {topSites.map((site, index) => (
                <div
                  key={site.siteName}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg"
                    style={{
                      backgroundColor:
                        index === 0
                          ? "#FFD700"
                          : index === 1
                            ? "#C0C0C0"
                            : index === 2
                              ? "#CD7F32"
                              : VERDAN_GREEN,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {site.siteName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {site.count} trees planted
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      site.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {site.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trees per Site - Bar Chart */}
          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Trees by Site
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Comparison of plantation across sites
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="h-[320px]">
              <Bar data={treesPerSiteData} options={commonOptions} />
            </div>
          </div>

          {/* Tree Types Distribution - Bar Chart */}
          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all animate-slide-up"
            style={{ animationDelay: "500ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Species Distribution
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Top tree species across all sites
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${CHART_COLORS.emerald}15` }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: CHART_COLORS.emerald }}
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
            <div className="h-[320px]">
              <Bar data={treeTypesData} options={commonOptions} />
            </div>
          </div>

          {/* Planting Timeline - Line Chart */}
          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all animate-slide-up"
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Planting Timeline
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Trees planted over time (all sites)
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${CHART_COLORS.blue}15` }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: CHART_COLORS.blue }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="h-[320px]">
              <Line data={timelineData} options={commonOptions} />
            </div>
          </div>

          {/* Health Status - Bar Chart */}
          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all animate-slide-up"
            style={{ animationDelay: "700ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Overall Health Status
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tree health across all sites
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.emerald }}
                ></span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.amber }}
                ></span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.rose }}
                ></span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.purple }}
                ></span>
              </div>
            </div>
            <div className="h-[320px]">
              <Bar data={healthData} options={commonOptions} />
            </div>
          </div>

          {/* Verification Status - Doughnut Chart */}
          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all animate-slide-up"
            style={{ animationDelay: "800ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Verification Status
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Verified vs unverified trees
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${CHART_COLORS.purple}15` }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: CHART_COLORS.purple }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <div className="h-[320px]">
              <Doughnut data={verificationData} options={pieOptions} />
            </div>
          </div>

          {/* Site Status - Pie Chart */}
          <div
            className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all animate-slide-up"
            style={{ animationDelay: "900ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Site Status Distribution
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Active vs inactive sites
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${CHART_COLORS.teal}15` }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: CHART_COLORS.teal }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
            </div>
            <div className="h-[320px]">
              <Doughnut data={siteStatusData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {sites.length === 0 && (
          <div className="bg-card rounded-2xl border border-border py-20 text-center mt-8 shadow-card animate-fade-in">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${VERDAN_GREEN}15` }}
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
            <h3 className="text-xl font-bold text-foreground mb-3">
              No Sites Available
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create sites and plant trees to see comprehensive analytics and
              comparisons.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
