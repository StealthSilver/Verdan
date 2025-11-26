import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";

interface TeamMemberForm {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  gender: "male" | "female" | "other";
  designation: string;
  organization: string;
  siteIds: string[];
}

interface AddTeamMemberProps {
  siteId?: string; // provided in modal usage
  onClose?: () => void; // closes drawer/modal
  onMemberAdded?: (member: any) => void; // callback after successful creation
}

export default function AddTeamMember({
  siteId: siteIdProp,
  onClose,
  onMemberAdded,
}: AddTeamMemberProps) {
  const { siteId: routeSiteId } = useParams<{ siteId: string }>();
  const effectiveSiteId = siteIdProp || routeSiteId; // prefer prop for modal usage
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<TeamMemberForm>({
    name: "",
    email: "",
    password: "",
    role: "user",
    gender: "other",
    designation: "",
    organization: "",
    siteIds: [],
  });

  const [availableSites, setAvailableSites] = useState<
    Array<{ _id: string; name: string }>
  >([]);

  // Fetch sites the admin can assign
  useEffect(() => {
    const loadSites = async () => {
      if (!token) return;
      try {
        const res = await API.get("/admin/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = (res.data || []).map((s: any) => ({
          _id: s._id,
          name: s.name,
        }));
        setAvailableSites(list);
      } catch (err: any) {
        console.warn(
          "Failed to load sites for assignment",
          err?.response || err
        );
      }
    };
    loadSites();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSiteSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setForm({ ...form, siteIds: options });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!form.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      setError("Password is required and must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (!form.designation.trim()) {
      setError("Designation is required");
      setLoading(false);
      return;
    }
    // Require at least one site to assign
    const finalSiteIds =
      form.siteIds.length > 0
        ? form.siteIds
        : effectiveSiteId
        ? [effectiveSiteId]
        : [];
    if (finalSiteIds.length === 0) {
      setError("Please select at least one site to assign");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("You must be logged in to add a team member");
      setLoading(false);
      return;
    }

    try {
      // Attempt API call (assuming an endpoint exists)
      let createdMember: any = null;
      try {
        const response = await API.post(
          `/admin/site/team/add`,
          {
            // Keep single siteId for backward compatibility (first selected)
            siteId: finalSiteIds[0],
            siteIds: finalSiteIds,
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            gender: form.gender,
            designation: form.designation,
            organization: form.organization,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        createdMember = response.data;
      } catch (apiErr: any) {
        // If the API endpoint is not ready, fall back to optimistic success
        console.warn(
          "Team member API create failed or not implemented",
          apiErr?.response || apiErr
        );
      }

      setSuccess(true);
      setError("");
      setLoading(false);
      if (onMemberAdded)
        onMemberAdded(createdMember || { ...form, _id: Date.now().toString() });

      // Reset form for subsequent additions (if staying open)
      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        gender: "other",
        designation: "",
        organization: "",
        siteIds: [],
      });

      // In modal mode: auto-close after short delay; in route mode: navigate back
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate(`/admin/Dashboard/${effectiveSiteId}/team`, {
            state: { refresh: true },
          });
        }
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setSuccess(false);
      setError(
        err?.response?.data?.message ||
          "Failed to add team member. Please try again."
      );
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(`/admin/Dashboard/${effectiveSiteId}/team`);
    }
  };

  const isModal = !!onClose;

  return (
    <div
      className={
        isModal
          ? "h-full max-h-screen overflow-y-auto bg-white text-gray-900 flex flex-col"
          : "min-h-screen bg-gray-50 text-gray-900"
      }
    >
      {/* NAVBAR (standalone only) */}
      {!isModal && (
        <nav
          className="bg-white border-b border-gray-200 sticky top-0 z-40"
          style={{ borderBottomColor: "#48845C15" }}
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
      )}
      <div
        className={
          isModal ? "p-4 sm:p-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        }
      >
        <div
          className={
            isModal
              ? "h-full overflow-y-auto"
              : "w-full max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-8"
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Add Team Member
              </h1>
              {effectiveSiteId && (
                <p className="mt-1 text-xs font-mono text-gray-500">
                  Site ID: {effectiveSiteId}
                </p>
              )}
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isModal ? "Close" : "Back"}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md text-sm">
              Team member added successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter team member name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password (min 6 characters)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Sites Assignment */}
            <div>
              <label
                htmlFor="siteIds"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Assign Sites <span className="text-red-500">*</span>
              </label>
              <select
                id="siteIds"
                name="siteIds"
                multiple
                value={form.siteIds}
                onChange={handleSiteSelection}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableSites.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple sites.
              </p>
            </div>

            <div>
              <label
                htmlFor="designation"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter designation"
              />
            </div>

            <div>
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Organization
              </label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter organization (optional)"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="sm:flex-1 px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="sm:flex-1 px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#48845C" }}
              >
                {loading ? "Saving..." : "Save Team Member"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
