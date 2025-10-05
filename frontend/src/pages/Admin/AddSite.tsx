import { useState } from "react";
import axios from "axios";

const AddSite = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/api/admin/add-site",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Site added successfully!");
      setFormData({ name: "", location: "", description: "" });
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error adding site.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Add New Site</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          type="text"
          name="name"
          placeholder="Site Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Site
        </button>
      </form>
    </div>
  );
};

export default AddSite;
