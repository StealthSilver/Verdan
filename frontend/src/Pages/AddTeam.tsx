import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

interface TeamMemberForm {
  name: string;
  email: string;
  role: string;
  designation: string;
  gender: string;
}

const AddTeam = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TeamMemberForm>({
    name: "",
    email: "",
    role: "user",
    designation: "",
    gender: "male",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  if (!token) {
    navigate("/");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!siteId) {
    setMessage({ type: "error", text: "Site ID is missing" });
    return;
  }

  setLoading(true);
  setMessage(null);

  try {
    // Send siteId in the request body
    const res = await API.post(
      `admin/site/team/add`,
      { siteId, ...formData }, // include siteId here
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage({ type: "success", text: "Team member added successfully!" });
    setFormData({
      name: "",
      email: "",
      role: "user",
      designation: "",
      gender: "male",
    });

    // Optional: navigate back to site details
    // navigate(`/admin/site/${siteId}`);
  } catch (err: any) {
    console.error(err);
    setMessage({ type: "error", text: err?.response?.data?.message || "Server error" });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Team Member</h2>

      {message && (
        <p className={`mb-4 text-center font-semibold ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="mt-3 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Member"}
        </button>
      </form>
    </div>
  );
};

export default AddTeam;
