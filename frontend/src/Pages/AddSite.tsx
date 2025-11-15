import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

interface SiteForm {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: "active" | "inactive";
  type: string;
}

interface Site {
  _id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: "active" | "inactive";
  type: string;
}

export default function AddSite() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Check if we're in edit mode (site data passed via location state)
  const editSite = location.state?.site as Site | undefined;
  const isEditMode = !!editSite;
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);

  const [form, setForm] = useState<SiteForm>({
    name: editSite?.name || "",
    address: editSite?.address || "",
    coordinates: {
      lat: editSite?.coordinates?.lat || 0,
      lng: editSite?.coordinates?.lng || 0,
    },
    status: editSite?.status || "active",
    type: editSite?.type || "",
  });

  // Update form when editSite changes
  useEffect(() => {
    if (editSite) {
      setForm({
        name: editSite.name,
        address: editSite.address,
        coordinates: {
          lat: editSite.coordinates.lat,
          lng: editSite.coordinates.lng,
        },
        status: editSite.status,
        type: editSite.type,
      });
    }
  }, [editSite]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      setForm({
        ...form,
        coordinates: {
          ...form.coordinates,
          [name]: parseFloat(value) || 0,
        },
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
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
    if (!form.address.trim()) {
      setError("Address is required");
      setLoading(false);
      return;
    }
    if (!form.coordinates.lat || !form.coordinates.lng) {
      setError("Coordinates are required");
      setLoading(false);
      return;
    }
    if (!form.type.trim()) {
      setError("Type is required");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("You must be logged in to add a site");
      setLoading(false);
      return;
    }

    try {
      if (isEditMode && editSite?._id) {
        // Update existing site
        await API.put(
          `/admin/sites/${editSite._id}`,
          {
            name: form.name,
            address: form.address,
            coordinates: {
              lat: form.coordinates.lat,
              lng: form.coordinates.lng,
            },
            status: form.status,
            type: form.type,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create new site
        const response = await API.post<Site>(
          "/admin/sites/add",
          {
            name: form.name,
            address: form.address,
            coordinates: {
              lat: form.coordinates.lat,
              lng: form.coordinates.lng,
            },
            status: form.status,
            type: form.type,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Store the created site ID to show Add Team button
        if (response.data?._id) {
          setCreatedSiteId(response.data._id);
          setLoading(false);
          // Don't navigate away, let user see the Add Team button
          return;
        }
      }

      // Navigate back to dashboard with refresh flag (only for updates)
      if (isEditMode) {
        navigate("/admin/Dashboard", { state: { refresh: true } });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || 
        (isEditMode ? "Failed to update site. Please try again." : "Failed to add site. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/Dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900">
      <div className="p-6 sm:px-20 md:px-50">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Update Site" : "Add New Site"}
            </h1>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Site Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter site name"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter site address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="lat"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="lat"
                  name="lat"
                  value={form.coordinates.lat}
                  onChange={handleChange}
                  required
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 28.6139"
                />
              </div>
              <div>
                <label
                  htmlFor="lng"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="lng"
                  name="lng"
                  value={form.coordinates.lng}
                  onChange={handleChange}
                  required
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 77.2090"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter site type"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Site" : "Save Site")}
              </button>
            </div>

            {(isEditMode && editSite?._id) || createdSiteId ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                  {createdSiteId ? "Site created successfully! You can now add team members." : ""}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const siteId = editSite?._id || createdSiteId;
                    if (siteId) {
                      navigate(`/admin/Dashboard/${siteId}/team`);
                    }
                  }}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                >
                  Add Team
                </button>
                {createdSiteId && (
                  <button
                    type="button"
                    onClick={() => navigate("/admin/Dashboard", { state: { refresh: true } })}
                    className="w-full mt-3 px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
