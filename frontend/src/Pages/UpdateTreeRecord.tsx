import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import verdanLogo from "../assets/verdan_light.svg";

interface TreeForm {
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  status: string;
  remarks: string;
  image: string | null;
}

interface Tree {
  _id: string;
  treeName: string;
  treeType?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface UpdateTreeRecordProps {
  embedded?: boolean;
  siteId?: string;
  treeId?: string;
  onClose?: () => void;
  onRecordSaved?: () => void;
}

export default function UpdateTreeRecord(props: UpdateTreeRecordProps) {
  const navigate = useNavigate();
  const params = useParams<{ siteId: string; treeId: string }>();
  const effectiveSiteId = props.siteId || params.siteId;
  const effectiveTreeId = props.treeId || params.treeId;
  const embedded = !!props.embedded;
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tree, setTree] = useState<Tree | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [coordinatesValid, setCoordinatesValid] = useState(false);
  const [timestampValid, setTimestampValid] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [autoCapturePending, setAutoCapturePending] = useState(false);
  const [cameraAttempts, setCameraAttempts] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<TreeForm>({
    coordinates: {
      lat: 0,
      lng: 0,
    },
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
      lng !== 0;

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
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

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
              "Please allow location access in your browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            instructions =
              "Your device location could not be determined. Please check your device's location settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            instructions =
              "The location request took too long. Please check your internet connection and try again.";
            break;
          default:
            errorMessage = "Failed to get location.";
            instructions = "An unknown error occurred. Please try again.";
            break;
        }

        setLocationError(`${errorMessage} ${instructions}`);
        setLocationLoading(false);
        setCoordinatesValid(false);
      },
      options
    );
  };

  // Update timestamp automatically
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const currentTimestamp = now.toISOString().slice(0, 16);

      setForm((prev) => ({
        ...prev,
        timestamp: currentTimestamp,
      }));

      validateTimestamp(currentTimestamp);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch tree data
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !effectiveTreeId) return;
      try {
        const treeRes = await API.get<Tree>(`/admin/trees/${effectiveTreeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTree(treeRes.data);

        // Pre-populate coordinates from tree
        if (treeRes.data.coordinates) {
          setForm((prev) => ({
            ...prev,
            coordinates: {
              lat: treeRes.data.coordinates.lat,
              lng: treeRes.data.coordinates.lng,
            },
          }));
          validateCoordinates(
            treeRes.data.coordinates.lat,
            treeRes.data.coordinates.lng
          );
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch tree data");
      }
    };
    fetchData();
  }, [token, effectiveTreeId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "lat" || name === "lng") {
      return;
    }

    if (name === "timestamp") {
      setForm({
        ...form,
        [name]: value,
      });
      validateTimestamp(value);
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

    if (!form.image) {
      setError("Image is required");
      setLoading(false);
      return;
    }

    if (!validateCoordinates(form.coordinates.lat, form.coordinates.lng)) {
      setError(
        "Valid coordinates are required. Please use the 'Get Current Location' button."
      );
      setLoading(false);
      return;
    }

    if (!validateTimestamp(form.timestamp)) {
      setError(
        "Valid timestamp is required. Timestamp must be a valid date and time (not in the future)."
      );
      setLoading(false);
      return;
    }

    if (!token || !effectiveTreeId) {
      setError("You must be logged in to add a record");
      setLoading(false);
      return;
    }

    try {
      await API.post(
        `/admin/trees/${effectiveTreeId}/records`,
        {
          image: form.image,
          coordinates: {
            lat: form.coordinates.lat,
            lng: form.coordinates.lng,
          },
          timestamp: form.timestamp,
          status: form.status,
          remarks: form.remarks || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (embedded) {
        props.onRecordSaved?.();
        props.onClose?.();
      } else {
        navigate(`/admin/dashboard/${effectiveSiteId}/${effectiveTreeId}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to add record. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper: wait for video dimensions to become available
  const waitForVideoReady = (video: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const maxTries = 60; // ~2s at 30fps
      const check = () => {
        tries++;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
          return;
        }
        if (tries >= maxTries) {
          reject(new Error("Camera initialization timeout"));
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
  };

  // Helper: get media stream with fallback attempts
  const getStreamWithFallback = async (): Promise<MediaStream> => {
    const constraintsList: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "environment" } }, audio: false },
      { video: true, audio: false },
    ];
    // Try to find back camera explicitly if enumerateDevices available
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const backCam = devices.find(
        (d) => d.kind === "videoinput" && /back|rear|environment/i.test(d.label)
      );
      if (backCam) {
        constraintsList.unshift({
          video: { deviceId: { exact: backCam.deviceId } },
          audio: false,
        });
      }
    } catch {
      // ignore
    }
    let lastError: any = null;
    for (const c of constraintsList) {
      try {
        return await navigator.mediaDevices.getUserMedia(c);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error("Unable to access camera");
  };

  // Open camera for image capture (with fallback + auto capture)
  const openCamera = async () => {
    setError("");
    setCameraInitializing(true);
    setCameraReady(false);
    setCameraAttempts((a) => a + 1);
    // Cleanup previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    try {
      const stream = await getStreamWithFallback();
      streamRef.current = stream;
      setCameraOpen(true);
      if (!videoRef.current) {
        setError("Video element not ready");
        return;
      }
      videoRef.current.srcObject = stream;
      // Attempt to play
      try {
        await videoRef.current.play();
      } catch (playErr) {
        console.warn("Video play prevented:", playErr);
      }
      try {
        await waitForVideoReady(videoRef.current);
        setCameraInitializing(false);
        setCameraReady(true);
        if (autoCapturePending) {
          // slight delay to allow final frame settle
          setTimeout(() => {
            capturePhoto();
            setAutoCapturePending(false);
          }, 100);
        }
      } catch (readyErr) {
        console.error(readyErr);
        setError(
          "Camera initialization timed out. Click capture again to retry."
        );
        setCameraInitializing(false);
        setCameraReady(false);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(
        (err?.message || "Failed to access camera") +
          ". Please check permissions or use file upload."
      );
      setCameraInitializing(false);
      setCameraReady(false);
      setCameraOpen(false);
    }
  };

  // Close camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraInitializing(false);
    setCameraReady(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    if (
      !cameraReady ||
      videoRef.current.videoWidth === 0 ||
      videoRef.current.videoHeight === 0
    ) {
      // If not ready, attempt reopen (auto retry)
      setError("Camera not ready, retrying...");
      setAutoCapturePending(true);
      openCamera();
      return;
    }
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");
      ctx.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setImagePreview(imageDataUrl);
      setForm((prev) => ({ ...prev, image: imageDataUrl }));
    } catch (e: any) {
      setError(e?.message || "Failed to capture photo");
    } finally {
      closeCamera();
    }
  };

  // Public handler: single button to perform auto capture
  const handleAutoCapture = () => {
    setAutoCapturePending(true);
    openCamera();
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
    if (embedded) {
      props.onClose?.();
    } else {
      navigate(`/admin/dashboard/${effectiveSiteId}/${effectiveTreeId}`);
    }
  };

  // When embedded in drawer, use full-height flex layout with internal scroll to keep save button accessible
  const rootClasses = embedded
    ? "h-full flex flex-col bg-gray-50 text-gray-900"
    : "min-h-screen bg-gray-50 text-gray-900";
  return (
    <div className={rootClasses}>
      {/* NAVBAR (hidden when embedded in drawer) */}
      {!embedded && (
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
          embedded
            ? "flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        }
      >
        <div
          className={
            embedded
              ? "w-full max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8"
              : "w-full max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-8"
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Add Tree Record
              </h1>
              {tree && (
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Tree:</span> {tree.treeName}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {tree.treeType || "N/A"}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#48845C" }}
              >
                {locationLoading ? "Locating..." : "Refresh Location"}
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {embedded ? "Close" : "Back"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tree Name and Type (Read-only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tree Name
                </label>
                <input
                  type="text"
                  value={tree?.treeName || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tree Type
                </label>
                <input
                  type="text"
                  value={tree?.treeType || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Coordinates <span className="text-red-500">*</span>
                </label>
              </div>
              {locationError && (
                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md text-sm">
                  {locationError}
                </div>
              )}
              {coordinatesValid && !locationError && (
                <div className="mb-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                  ✓ Valid coordinates detected
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="lat"
                    value={form.coordinates.lat || ""}
                    readOnly
                    required
                    step="any"
                    className={`w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${
                      coordinatesValid && form.coordinates.lat !== 0
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Waiting for location..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="lng"
                    value={form.coordinates.lng || ""}
                    readOnly
                    required
                    step="any"
                    className={`w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${
                      coordinatesValid && form.coordinates.lng !== 0
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Waiting for location..."
                  />
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timestamp <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="timestamp"
                value={form.timestamp}
                onChange={handleChange}
                required
                max={new Date().toISOString().slice(0, 16)}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
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

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes or observations..."
              />
            </div>

            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Image <span className="text-red-500">*</span>
              </label>

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
                      {cameraInitializing && (
                        <p className="text-xs text-gray-500 mt-2">
                          Initializing camera...
                        </p>
                      )}
                      {!cameraInitializing && cameraReady && (
                        <p className="text-xs text-green-600 mt-2">
                          Camera ready. Capture when framed.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={closeCamera}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                      >
                        {cameraReady ? "Capture Photo" : "Waiting..."}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAutoCapture}
                  disabled={cameraInitializing}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#1D4ED8" }}
                >
                  {cameraInitializing
                    ? "Opening Camera..."
                    : cameraAttempts > 0 && !cameraOpen && !imagePreview
                    ? "Retry Capture"
                    : "📷 Capture Photo"}
                </button>
                <label
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 text-center cursor-pointer"
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
                {loading ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
