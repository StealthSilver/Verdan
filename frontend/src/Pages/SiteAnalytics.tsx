import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";
import { FaArrowLeft } from "react-icons/fa";

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
  const { token, role } = useAuth();

  const [site, setSite] = useState<Site | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const hasScheduledRefresh = useRef(false);
  const initialLoadDone = useRef(false);

  // Guard: admin only
  useEffect(() => {
    if (role === "user") {
      navigate("/user/dashboard");
    }
  }, [role, navigate]);

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
    trees.forEach((t) => {
      const s = t.status || "unknown";
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries());
  }, [trees]);

  // Chart data
  const lineData = useMemo(() => {
    const labels = treesByDate.map((e) => e[0]);
    const data = treesByDate.map((e) => e[1]);
    return {
      labels,
      datasets: [
        {
          label: "Trees Planted per Day",
          data,
          borderColor: VERDAN_GREEN,
          backgroundColor: "rgba(72,132,92,0.2)",
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    };
  }, [treesByDate]);

  const typeBarData = useMemo(() => {
    const labels = treesByType.map((e) => e[0]);
    const data = treesByType.map((e) => e[1]);
    return {
      labels,
      datasets: [
        {
          label: "Trees by Type",
          data,
          backgroundColor: labels.map(() => "rgba(72,132,92,0.25)"),
          borderColor: labels.map(() => VERDAN_GREEN),
          borderWidth: 1,
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
          label: "Verification Status",
          data,
          backgroundColor: [
            "#22c55e", // Green for verified
            "#9ca3af", // Gray for unverified
          ],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 2,
        },
      ],
    };
  }, [verificationCounts]);

  const statusBarData = useMemo(() => {
    const labels = statusCounts.map((e) => e[0]);
    const data = statusCounts.map((e) => e[1]);
    const palette = ["#60a5fa", "#a78bfa", "#f59e0b", "#f97316", "#22c55e"];
    return {
      labels,
      datasets: [
        {
          label: "Trees by Status",
          data,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
          borderColor: labels.map(() => "#ffffff"),
          borderWidth: 1,
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
        labels: { color: "#374151" },
      },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280" },
        grid: { color: "#e5e7eb" },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { color: "#f3f4f6" },
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
      {/* Thin navbar */}
      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ borderBottomColor: VERDAN_GREEN + "15" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={verdanLogo} alt="Verdan Logo" className="h-7" />
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
              <span className="font-medium text-gray-800 text-sm hidden sm:block">
                Back
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Site Analytics
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {site?.name} • ID: {site?._id}
            </p>
          </div>
        </div>

        {/* Grid of charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line: Trees per day */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 h-[360px] sm:h-[380px]">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Trees Planted Over Time
            </h2>
            <div className="h-[300px] sm:h-[320px]">
              <Line data={lineData} options={commonOptions} />
            </div>
          </div>

          {/* Bar: Types */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 h-[360px] sm:h-[380px]">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Trees by Type
            </h2>
            <div className="h-[300px] sm:h-[320px]">
              <Bar data={typeBarData} options={commonOptions} />
            </div>
          </div>

          {/* Pie: Verification distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 h-[360px] sm:h-[380px]">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Verification Status
            </h2>
            <div className="h-[300px] sm:h-[320px]">
              <Pie data={verificationPieData} options={commonOptions} />
            </div>
          </div>

          {/* Bar: Status distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 h-[360px] sm:h-[380px]">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Trees by Status
            </h2>
            <div className="h-[300px] sm:h-[320px]">
              <Bar data={statusBarData} options={commonOptions} />
            </div>
          </div>
        </div>

        {trees.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center mt-6">
            <p className="text-gray-500">
              No data yet. Plant trees to see analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
