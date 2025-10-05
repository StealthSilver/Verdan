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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white px-4">
      <div className="backdrop-blur-xl bg-white/5 p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md border border-white/10">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          Welcome to VERDAN
        </h2>

        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
              placeholder="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
            >
              {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 mb-4 text-sm text-red-400 bg-white/5 p-2 rounded-xl">
            {errorMsg}
          </div>
        )}

        <p className="text-sm mt-6 text-gray-400 text-center">
          Don’t have an account?{" "}
          <a href="/" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
