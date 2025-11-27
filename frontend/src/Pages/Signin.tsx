import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
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
    avatarUrl?: string;
  };
}

const VERDAN_GREEN = "#48845C";

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
    message: "",
  });
  const [deletionMessage, setDeletionMessage] = useState<string>("");

  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Check for deletion message on component mount
  useEffect(() => {
    const message = localStorage.getItem("deletionMessage");
    if (message) {
      setDeletionMessage(message);
      localStorage.removeItem("deletionMessage");
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

      setUser(res.data.user.name, res.data.access, res.data.user.role);

      if (res.data.user.role.toLowerCase() === "user") {
        navigate("/user/dashboard");
      } else {
        navigate("/admin/Dashboard");
      }
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Signin failed";
      setErrorMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    setSignupLoading(true);
    setSignupMsg("");
    try {
      await API.post("/auth/signup-request", signupForm);
      setSignupMsg("Request sent! We'll reach out shortly.");
      setSignupForm({ name: "", email: "", company: "", message: "" });
    } catch (err: any) {
      const data = err?.response?.data;
      const fieldErrors = data?.errors?.fieldErrors;
      if (fieldErrors) {
        const parts: string[] = [];
        if (fieldErrors.name?.length)
          parts.push(`Name: ${fieldErrors.name.join(" ")}`);
        if (fieldErrors.email?.length)
          parts.push(`Email: ${fieldErrors.email.join(" ")}`);
        if (fieldErrors.company?.length)
          parts.push(`Company: ${fieldErrors.company.join(" ")}`);
        if (fieldErrors.message?.length)
          parts.push(`Message: ${fieldErrors.message.join(" ")}`);
        setSignupMsg(parts.join("\n"));
      } else {
        const serverMsg = data?.message || err?.message || "Failed to send";
        setSignupMsg(serverMsg);
      }
    } finally {
      setSignupLoading(false);
    }
  };

  const inputStyles = {
    border: "1px solid #D1D5DB",
    transition: "all 0.2s ease-in-out",
  };

  const inputFocusStyles = {
    borderColor: VERDAN_GREEN,
    outline: "none",
    boxShadow: `0 0 0 3px ${VERDAN_GREEN}20`,
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: VERDAN_GREEN }}
          >
            VERDAN
          </h1>
          <p className="text-gray-600 text-sm">
            Sustainable Solutions Platform
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
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
                color: activeTab === "signin" ? VERDAN_GREEN : "#9CA3AF",
              }}
            >
              Sign In
              {activeTab === "signin" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: VERDAN_GREEN }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className="flex-1 py-4 text-center font-semibold transition-all relative"
              style={{
                color: activeTab === "signup" ? VERDAN_GREEN : "#9CA3AF",
              }}
            >
              Request Access
              {activeTab === "signup" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: VERDAN_GREEN }}
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
                    style={{ backgroundColor: VERDAN_GREEN }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        e.currentTarget.style.backgroundColor = "#3a6b4a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = VERDAN_GREEN;
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Request Admin Access
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Fill out the form below and we'll get back to you shortly.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!signupLoading) handleSignupSubmit();
                  }}
                  className="space-y-4"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 resize-none"
                      style={inputStyles}
                      placeholder="Tell us why you need admin access..."
                      value={signupForm.message}
                      onChange={(e) =>
                        setSignupForm((s) => ({
                          ...s,
                          message: e.target.value,
                        }))
                      }
                      rows={4}
                      required
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
                    style={{ backgroundColor: VERDAN_GREEN }}
                    onMouseEnter={(e) => {
                      if (!signupLoading)
                        e.currentTarget.style.backgroundColor = "#3a6b4a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = VERDAN_GREEN;
                    }}
                  >
                    {signupLoading ? "Sending..." : "Send Request"}
                  </button>
                </form>

                {signupMsg && (
                  <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 whitespace-pre-line">
                    {signupMsg}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 VERDAN. All rights reserved.
        </p>
      </div>
    </div>
  );
}
