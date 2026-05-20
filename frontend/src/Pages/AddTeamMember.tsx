import { useState, useEffect } from "react";
import Select, { type MultiValue, type StylesConfig } from "react-select";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import { messageFromUnknown } from "../utils/apiError";
import { useToast } from "../context/ToastContext";
import {
  TEAM_MEMBER_PASSWORD_MAX_LENGTH,
  teamMemberPasswordPolicyMessage,
  validateTeamMemberPassword,
} from "../utils/teamMemberPassword";

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

interface AdminSiteRow {
  _id: string;
  name: string;
}

interface AddTeamMemberApiResponse {
  message?: string;
  emailSent?: boolean;
  noChanges?: boolean;
  user?: unknown;
}

interface TeamMemberEditPayload {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  gender: "male" | "female" | "other";
  designation: string;
  organization: string;
  siteIds: string[];
}

interface AddTeamMemberProps {
  siteId?: string; // provided in modal usage
  /** When set, drawer loads this member and PATCHes on save */
  memberId?: string | null;
  onClose?: () => void; // closes drawer/modal
  onMemberAdded?: (member: unknown) => void; // callback after successful create/update
  /** Prefill create form (e.g. access-request email deep link). Ignored in edit mode. */
  initialCreatePrefill?: {
    name: string;
    email: string;
    password: string;
  } | null;
}

export default function AddTeamMember({
  siteId: siteIdProp,
  memberId,
  onClose,
  onMemberAdded,
  initialCreatePrefill = null,
}: AddTeamMemberProps) {
  const { siteId: routeSiteId } = useParams<{ siteId: string }>();
  const effectiveSiteId = siteIdProp || routeSiteId; // prefer prop for modal usage
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<TeamMemberForm>({
    name: "",
    email: "",
    password: "",
    role: "user",
    gender: "other",
    designation: "",
    organization: "Serentica",
    siteIds: [],
  });

  const [availableSites, setAvailableSites] = useState<
    Array<{ _id: string; name: string }>
  >([]);

  const siteOptions = availableSites.map((s) => ({
    value: s._id,
    label: s.name,
  }));

  // Fetch sites the admin can assign
  useEffect(() => {
    const loadSites = async () => {
      if (!token) return;
      try {
        const res = await API.get<AdminSiteRow[]>("/admin/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = (res.data || []).map((s) => ({
          _id: s._id,
          name: s.name,
        }));
        setAvailableSites(list);
      } catch (err: unknown) {
        void messageFromUnknown(err, "");
      }
    };
    loadSites();
  }, [token]);

  const isEditMode = Boolean(memberId);

  useEffect(() => {
    const loadMember = async () => {
      if (!memberId || !effectiveSiteId || !token) return;
      setLoadingMember(true);
      setError("");
      try {
        const res = await API.get<TeamMemberEditPayload>(
          `/admin/site/team/member?siteId=${effectiveSiteId}&memberId=${memberId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const d = res.data;
        setForm({
          name: d.name ?? "",
          email: d.email ?? "",
          password: "",
          role: (d.role === "admin" ? "admin" : "user") as "admin" | "user",
          gender: (d.gender === "male" || d.gender === "female"
            ? d.gender
            : "other") as TeamMemberForm["gender"],
          designation: d.designation ?? "",
          organization: d.organization || "Serentica",
          siteIds: Array.isArray(d.siteIds) ? d.siteIds : [],
        });
      } catch (err: unknown) {
        const msg = messageFromUnknown(err, "Could not load team member");
        setError(msg);
        toast.error(msg);
      } finally {
        setLoadingMember(false);
      }
    };
    if (memberId) {
      void loadMember();
    } else {
      setForm({
        name: initialCreatePrefill?.name?.trim() ?? "",
        email: initialCreatePrefill?.email?.trim() ?? "",
        password: initialCreatePrefill?.password ?? "",
        role: "user",
        gender: "other",
        designation: "",
        organization: "Serentica",
        siteIds: [],
      });
    }
  }, [memberId, effectiveSiteId, token, initialCreatePrefill]);

  const customSelectStyles: StylesConfig<
    { value: string; label: string },
    true
  > = {
    control: (base) => ({
      ...base,
      borderColor: "#D1D5DB",
      boxShadow: "none",
      minHeight: 40,
    }),
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSiteSelection = (
    selected: MultiValue<{ value: string; label: string }>,
  ) => {
    const ids = (selected || []).map((opt) => opt.value);
    setForm({ ...form, siteIds: ids });
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
    const pwdTrim = form.password.trim();
    if (!isEditMode) {
      const pwdResult = validateTeamMemberPassword(pwdTrim);
      if (!pwdResult.ok) {
        const msg = pwdResult.message ?? teamMemberPasswordPolicyMessage();
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
    } else if (pwdTrim.length > 0) {
      const pwdResult = validateTeamMemberPassword(pwdTrim);
      if (!pwdResult.ok) {
        const msg = pwdResult.message ?? teamMemberPasswordPolicyMessage();
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
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
      if (isEditMode && memberId && effectiveSiteId) {
        const body: Record<string, unknown> = {
          memberId,
          siteId: effectiveSiteId,
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          gender: form.gender,
          designation: form.designation.trim(),
          organization: form.organization.trim(),
          siteIds: finalSiteIds,
        };
        if (pwdTrim) {
          body.password = pwdTrim;
        }
        const response = await API.patch<AddTeamMemberApiResponse>(
          `/admin/site/team/update`,
          body,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const mailOk = Boolean(response.data?.emailSent);
        const noChanges = Boolean(response.data?.noChanges);
        setSuccess(true);
        setError("");
        setLoading(false);
        if (onMemberAdded)
          onMemberAdded(response.data?.user ?? { ...form, _id: memberId });
        if (noChanges) {
          toast.info("No changes to save.");
        } else if (mailOk) {
          toast.success(
            "Team member updated. A summary email was sent to their inbox.",
          );
        } else {
          toast.warning(
            "Team member updated, but the notification email was not sent. Configure SMTP on the API server.",
          );
        }
        setTimeout(() => {
          if (onClose) {
            onClose();
          } else {
            navigate(`/admin/Dashboard/${effectiveSiteId}/team`, {
              state: { refresh: true },
            });
          }
        }, 1200);
        return;
      }

      const response = await API.post<AddTeamMemberApiResponse>(
        `/admin/site/team/add`,
        {
          // Keep single siteId for backward compatibility (first selected)
          siteId: finalSiteIds[0],
          siteIds: finalSiteIds,
          name: form.name,
          email: form.email,
          password: pwdTrim,
          role: form.role,
          gender: form.gender,
          designation: form.designation,
          organization: form.organization,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const createdMember = response.data;
      const mailOk = Boolean(response.data?.emailSent);

      setSuccess(true);
      setError("");
      setLoading(false);
      if (onMemberAdded)
        onMemberAdded(
          createdMember?.user ?? createdMember ?? {
            ...form,
            _id: Date.now().toString(),
          },
        );
      if (mailOk) {
        toast.success(
          "Team member added successfully. Welcome email sent to their inbox.",
        );
      } else {
        toast.warning(
          "Team member added, but the welcome email was not sent. Configure SMTP on the API server.",
        );
      }

      // Reset form for subsequent additions (if staying open)
      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        gender: "other",
        designation: "",
        organization: "Serentica",
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
    } catch (err: unknown) {
      console.error(err);
      setSuccess(false);
      const msg = messageFromUnknown(
        err,
        isEditMode
          ? "Failed to update team member. Please try again."
          : "Failed to add team member. Please try again.",
      );
      setError(msg);
      toast.error(msg);
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
  const canCreateAdmins = role === "admin";

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
              <div className="flex items-center gap-2">
                <img src="/icon.svg" alt="Harit Logo" className="h-8" />
                <span className="text-2xl font-bold text-gray-800">हरित</span>
              </div>
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
                {isEditMode ? "Edit Team Member" : "Add Team Member"}
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
              {isEditMode
                ? "Team member updated! Closing..."
                : "Team member added successfully! Redirecting..."}
            </div>
          )}

          {loadingMember && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-sm">
              Loading member...
            </div>
          )}

          <form
            noValidate
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-busy={loadingMember}
          >
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
                Password{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!isEditMode}
                  maxLength={TEAM_MEMBER_PASSWORD_MAX_LENGTH}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    isEditMode
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {teamMemberPasswordPolicyMessage()}
              </p>
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to keep the current password.
                </p>
              )}
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
                  disabled={!canCreateAdmins}
                >
                  <option value="user">User</option>
                  {canCreateAdmins && <option value="admin">Admin</option>}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Only admins can create new admins.
                </p>
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
              <Select
                inputId="siteIds"
                isMulti
                options={siteOptions}
                value={siteOptions.filter((o) =>
                  form.siteIds.includes(o.value),
                )}
                onChange={(selected) =>
                  handleSiteSelection(
                    selected as unknown as MultiValue<{
                      value: string;
                      label: string;
                    }>,
                  )
                }
                classNamePrefix="rs"
                placeholder="Select one or more sites"
                styles={customSelectStyles}
              />
              <p className="mt-1 text-xs text-gray-500">
                Click to toggle selections; checked items show as tags.
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
                disabled={loading || loadingMember}
                className="sm:flex-1 px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#48845C" }}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Team Member"
                    : "Save Team Member"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
