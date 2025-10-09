import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import logo from "../assets/logo.svg";

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
  const { username, token, logout } = useAuth();
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

  // Fetch sites based on role
  useEffect(() => {
    const fetchSites = async () => {
      if (!token || !user) return;
      setLoading(true);
      try {
        let res;
        if (user.role.toLowerCase() === "user") {
          res = await API.get<Site[]>("/user/sites", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (user.role.toLowerCase() === "admin") {
          res = await API.get<Site[]>("/admin/sites", {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        setSites(res?.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch sites");
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, [token, user]);

  if (loading)
    return <p className="text-center mt-10 text-gray-700">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const handleProfile = () => navigate("/profile");
  const handleSetting = () => navigate("/setting");
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleAdd = () => navigate("/admin/site/team/add");

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center sm:px-20 md:px-50">
        <img src={logo} alt="Verdan Logo" width={100} />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUserCircle className="text-3xl text-gray-700" />
            <span className="text-sm font-medium">
              Hi, {username || "User"}
            </span>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold">
                  {user?.role === "admin" ? "Admin" : "User"}
                </p>
                {/* <p className="text-xs text-gray-500">{user?.email || "user@verdan.com"}</p> */}
              </div>
              <ul className="flex flex-col text-sm">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleProfile}
                >
                  Profile
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleSetting}
                >
                  Settings
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Assigned Sites */}
      <div className="p-6 sm:px-20 md:px-50">
        <h1 className="text-2xl font-bold mb-6">Assigned Sites</h1>
        {sites.length === 0 ? (
          <p>No sites assigned to you.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
            {sites.map((site) => (
              <div
                key={site._id}
                className="p-4 rounded-xl shadow-sm bg-white border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <Link to={`/admin/site/${site._id}`}>
                    <h2 className="text-lg font-semibold text-blue-600 hover:underline">
                      {site.name}
                    </h2>
                  </Link>

                  <div className="flex flex-col md:flex-row md:gap-10 md:py-5">
                    <p className="text-sm text-gray-500">ID: {site._id}</p>
                    <p className="text-sm text-gray-500">{site.address}</p>
                    <p
                      className={`text-sm font-medium ${
                        site.status === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {site.status}
                    </p>
                  </div>
                </div>

                {/* Only admins can see Add/Update buttons */}
                {user?.role.toLowerCase() === "admin" && (
                  <div className="flex flex-col gap-2 md:flex-row md:gap-10 md:py-5 items-center">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      onClick={() =>
                        navigate(`/admin/site/${site._id}/add-team`)
                      }
                    >
                      Add
                    </button>

                    <button
                      className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition"
                      onClick={() => navigate(`/admin/site/update/${site._id}`)}
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Site button only for admin */}
        {user?.role.toLowerCase() === "admin" && (
          <div className="w-full p-10 flex items-center justify-center">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              onClick={() => navigate("/admin/site/add")}
            >
              Add New Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
