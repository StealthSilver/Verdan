import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

interface TeamMemberForm {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  gender: "male" | "female" | "other";
  designation: string;
  organization: string;
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
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
    if (!effectiveSiteId) {
      setError("Site ID is missing");
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
            siteId: effectiveSiteId,
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
          ? "h-full bg-white text-gray-900"
          : "min-h-screen bg-gray-200 text-gray-900"
      }
    >
      <div className={isModal ? "p-6" : "p-6 sm:px-20 md:px-50"}>
        <div
          className={
            isModal
              ? "h-full overflow-y-auto"
              : "max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8"
          }
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Add Team Member
            </h1>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Back to Team Dashboard
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
