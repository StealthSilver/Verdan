import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState<{ users: number; sites: number }>({
    users: 0,
    sites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600">Loading dashboard...</p>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100">
          <h2 className="text-lg font-medium text-gray-700">Total Users</h2>
          <p className="text-3xl font-bold text-indigo-700 mt-2">
            {stats.users}
          </p>
        </div>

        <div className="p-6 bg-green-50 rounded-xl border border-green-100">
          <h2 className="text-lg font-medium text-gray-700">Total Sites</h2>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {stats.sites}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
