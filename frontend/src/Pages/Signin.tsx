import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import {
  signinErrorMessage,
  signupRequestErrorMessage,
} from "../utils/apiError";
import {
  TEAM_MEMBER_PASSWORD_MAX_LENGTH,
  teamMemberPasswordPolicyMessage,
  validateTeamMemberPassword,
} from "../utils/teamMemberPassword";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

interface SigninForm {
  email: string;
  password: string;
}

interface SigninResponse {
  access: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarId?: number;
    avatarUrl?: string;
  };
}

/** Primary brand green (HARIT) */
const HARIT_PRIMARY = "#48845C";

export default function Signin() {
  const [form, setForm] = useState<SigninForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupMsg, setSignupMsg] = useState<string>("");
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState<string>("");
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string>("");

  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Check for deletion message and session expiration on component mount
  useEffect(() => {
    const deletionMsg = localStorage.getItem("deletionMessage");
    const sessionMsg = localStorage.getItem("sessionExpired");

    if (deletionMsg) {
      setDeletionMessage(deletionMsg);
      localStorage.removeItem("deletionMessage");
    }

    if (sessionMsg) {
      setSessionExpiredMsg(sessionMsg);
      localStorage.removeItem("sessionExpired");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await API.post<SigninResponse>("/auth/signin", form);

      setUser(
        res.data.user.name,
        res.data.access,
        res.data.user.role,
        res.data.user.email,
        res.data.user.avatarId,
      );

      if (res.data.user.role.toLowerCase() === "user") {
        navigate("/user/dashboard");
      } else {
        navigate("/admin/Dashboard");
      }
    } catch (err: unknown) {
      setErrorMsg(signinErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    setSignupLoading(true);
    setSignupMsg("");
    const pwdCheck = validateTeamMemberPassword(signupForm.password);
    if (!pwdCheck.ok) {
      setSignupMsg(
        pwdCheck.message ?? teamMemberPasswordPolicyMessage(),
      );
      setSignupLoading(false);
      return;
    }
    try {
      await API.post("/auth/signup-request", signupForm);
      setSignupMsg(
        "Request sent. Check your inbox for a confirmation email from HARIT. Our team will follow up soon.",
      );
      setSignupForm({ name: "", email: "", company: "", password: "" });
    } catch (err: unknown) {
      setSignupMsg(signupRequestErrorMessage(err));
    } finally {
      setSignupLoading(false);
    }
  };

  const inputStyles = {
    border: "1px solid #D1D5DB",
    transition: "all 0.2s ease-in-out",
  };

  const inputFocusStyles = {
    borderColor: HARIT_PRIMARY,
    outline: "none",
    boxShadow: `0 0 0 3px ${HARIT_PRIMARY}20`,
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8 gap-3">
          <img src="/icon.svg" alt="Harit Logo" className="w-12 h-12" />
          <h1 className="text-4xl font-bold" style={{ color: HARIT_PRIMARY }}>
            हरित
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Session Expired Notice */}
          {sessionExpiredMsg && (
            <div className="bg-blue-50 border-b border-blue-200 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">
                    Session Expired
                  </h3>
                  <p className="text-sm text-blue-700">{sessionExpiredMsg}</p>
                </div>
                <button
                  onClick={() => setSessionExpiredMsg("")}
                  className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
          )}

          {/* Account Deletion Notice */}
          {deletionMessage && (
            <div className="bg-orange-50 border-b border-orange-200 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-orange-800 mb-1">
                    Account Notice
                  </h3>
                  <p className="text-sm text-orange-700">{deletionMessage}</p>
                </div>
                <button
                  onClick={() => setDeletionMessage("")}
                  className="flex-shrink-0 text-orange-400 hover:text-orange-600 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("signin")}
              className="flex-1 py-4 text-center font-semibold transition-all relative"
              style={{
                color: activeTab === "signin" ? HARIT_PRIMARY : "#9CA3AF",
              }}
            >
              Sign In
              {activeTab === "signin" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: HARIT_PRIMARY }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className="flex-1 py-4 text-center font-semibold transition-all relative"
              style={{
                color: activeTab === "signup" ? HARIT_PRIMARY : "#9CA3AF",
              }}
            >
              Request Access
              {activeTab === "signup" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: HARIT_PRIMARY }}
                />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === "signin" ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Welcome Back
                </h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!loading) handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400"
                      style={inputStyles}
                      placeholder="you@company.com"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyles);
                      }}
                      onBlur={(e) => {
                        Object.assign(e.target.style, inputStyles);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400"
                        style={inputStyles}
                        placeholder="Enter your password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        onFocus={(e) => {
                          Object.assign(e.target.style, inputFocusStyles);
                        }}
                        onBlur={(e) => {
                          Object.assign(e.target.style, inputStyles);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <AiFillEyeInvisible size={20} />
                        ) : (
                          <AiFillEye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    style={{ backgroundColor: HARIT_PRIMARY }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        e.currentTarget.style.backgroundColor = "#3a6b4a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = HARIT_PRIMARY;
                    }}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                {errorMsg && (
                  <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                    {errorMsg}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
                  Request access to HARIT
                </h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!signupLoading) handleSignupSubmit();
                  }}
                  className="space-y-4 rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm sm:p-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400"
                      style={inputStyles}
                      placeholder="John Doe"
                      value={signupForm.name}
                      onChange={(e) =>
                        setSignupForm((s) => ({ ...s, name: e.target.value }))
                      }
                      required
                      minLength={2}
                      title="At least 2 characters"
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyles);
                      }}
                      onBlur={(e) => {
                        Object.assign(e.target.style, inputStyles);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400"
                      style={inputStyles}
                      placeholder="you@company.com"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm((s) => ({ ...s, email: e.target.value }))
                      }
                      required
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyles);
                      }}
                      onBlur={(e) => {
                        Object.assign(e.target.style, inputStyles);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                      {teamMemberPasswordPolicyMessage()}
                    </p>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400"
                        style={inputStyles}
                        placeholder="Create a password"
                        value={signupForm.password}
                        maxLength={TEAM_MEMBER_PASSWORD_MAX_LENGTH}
                        onChange={(e) =>
                          setSignupForm((s) => ({
                            ...s,
                            password: e.target.value,
                          }))
                        }
                        required
                        autoComplete="new-password"
                        onFocus={(e) => {
                          Object.assign(e.target.style, inputFocusStyles);
                        }}
                        onBlur={(e) => {
                          Object.assign(e.target.style, inputStyles);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSignupPassword((prev) => !prev)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        aria-label={
                          showSignupPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showSignupPassword ? (
                          <AiFillEyeInvisible size={20} />
                        ) : (
                          <AiFillEye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400"
                      style={inputStyles}
                      placeholder="Your Company Name"
                      value={signupForm.company}
                      onChange={(e) =>
                        setSignupForm((s) => ({
                          ...s,
                          company: e.target.value,
                        }))
                      }
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyles);
                      }}
                      onBlur={(e) => {
                        Object.assign(e.target.style, inputStyles);
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    style={{ backgroundColor: HARIT_PRIMARY }}
                    onMouseEnter={(e) => {
                      if (!signupLoading)
                        e.currentTarget.style.backgroundColor = "#3a6b4a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = HARIT_PRIMARY;
                    }}
                  >
                    {signupLoading ? "Sending..." : "Send request"}
                  </button>
                </form>

                {signupMsg && (
                  <div className="mt-5 text-sm text-gray-700 bg-emerald-50/80 p-4 rounded-xl border border-emerald-100/90 whitespace-pre-line leading-relaxed">
                    {signupMsg}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} HARIT. All rights reserved.
        </p>
      </div>
    </div>
  );
}
