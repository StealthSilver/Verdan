import { useState } from "react";
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
    role: string; // role included
    avatarUrl?: string;
  };
}

export default function Signin() {
  const [form, setForm] = useState<SigninForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupMsg, setSignupMsg] = useState<string>("");
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await API.post<SigninResponse>("/auth/signin", form);

      // Save user, token, and role
      setUser(res.data.user.name, res.data.access, res.data.user.role);

      // ✅ Role-based redirection
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
      // Send to backend Resend endpoint
      await API.post("/auth/signup-request", signupForm);
      setSignupMsg("Request sent! We'll reach out shortly.");
      setSignupForm({ name: "", email: "", company: "", message: "" });
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message || err?.message || "Failed to send";
      setSignupMsg(serverMsg);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-950 via-black to-cyan-950 text-white px-4">
      <div className="backdrop-blur-xl bg-white/5 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md border border-white/10">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          Welcome to VERDAN
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleSubmit();
          }}
          className="space-y-4"
        >
          <input
            type="email"
            className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
              placeholder="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <AiFillEyeInvisible size={20} />
              ) : (
                <AiFillEye size={20} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-cyan-500 hover:opacity-90 transition font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 mb-4 text-sm text-red-400 bg-white/5 p-2 rounded-xl">
            {errorMsg}
          </div>
        )}

        <p className="text-sm mt-6 text-gray-400 text-center">
          Don’t have an account?{" "}
          <button
            type="button"
            className="text-blue-400 hover:underline"
            onClick={() => setShowSignupModal(true)}
          >
            Sign up
          </button>
        </p>

        {showSignupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowSignupModal(false)}
            />
            <div className="relative backdrop-blur-xl bg-white/5 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md border border-white/10">
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-4">
                Request Admin Access
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!signupLoading) handleSignupSubmit();
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
                  placeholder="Name"
                  value={signupForm.name}
                  onChange={(e) =>
                    setSignupForm((s) => ({ ...s, name: e.target.value }))
                  }
                  required
                />
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
                  placeholder="Email"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                />
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
                  placeholder="Company (optional)"
                  value={signupForm.company}
                  onChange={(e) =>
                    setSignupForm((s) => ({ ...s, company: e.target.value }))
                  }
                />
                <textarea
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
                  placeholder="Message"
                  value={signupForm.message}
                  onChange={(e) =>
                    setSignupForm((s) => ({ ...s, message: e.target.value }))
                  }
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-cyan-500 hover:opacity-90 transition font-semibold shadow-lg disabled:opacity-50"
                >
                  {signupLoading ? "Sending..." : "Send Request"}
                </button>
              </form>

              {signupMsg && (
                <div className="mt-4 text-sm text-gray-300 bg-white/5 p-2 rounded-xl">
                  {signupMsg}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowSignupModal(false)}
                className="mt-4 w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
