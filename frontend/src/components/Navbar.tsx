import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface User {
  name: string;
  role: "admin" | "user";
}

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-semibold text-indigo-600 hover:text-indigo-700 transition"
        >
          Verdan
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {!user ? (
            <>
              <Link
                to="/signin"
                className="text-gray-700 hover:text-indigo-600 font-medium transition"
              >
                Sign In
              </Link>
            </>
          ) : (
            <>
              {/* Admin Links */}
              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:text-indigo-600 font-medium transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/add-site"
                    className="text-gray-700 hover:text-indigo-600 font-medium transition"
                  >
                    Add Site
                  </Link>
                </>
              )}

              {/* User Links */}
              {user.role === "user" && (
                <>
                  <Link
                    to="/user/dashboard"
                    className="text-gray-700 hover:text-indigo-600 font-medium transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/user/profile"
                    className="text-gray-700 hover:text-indigo-600 font-medium transition"
                  >
                    Profile
                  </Link>
                </>
              )}

              {/* Common */}
              <button
                onClick={handleLogout}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-md font-medium hover:bg-indigo-700 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
