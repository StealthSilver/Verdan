import { useEffect, useState } from "react";
import axios from "axios";

interface Site {
  _id: string;
  name: string;
  location: string;
}

const UserDashboard = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/user/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSites(res.data.sites || []);
      } catch (error) {
        console.error("Error fetching sites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-600 mt-10">Loading your sites...</p>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Sites</h1>

      {sites.length === 0 ? (
        <p className="text-gray-500">No sites assigned yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <div
              key={site._id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <h3 className="font-medium text-lg text-gray-800">{site.name}</h3>
              <p className="text-sm text-gray-500">{site.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
