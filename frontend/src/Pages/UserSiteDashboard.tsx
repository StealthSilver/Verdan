import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

interface TreeItem {
  _id: string;
  treeName: string;
  coordinates: { lat: number; lng: number };
  status: string;
  datePlanted: string;
  verified: boolean;
  images?: { url: string; timestamp: string }[];
}

const VERDAN_GREEN = "#48845C";

export default function UserSiteDashboard() {
  const { siteId } = useParams<{ siteId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [trees, setTrees] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrees = async () => {
    if (!token || !siteId) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/user/sites/${siteId}/trees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.trees || res.data;
      setTrees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch plants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, siteId]);

  const handleDelete = async (treeId: string) => {
    if (!token || !siteId) return;
    const backup = [...trees];
    setTrees((prev) => prev.filter((t) => t._id !== treeId));
    try {
      await API.delete(`/user/sites/${siteId}/trees/${treeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err: any) {
      setTrees(backup);
      alert(err?.response?.data?.message || "Failed to delete plant");
    }
  };

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
            Loading site data...
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Site Plants
          </h1>
          {siteId && (
            <p className="mt-1 text-xs font-mono text-gray-500">
              Site ID: {siteId}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{ backgroundColor: VERDAN_GREEN }}
            onClick={() => navigate(`/user/site/${siteId}/plants`)}
          >
            + Add Plant
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Plant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Planted On
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trees.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.images?.length ? (
                      <img
                        src={
                          [...t.images].sort(
                            (a, b) =>
                              new Date(b.timestamp).getTime() -
                              new Date(a.timestamp).getTime()
                          )[0].url
                        }
                        alt={t.treeName}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23f3f4f6' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <span className="text-xs text-gray-400">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {t.treeName}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {t._id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {new Date(t.datePlanted).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        t.status === "healthy"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        t.verified
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {t.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        onClick={() =>
                          navigate(`/user/site/${siteId}/${t._id}`)
                        }
                      >
                        Details
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        onClick={() =>
                          navigate(`/user/site/${siteId}/plants?edit=${t._id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        onClick={() => handleDelete(t._id)}
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

      {trees.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 py-12 text-center mt-6">
          <p className="text-gray-500 mb-2">No plants recorded for this site</p>
          <button
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: VERDAN_GREEN }}
            onClick={() => navigate(`/user/site/${siteId}/plants`)}
          >
            Add First Plant
          </button>
        </div>
      )}
    </div>
  );
}
