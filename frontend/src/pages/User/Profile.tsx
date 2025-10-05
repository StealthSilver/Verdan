import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
  role: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-600 mt-10">Loading profile...</p>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>
      {user ? (
        <div className="space-y-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      ) : (
        <p className="text-gray-500">No user info available.</p>
      )}
    </div>
  );
};

export default Profile;
