import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";
import AddTeamMember from "./AddTeamMember";

const VERDAN_GREEN = "#48845C";

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
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    memberId: null as string | null,
    memberName: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !siteId) return;
      setLoading(true);
      setError("");

      try {
        const sitesRes = await API.get<Site[]>("/admin/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const foundSite = sitesRes.data.find((s) => s._id === siteId);
        if (foundSite) setSite(foundSite);

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

  const handleAddTeamMember = () => setShowMemberDrawer(true);
  const handleBack = () => navigate("/admin/Dashboard");

  const handleDelete = async () => {
    if (!deleteConfirm.memberId || !token || !siteId) return;
    const id = deleteConfirm.memberId;
    const backup = teamMembers.find((m) => m._id === id);
    setTeamMembers((prev) => prev.filter((m) => m._id !== id));
    setDeleteConfirm({ show: false, memberId: null, memberName: "" });
    setDeleting(true);
    try {
      try {
        await API.delete(
          `/admin/site/team/remove?siteId=${siteId}&memberId=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (apiErr: any) {
        console.warn(
          "Team member delete API failed or not implemented",
          apiErr?.response || apiErr
        );
      }
      setRefreshCounter((c) => c + 1);
    } catch (err: any) {
      if (backup) setTeamMembers((prev) => [...prev, backup]);
      alert(err?.response?.data?.message || "Failed to delete team member");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted"></div>
            <div
              className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent animate-spin"
              style={{ borderTopColor: VERDAN_GREEN }}
            />
          </div>
          <p className="text-muted-foreground font-medium">
            Loading team data...
          </p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* THIN NAVBAR */}
      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ borderBottomColor: VERDAN_GREEN + "15" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={verdanLogo} alt="Verdan Logo" className="h-7" />

            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER WITH ADD BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Team Dashboard
            </h1>
            {site && (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Site:</span> {site.name}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {site._id}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleAddTeamMember}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
            style={{ backgroundColor: VERDAN_GREEN }}
          >
            + Add Team Member
          </button>
        </div>

        {/* TEAM TABLE - Desktop */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {member.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 capitalize">
                        {member.gender || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {member.designation}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {member.organization || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        onClick={() =>
                          setDeleteConfirm({
                            show: true,
                            memberId: member._id,
                            memberName: member.name,
                          })
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TEAM CARDS - Mobile/Tablet */}
        <div className="md:hidden space-y-4">
          {teamMembers.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {member.email}
                  </p>
                </div>
                <span
                  className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {member.role}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender:</span>
                  <span className="text-gray-900 capitalize">
                    {member.gender || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Designation:</span>
                  <span className="text-gray-900">{member.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Organization:</span>
                  <span className="text-gray-900 truncate ml-2">
                    {member.organization || "N/A"}
                  </span>
                </div>
              </div>
              <button
                className="w-full px-3 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                onClick={() =>
                  setDeleteConfirm({
                    show: true,
                    memberId: member._id,
                    memberName: member.name,
                  })
                }
              >
                Delete Member
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {teamMembers.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
            <p className="text-gray-500 mb-4">
              No team members assigned to this site yet
            </p>
            <button
              onClick={handleAddTeamMember}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: VERDAN_GREEN }}
            >
              Add Your First Team Member
            </button>
          </div>
        )}
      </div>

      {/* DRAWER */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          showMemberDrawer ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowMemberDrawer(false)}
        />
        <div
          className={`relative h-full w-full max-w-2xl bg-white transition-transform duration-300 ${
            showMemberDrawer ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <AddTeamMember
            siteId={siteId}
            onClose={() => setShowMemberDrawer(false)}
            onMemberAdded={() => setRefreshCounter((c) => c + 1)}
          />
        </div>
      </div>

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Team Member
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteConfirm.memberName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() =>
                    setDeleteConfirm({
                      show: false,
                      memberId: null,
                      memberName: "",
                    })
                  }
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Member"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
