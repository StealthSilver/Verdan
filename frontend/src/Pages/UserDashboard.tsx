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
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    siteId: string | null;
    siteName: string;
  }>({ show: false, siteId: null, siteName: "" });
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteClick = (siteId: string, siteName: string) => {
    setDeleteConfirm({ show: true, siteId, siteName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.siteId || !token) return;

    const siteIdToDelete = deleteConfirm.siteId;
    const siteToDelete = sites.find((s) => s._id === siteIdToDelete);
    
    // Optimistically remove from UI immediately
    setSites((prev) => prev.filter((site) => site._id !== siteIdToDelete));
    setDeleteConfirm({ show: false, siteId: null, siteName: "" });
    setDeleting(true);
    setError(""); // Clear any previous errors

    try {
      const response = await API.delete(`/admin/sites/${siteIdToDelete}`);
      console.log("Site deleted successfully:", response.data);
    } catch (err: any) {
      console.error("Delete error:", err);
      // Restore the site if deletion failed
      if (siteToDelete) {
        setSites((prev) => [...prev, siteToDelete].sort((a, b) => 
          a.name.localeCompare(b.name)
        ));
      }
      const errorMessage = err?.response?.data?.message || "Failed to delete site. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, siteId: null, siteName: "" });
  };

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
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDeleteClick(site._id, site.name)}
                          disabled={deleting}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.siteName}</strong>? 
              This action cannot be undone and will also remove all associated trees and team member assignments.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
