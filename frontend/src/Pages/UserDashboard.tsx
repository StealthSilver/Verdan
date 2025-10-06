import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Site {
  _id: string;
  name: string;
  address: string;
  status: "active" | "inactive";
  teamMembers: Array<any>;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function UserDashboard() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      setLoading(true);
      try {
        const res = await API.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch assigned sites
  useEffect(() => {
    const fetchSites = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await API.get<Site[]>("/admin/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSites(res.data);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message || "Failed to fetch assigned sites"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, [token]);

  if (loading)
    return <p className="text-center mt-10 text-gray-700">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const handleProfile = () => navigate("/profile");
  const handleSetting = () => navigate("/setting");
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleAdd = () => {
    navigate("/admin/add");
  };
  const handleUpdate = () => {
    navigate("/admin/update");
  };

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900">
      {/* ✅ Custom Navbar */}
      <nav className="bg-white shadow-md rounded-xl mx-auto px-6 py-4 flex justify-between items-center border border-gray-100">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
            Verdan
          </span>
        </div>

        {/* Profile Dropdown */}
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

      {/* ✅ Sites Table */}
      <div className="p-6 sm:px-20 md:px-50">
        <h1 className="text-2xl font-bold mb-6">Assigned Sites</h1>

        {sites.length === 0 ? (
          <p>No sites assigned to you.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl border border-gray-200 shadow-sm">
              <thead className="bg-gray-100 text-left border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Address
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr
                    key={site._id}
                    className="hover:bg-gray-50 border-b last:border-none"
                  >
                    <td className="px-6 py-3">{site.name}</td>
                    <td className="px-6 py-3">{site._id}</td>
                    <td className="px-6 py-3">{site.address}</td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          site.status === "active"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {site.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                          onClick={handleAdd}
                        >
                          Add
                        </button>
                        <button
                          className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition"
                          onClick={handleUpdate}
                        >
                          Update
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
  );
}
