import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";
import AddTeamMember from "./AddTeamMember";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  gender?: string;
  designation: string;
  organization?: string;
}

interface Site {
  _id: string;
  name: string;
}

export default function TeamDashboard() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [site, setSite] = useState<Site | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMemberDrawer, setShowMemberDrawer] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !siteId) return;
      setLoading(true);
      setError("");

      try {
        // Fetch site details
        const sitesRes = await API.get<Site[]>("/admin/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const foundSite = sitesRes.data.find((s) => s._id === siteId);
        if (foundSite) {
          setSite(foundSite);
        }

        // Fetch team members
        const teamRes = await API.get<TeamMember[]>(
          `/admin/site/team?siteId=${siteId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeamMembers(teamRes.data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, siteId, location.state?.refresh, refreshCounter]);

  const handleAddTeamMember = () => {
    setShowMemberDrawer(true);
  };

  const handleBack = () => {
    navigate("/admin/Dashboard");
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-700">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900">
      <nav className="bg-white shadow-md rounded-xl mx-auto px-6 py-4 flex justify-between items-center border border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
            {/* Use imported asset so Vite processes it and path resolves correctly */}
            <img
              src={verdanLogo}
              alt="Verdan Logo"
              className="h-8 w-auto select-none"
              draggable={false}
            />
          </span>
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          Back to Dashboard
        </button>
      </nav>

      <div className="p-6 sm:px-20 md:px-50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Team Dashboard</h1>
          {site && (
            <div className="text-gray-600">
              <p className="text-lg">
                <span className="font-semibold">Site:</span> {site.name}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Site ID:</span> {site._id}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAddTeamMember}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md font-medium"
          >
            Add Team Member
          </button>
        </div>

        {teamMembers.length === 0 ? (
          <p className="text-center py-10 text-gray-600">
            No team members assigned to this site.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl border border-gray-200 shadow-sm">
              <thead className="bg-gray-100 text-left border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Organization
                  </th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-gray-50 border-b last:border-none"
                  >
                    <td className="px-6 py-3">{member.name}</td>
                    <td className="px-6 py-3">{member.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          member.role === "admin"
                            ? "px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-medium"
                            : "px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium"
                        }
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 capitalize">
                      {member.gender || "N/A"}
                    </td>
                    <td className="px-6 py-3">{member.designation}</td>
                    <td className="px-6 py-3">
                      {member.organization || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Slide-in Add Team Member Drawer */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          showMemberDrawer
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            showMemberDrawer ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowMemberDrawer(false)}
        />
        <div
          className={`relative h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ${
            showMemberDrawer ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <AddTeamMember
            siteId={siteId}
            onClose={() => setShowMemberDrawer(false)}
            onMemberAdded={() => {
              // trigger refresh
              setRefreshCounter((c) => c + 1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
