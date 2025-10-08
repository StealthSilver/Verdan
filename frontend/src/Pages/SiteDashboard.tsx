import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import logo from "../assets/logo.svg"
interface TeamMember {
    _id: string;
    name: string;
    email: string;
    role: string;
    designation?: string;
    gender?: string;
}

const SiteDashboard = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token || !siteId) return;

        const fetchTeam = async () => {
            setLoading(true);
            try {
                const res = await API.get<TeamMember[]>(`/admin/site/team?siteId=${siteId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTeam(res.data);
            } catch (err: any) {
                console.error(err);
                setError(err?.response?.data?.message || "Failed to fetch team members");
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [token, siteId]);

    if (!token) return navigate("/");
    if (loading) return <p className="text-center mt-10 text-gray-700">Loading...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                    <img src={logo} alt="Verdan Logo" width={80} />

                    <div className="text-sm sm:text-base font-medium text-gray-600">
                        Site ID:{" "}
                        <span className="text-blue-600 font-semibold break-all">{siteId}</span>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1 p-4 sm:p-6">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6">
                        Team Members
                    </h2>

                    {team.length === 0 ? (
                        <p className="text-center text-gray-500">No team members added yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                            {team.map((member) => (
                                <div
                                    key={member._id}
                                    className="p-4 rounded-xl shadow-sm bg-white border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                                >
                                    <div>
                                        <h2 className="text-lg font-semibold text-blue-600">{member.name}</h2>

                                        <div className="flex flex-col md:flex-row md:gap-10 md:py-2">
                                            <p className="text-sm text-gray-500">ID: {member._id}</p>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                            <p
                                                className={`text-sm font-medium ${member.role === "admin"
                                                    ? "text-green-600"
                                                    : "text-gray-600"
                                                    }`}
                                            >
                                                {member.designation || member.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Buttons */}
                <div className="max-w-4xl mx-auto mt-8 flex flex-col sm:flex-row justify-between gap-4 px-10">
                    <button
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        onClick={() => navigate(`/admin/site/${siteId}/add-team`)}
                    >
                        Add Team Member
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Go Back to Dashboard
                    </button>
                    <button
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </main>
        </div>
    );
};

export default SiteDashboard;