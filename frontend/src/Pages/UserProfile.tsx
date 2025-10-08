import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export interface IProfile {
  name: string;
  email: string;
  gender: string;
  role: string;
  designation: string;
}

const UserProfile = () => {
  const { token, username, role } = useAuth();

  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchProfile = async () => {
      if (!token) return;
setLoading(true);

      try {
        const res = await API.get<IProfile>("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API response:", res);
        console.log("Data received:", res.data);

        setProfile(res.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-[350px] flex flex-col items-center">
        <div className="bg-blue-100 rounded-full p-5 mb-4">
          <FaUser size={80} className="text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          {profile?.name || username || "User"}
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          {profile?.role?.toUpperCase() || role?.toUpperCase() || "USER"}
        </p>

        {loading ? (
          <p className="text-gray-500 mt-2 animate-pulse">Loading profile...</p>
        ) : error ? (
          <p className="text-red-500 mt-2">{error}</p>
        ) : profile ? (
          <div className="mt-4 text-left w-full space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Gender:</strong>{" "}
              {profile.gender}
            </p>
            <p>
              <strong>Designation:</strong> {profile.designation}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No profile data found.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
