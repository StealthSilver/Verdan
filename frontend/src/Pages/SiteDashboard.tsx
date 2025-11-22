import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import API from "../api";

interface Site {
  _id: string;
  name: string;
  address: string;
  status: "active" | "inactive";
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface Tree {
  _id: string;
  treeName: string;
  treeType?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  datePlanted: string;
  timestamp?: string;
  status: string;
  remarks?: string;
  verified: boolean;
  images?: {
    url: string;
    timestamp: string;
  }[];
  plantedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SiteDashboard() {
  const { siteId: rawSiteId } = useParams<{ siteId: string }>();
  // Decode and clean the siteId in case of URL encoding issues
  const siteId = rawSiteId ? decodeURIComponent(rawSiteId).trim() : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();
  const [site, setSite] = useState<Site | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
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
        const res = await API.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch site and trees data
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !siteId) {
        console.log("Missing token or siteId:", { token: !!token, siteId });
        if (!siteId) {
          setError("Site ID is missing from URL");
        }
        return;
      }
      
      console.log("Fetching site data for siteId:", siteId);
      setLoading(true);
      setError("");

      try {
        // Fetch site details
        console.log("Making API call to:", `/admin/sites/${siteId}`);
        const siteRes = await API.get<Site>(`/admin/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Site data received:", siteRes.data);
        setSite(siteRes.data);

        // Fetch trees for this site
        const treesRes = await API.get<Tree[]>(`/admin/sites/${siteId}/trees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Trees data received:", treesRes.data);
        setTrees(treesRes.data);
      } catch (err: any) {
        console.error("Error fetching site data:", err);
        console.error("Error response:", err?.response);
        console.error("Error status:", err?.response?.status);
        console.error("Error data:", err?.response?.data);
        console.error("Request URL:", err?.config?.url);
        console.error("SiteId used:", siteId);
        
        let errorMessage = "Failed to fetch data";
        if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
          // If backend provides debugging info, include it
          if (err?.response?.data?.receivedSiteId) {
            errorMessage += `\nReceived ID: ${err.response.data.receivedSiteId}`;
          }
          if (err?.response?.data?.searchedSiteId) {
            errorMessage += `\nSearched ID: ${err.response.data.searchedSiteId}`;
          }
          if (err?.response?.data?.availableSiteIds && err.response.data.availableSiteIds.length > 0) {
            errorMessage += `\n\nAvailable Site IDs in database:\n${err.response.data.availableSiteIds.slice(0, 10).join("\n")}`;
            if (err.response.data.availableSiteIds.length > 10) {
              errorMessage += `\n... and ${err.response.data.availableSiteIds.length - 10} more`;
            }
          }
          if (err?.response?.data?.suggestion) {
            errorMessage += `\n\n${err.response.data.suggestion}`;
          }
        } else if (err?.response?.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (err?.response?.status === 403) {
          errorMessage = "You don't have permission to access this site.";
        } else if (err?.response?.status === 404) {
          errorMessage = `Site not found. Site ID from URL: ${siteId}`;
          if (err?.response?.data?.availableSiteIds && err.response.data.availableSiteIds.length > 0) {
            errorMessage += `\n\nAvailable Site IDs:\n${err.response.data.availableSiteIds.slice(0, 10).join("\n")}`;
          }
        } else if (err?.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, siteId, location.state?.refresh]);

  const handleProfile = () => navigate("/profile");
  const handleSetting = () => navigate("/setting");
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleBack = () => {
    navigate("/admin/Dashboard");
  };
  const handleAddPlants = () => {
    navigate(`/admin/dashboard/${siteId}/plants`);
  };

  const handleDeleteTree = async (treeId: string) => {
    if (!window.confirm("Are you sure you want to delete this tree?")) return;
    
    try {
      await API.delete(`/admin/trees/${treeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the trees list
      const treesRes = await API.get<Tree[]>(`/admin/sites/${siteId}/trees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrees(treesRes.data);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete tree");
    }
  };

  const handleUpdateTree = (treeId: string) => {
    navigate(`/admin/dashboard/${siteId}/${treeId}/update`);
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-700">Loading...</p>;
  if (error) {
    return (
      <div className="min-h-screen bg-gray-200 text-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Site</h2>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm text-red-700 font-mono">{error}</pre>
          </div>
          <button
            onClick={() => navigate("/admin/Dashboard")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  if (!site) return <p className="text-center mt-10 text-gray-700">Site not found</p>;

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900">
      <nav className="bg-white shadow-md rounded-xl mx-auto px-6 py-4 flex justify-between items-center border border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
            Verdan
          </span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition shadow-sm"
          >
            <FaUserCircle className="text-3xl text-gray-700" />
            <span className="text-sm font-medium text-gray-800">
              Hi, {user?.name || "User"}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "user@verdan.com"}
                </p>
              </div>
              <ul className="py-1">
                <li
                  onClick={handleProfile}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 transition"
                >
                  Profile
                </li>
                <li
                  onClick={handleSetting}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 transition"
                >
                  Settings
                </li>
                <li
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer transition font-medium border-t border-gray-100"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div className="p-6 sm:px-20 md:px-50">
        {/* Site Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{site.name}</h1>
            <p className="text-gray-600">
              <span className="font-semibold">Site ID:</span> {site._id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm text-gray-600">Status:</span>
              <span
                className={`ml-2 px-3 py-1 rounded-md font-medium ${
                  site.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {site.status}
              </span>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Back
            </button>
          </div>
        </div>

        {/* Plantation Dashboard */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Plantation Dashboard</h2>
            <button
              onClick={handleAddPlants}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md font-medium"
            >
              Add Plants
            </button>
          </div>

          {trees.length === 0 ? (
            <p className="text-center py-10 text-gray-600">
              No trees recorded for this site yet. Click "Add Plants" to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-200 shadow-sm">
                <thead className="bg-gray-100 text-left border-b">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                      Serial No.
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                      Tree ID
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                      Tree Name
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                      Time
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                      Coordinates
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trees.map((tree, index) => (
                    <tr
                      key={tree._id}
                      className="hover:bg-gray-50 border-b last:border-none"
                    >
                      <td className="px-6 py-3 font-medium">{index + 1}</td>
                      <td className="px-6 py-3">
                        {tree.images && tree.images.length > 0 ? (
                          <img
                            src={tree.images[0].url}
                            alt={tree.treeName}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                        {tree._id.slice(-8)}
                      </td>
                      <td className="px-6 py-3 font-medium">{tree.treeName}</td>
                      <td className="px-6 py-3">
                        {new Date(tree.datePlanted).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        {tree.timestamp 
                          ? new Date(tree.timestamp).toLocaleTimeString()
                          : new Date(tree.datePlanted).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {tree.coordinates.lat.toFixed(6)}, {tree.coordinates.lng.toFixed(6)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateTree(tree._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteTree(tree._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
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
          )}
        </div>
      </div>
    </div>
  );
}

