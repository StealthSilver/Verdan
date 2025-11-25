import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";

interface TreeForm {
  treeName: string;
  treeType: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  datePlanted: string;
  timestamp: string;
  status: string;
  remarks: string;
  image: string | null;
}

interface Site {
  _id: string;
  name: string;
}

interface AddPlantsProps {
  siteId?: string; // provided when used as a modal/drawer
  treeId?: string; // editing existing tree
  onClose?: () => void; // close modal/drawer
  onTreeSaved?: () => void; // notify parent to refresh list
}

export default function AddPlants({
  siteId: propSiteId,
  treeId: propTreeId,
  onClose,
  onTreeSaved,
}: AddPlantsProps) {
  const navigate = useNavigate();
  const { siteId: routeSiteId, treeId: routeTreeId } = useParams<{
    siteId: string;
    treeId?: string;
  }>();
  const siteId = propSiteId || routeSiteId; // prefer explicit prop for modal usage
  const treeId = propTreeId || routeTreeId; // prefer explicit prop for modal usage
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [site, setSite] = useState<Site | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [coordinatesValid, setCoordinatesValid] = useState(false);
  const [timestampValid, setTimestampValid] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!treeId;

  const [form, setForm] = useState<TreeForm>({
    treeName: "",
    treeType: "",
    coordinates: {
      lat: 0,
      lng: 0,
    },
    datePlanted: new Date().toISOString().split("T")[0],
    timestamp: new Date().toISOString().slice(0, 16),
    status: "healthy",
    remarks: "",
    image: null,
  });

  // Validate coordinates
  const validateCoordinates = (lat: number, lng: number): boolean => {
    const isValid =
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      lat !== 0 &&
      lng !== 0; // Ensure not default (0,0)

    setCoordinatesValid(isValid);
    return isValid;
  };

  // Validate timestamp
  const validateTimestamp = (timestamp: string): boolean => {
    if (!timestamp) {
      setTimestampValid(false);
      return false;
    }

    const timestampDate = new Date(timestamp);
    const now = new Date();
    const isValid = !isNaN(timestampDate.getTime()) && timestampDate <= now;

    setTimestampValid(isValid);
    return isValid;
  };

  // Get current location from device
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser. Please enter coordinates manually."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Strict validation
        if (validateCoordinates(latitude, longitude)) {
          setForm((prev) => ({
            ...prev,
            coordinates: {
              lat: latitude,
              lng: longitude,
            },
          }));
          setLocationError("");
        } else {
          setLocationError("Invalid coordinates received. Please try again.");
        }
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = "";
        let instructions = "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied.";
            instructions =
              "Please allow location access in your browser settings and try again. Click the button to request permission again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            instructions =
              "Your device location could not be determined. Please check your device's location settings or try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            instructions =
              "The location request took too long. Please check your internet connection and try again.";
            break;
          default:
            errorMessage = "Failed to get location.";
            instructions =
              "An unknown error occurred. Please try again or check your device settings.";
            break;
        }

        setLocationError(`${errorMessage} ${instructions}`);
        setLocationLoading(false);
        setCoordinatesValid(false);
      },
      options
    );
  };

  // Update date and timestamp automatically from browser time (only for new entries)
  useEffect(() => {
    if (!isEditMode) {
      const updateDateTime = () => {
        const now = new Date();
        const currentDate = now.toISOString().split("T")[0];
        const currentTimestamp = now.toISOString().slice(0, 16);

        setForm((prev) => ({
          ...prev,
          datePlanted: currentDate,
          timestamp: currentTimestamp,
        }));

        // Validate timestamp
        validateTimestamp(currentTimestamp);
      };

      // Update immediately
      updateDateTime();

      // Update every minute to keep timestamp current
      const interval = setInterval(updateDateTime, 60000);

      return () => clearInterval(interval);
    }
  }, [isEditMode]);

  // Fetch site details and tree data if editing
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !siteId) return;
      try {
        const siteRes = await API.get<Site>(`/admin/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSite(siteRes.data);

        // If editing, fetch tree data
        if (treeId) {
          const treesRes = await API.get<any[]>(
            `/admin/sites/${siteId}/trees`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const tree = treesRes.data.find((t) => t._id === treeId);
          if (tree) {
            const datePlanted = tree.datePlanted
              ? new Date(tree.datePlanted).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0];
            const timestamp = tree.timestamp
              ? new Date(tree.timestamp).toISOString().slice(0, 16)
              : new Date().toISOString().slice(0, 16);

            setForm({
              treeName: tree.treeName || "",
              treeType: tree.treeType || "",
              coordinates: {
                lat: tree.coordinates?.lat || 0,
                lng: tree.coordinates?.lng || 0,
              },
              datePlanted: datePlanted,
              timestamp: timestamp,
              status: tree.status || "healthy",
              remarks: tree.remarks || "",
              image:
                tree.images && tree.images.length > 0
                  ? tree.images[0].url
                  : null,
            });

            // Set image preview for edit mode
            if (tree.images && tree.images.length > 0) {
              setImagePreview(tree.images[0].url);
            }

            // Validate coordinates and timestamp for edit mode
            if (tree.coordinates?.lat && tree.coordinates?.lng) {
              validateCoordinates(tree.coordinates.lat, tree.coordinates.lng);
            }
            validateTimestamp(timestamp);
          }
        }
        // Note: We don't auto-fetch location - user must click the button
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch data");
      }
    };
    fetchData();
  }, [token, siteId, treeId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Prevent manual changes to coordinates - they must come from geolocation
    if (name === "lat" || name === "lng") {
      return; // Ignore changes to coordinates
    }

    // Prevent manual changes to timestamp - it's auto-filled
    if (name === "timestamp" && !isEditMode) {
      return; // Ignore changes to timestamp for new entries
    }

    // Prevent manual changes to date for new entries
    if (name === "datePlanted" && !isEditMode) {
      return; // Ignore changes to date for new entries
    }

    // Handle other fields normally
    if (name === "timestamp" && isEditMode) {
      setForm({
        ...form,
        [name]: value,
      });
      // Validate timestamp on change (only in edit mode)
      validateTimestamp(value);
    } else if (name === "datePlanted" && isEditMode) {
      setForm({
        ...form,
        [name]: value,
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

    // Strict Validation
    if (!form.treeName.trim()) {
      setError("Tree name is required");
      setLoading(false);
      return;
    }
    if (!form.treeType.trim()) {
      setError("Tree type is required");
      setLoading(false);
      return;
    }

    // Strict coordinate validation
    if (!validateCoordinates(form.coordinates.lat, form.coordinates.lng)) {
      setError(
        "Valid coordinates are required. Please use the 'Get Current Location' button or enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)."
      );
      setLoading(false);
      return;
    }

    // Strict timestamp validation
    if (!validateTimestamp(form.timestamp)) {
      setError(
        "Valid timestamp is required. Timestamp must be a valid date and time (not in the future)."
      );
      setLoading(false);
      return;
    }

    if (!form.datePlanted) {
      setError("Date planted is required");
      setLoading(false);
      return;
    }

    if (!token || !siteId) {
      setError("You must be logged in to add a tree");
      setLoading(false);
      return;
    }

    try {
      // Prepare images array
      const images = form.image
        ? [
            {
              url: form.image,
              timestamp: new Date().toISOString(),
            },
          ]
        : [];

      if (isEditMode && treeId) {
        // Update existing tree
        await API.put(
          `/admin/trees/${treeId}`,
          {
            treeName: form.treeName,
            treeType: form.treeType,
            coordinates: {
              lat: form.coordinates.lat,
              lng: form.coordinates.lng,
            },
            datePlanted: form.datePlanted,
            timestamp: form.timestamp,
            status: form.status,
            remarks: form.remarks || undefined,
            images: images,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create new tree
        await API.post(
          "/admin/trees/add",
          {
            siteId,
            treeName: form.treeName,
            treeType: form.treeType,
            coordinates: {
              lat: form.coordinates.lat,
              lng: form.coordinates.lng,
            },
            datePlanted: form.datePlanted,
            timestamp: form.timestamp,
            status: form.status,
            remarks: form.remarks || undefined,
            images: images,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Notify parent and close or navigate depending on context
      if (onTreeSaved) onTreeSaved();
      if (onClose) {
        onClose();
      } else if (siteId) {
        navigate(`/admin/dashboard/${siteId}`, { state: { refresh: true } });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "add"} tree. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Open camera for image capture
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for metadata to ensure dimensions are available
        videoRef.current.onloadedmetadata = () => {
          // Some browsers require an explicit play() call
          const playPromise = videoRef.current?.play();
          if (playPromise && typeof playPromise.then === "function") {
            playPromise.catch((err) => {
              console.warn("Video play prevented:", err);
            });
          }
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Failed to access camera. Please check permissions or use file upload instead."
      );
    }
  };

  // Close camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    // Guard in case metadata not loaded yet
    if (
      videoRef.current.videoWidth === 0 ||
      videoRef.current.videoHeight === 0
    ) {
      setError("Camera not ready yet. Please wait a second and retry.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Failed to capture image context.");
      return;
    }
    ctx.drawImage(videoRef.current, 0, 0);
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setImagePreview(imageDataUrl);
    setForm((prev) => ({ ...prev, image: imageDataUrl }));
    closeCamera();
  };

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setForm((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    setForm((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleBack = () => {
    closeCamera();
    if (onClose) {
      onClose();
    } else if (siteId) {
      navigate(`/admin/dashboard/${siteId}`);
    } else {
      navigate(`/admin/dashboard`);
    }
  };

  const isModal = !!onClose;

  return (
    <div
      className={
        isModal
          ? "h-full bg-white text-gray-900"
          : "min-h-screen bg-gray-50 text-gray-900"
      }
    >
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
          isModal ? "p-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
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
                {isEditMode ? "Update Plant" : "Add New Plant"}
              </h1>
              {site && (
                <p className="text-sm text-gray-600 mt-1">
                  Site: <span className="font-medium">{site.name}</span>
                </p>
              )}
              {site?._id && (
                <p className="text-xs font-mono text-gray-500 mt-1">
                  Site ID: {site._id}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="treeName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tree Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="treeName"
                  name="treeName"
                  value={form.treeName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tree name (e.g., Mango, Neem, etc.)"
                />
              </div>
              <div>
                <label
                  htmlFor="treeType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tree Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="treeType"
                  name="treeType"
                  value={form.treeType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tree type (e.g., Fruit, Shade, etc.)"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="coordinates"
                  className="block text-sm font-medium text-gray-700"
                >
                  Coordinates <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="px-4 py-1.5 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: "#48845C" }}
                >
                  {locationLoading ? "Locating..." : "Get Location"}
                </button>
              </div>
              {!coordinatesValid &&
                form.coordinates.lat === 0 &&
                form.coordinates.lng === 0 &&
                !locationError && (
                  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
                    <strong>Please click "Get Current Location"</strong> to
                    allow the browser to access your device location. You will
                    be prompted to grant location permission.
                  </div>
                )}
              {locationError && (
                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md text-sm">
                  <div className="font-semibold mb-1">
                    {locationError.split(".")[0]}.
                  </div>
                  {locationError.includes(".") &&
                    locationError.split(".").length > 1 && (
                      <div className="text-xs mt-1">
                        {locationError.split(".").slice(1).join(".").trim()}
                      </div>
                    )}
                </div>
              )}
              {coordinatesValid && !locationError && (
                <div className="mb-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                  ✓ Valid coordinates detected from your device location
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="lat"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Latitude <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      (Auto-filled from device)
                    </span>
                  </label>
                  <input
                    type="number"
                    id="lat"
                    name="lat"
                    value={form.coordinates.lat || ""}
                    readOnly
                    required
                    step="any"
                    onChange={undefined}
                    className={`w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${
                      coordinatesValid && form.coordinates.lat !== 0
                        ? "border-green-500"
                        : form.coordinates.lat === 0
                        ? "border-gray-300"
                        : "border-red-500"
                    }`}
                    placeholder="Waiting for location..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="lng"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Longitude <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      (Auto-filled from device)
                    </span>
                  </label>
                  <input
                    type="number"
                    id="lng"
                    name="lng"
                    value={form.coordinates.lng || ""}
                    readOnly
                    required
                    step="any"
                    onChange={undefined}
                    className={`w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${
                      coordinatesValid && form.coordinates.lng !== 0
                        ? "border-green-500"
                        : form.coordinates.lng === 0
                        ? "border-gray-300"
                        : "border-red-500"
                    }`}
                    placeholder="Waiting for location..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="datePlanted"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date Planted <span className="text-red-500">*</span>
                  {!isEditMode && (
                    <span className="text-xs text-gray-500 ml-1">
                      (Auto-filled)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  id="datePlanted"
                  name="datePlanted"
                  value={form.datePlanted}
                  onChange={isEditMode ? handleChange : undefined}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  readOnly={!isEditMode}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="timestamp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Timestamp <span className="text-red-500">*</span>
                  {!isEditMode && (
                    <span className="text-xs text-gray-500 ml-1">
                      (Auto-filled)
                    </span>
                  )}
                </label>
                <input
                  type="datetime-local"
                  id="timestamp"
                  name="timestamp"
                  value={form.timestamp}
                  onChange={isEditMode ? handleChange : undefined}
                  required
                  max={new Date().toISOString().slice(0, 16)}
                  readOnly={!isEditMode}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                  } ${
                    timestampValid
                      ? "border-green-500"
                      : form.timestamp
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {!timestampValid && form.timestamp && (
                  <p className="mt-1 text-xs text-red-600">
                    Timestamp must be valid and not in the future
                  </p>
                )}
                {timestampValid && form.timestamp && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Valid timestamp
                  </p>
                )}
              </div>
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
                <option value="healthy">Healthy</option>
                <option value="sick">Sick</option>
                <option value="dead">Dead</option>
                <option value="needs_attention">Needs Attention</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="remarks"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Remarks
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes or observations..."
              />
            </div>

            {/* Plant Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Image
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Plant preview"
                    className="max-w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition shadow"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Camera Modal */}
              {cameraOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="mb-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                        style={{ maxHeight: "400px" }}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={closeCamera}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
                        style={{ backgroundColor: "#48845C" }}
                      >
                        Capture Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Capture Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={openCamera}
                  disabled={cameraOpen}
                  className="sm:flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#1D4ED8" }}
                >
                  📷 Capture Photo
                </button>
                <label
                  className="sm:flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 text-center cursor-pointer"
                  style={{ backgroundColor: "#4B5563" }}
                >
                  📁 Upload Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
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
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
