import { useState, useEffect, useRef } from "react";
import { Camera, Upload, RefreshCw, Trash2 } from "lucide-react";
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
  const { token, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tree, setTree] = useState<Tree | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [manualCoords, setManualCoords] = useState(false);
  const [secureContextWarning, setSecureContextWarning] = useState("");
  const [coordinatesValid, setCoordinatesValid] = useState(false);
  const [timestampValid, setTimestampValid] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraAttempts, setCameraAttempts] = useState(0); // for user feedback only
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helpers to generate local datetime strings compatible with inputs
  const getLocalDateTimeMinuteString = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [form, setForm] = useState<TreeForm>({
    coordinates: {
      lat: 0,
      lng: 0,
    },
    timestamp: getLocalDateTimeMinuteString(),
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
    setSecureContextWarning("");
    const isSecure =
      window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";
    if (!isSecure) {
      setSecureContextWarning(
        "Geolocation requires HTTPS or localhost. Please use https:// or run locally."
      );
    }
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser. Please enter coordinates manually."
      );
      setManualCoords(true);
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
          setManualCoords(false);
        } else {
          setLocationError("Invalid coordinates received. Please try again.");
          setManualCoords(true);
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
        setManualCoords(true);
        // Try IP-based approximate fallback
        try {
          fetch("https://ipapi.co/json/")
            .then((r) =>
              r.ok ? r.json() : Promise.reject(new Error("IP lookup failed"))
            )
            .then((data) => {
              const lat = Number(data.latitude);
              const lng = Number(data.longitude);
              if (validateCoordinates(lat, lng)) {
                setForm((prev) => ({
                  ...prev,
                  coordinates: { lat, lng },
                }));
                setLocationError(
                  "Used approximate location from IP lookup. Please verify or edit manually."
                );
              }
            })
            .catch(() => {});
        } catch {}
      },
      options
    );
  };

  // Update timestamp automatically
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const currentTimestamp = getLocalDateTimeMinuteString(now);

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
        const isUser = role === "user" && effectiveSiteId;
        const url = isUser
          ? `/user/sites/${effectiveSiteId}/trees/${effectiveTreeId}`
          : `/admin/trees/${effectiveTreeId}`;
        const treeRes = await API.get<Tree>(url, {
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
  }, [token, effectiveTreeId, role, effectiveSiteId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "lat" || name === "lng") {
      if (!manualCoords) return;
      const num = Number(value);
      const next = isNaN(num) ? 0 : num;
      const nextLat = name === "lat" ? next : form.coordinates.lat;
      const nextLng = name === "lng" ? next : form.coordinates.lng;
      setForm({
        ...form,
        coordinates: {
          lat: nextLat,
          lng: nextLng,
        },
      });
      validateCoordinates(nextLat, nextLng);
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
      const isUser = role === "user" && effectiveSiteId;
      const postUrl = isUser
        ? `/user/sites/${effectiveSiteId}/trees/${effectiveTreeId}/records`
        : `/admin/trees/${effectiveTreeId}/records`;
      await API.post(
        postUrl,
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
        if (isUser) {
          navigate(`/user/site/${effectiveSiteId}`);
        } else {
          navigate(`/admin/dashboard/${effectiveSiteId}/${effectiveTreeId}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      const status = err?.response?.status;
      const msg: string | undefined =
        err?.response?.data?.message || err?.message;
      const isTooLarge =
        status === 413 ||
        (typeof msg === "string" &&
          /payload\s*too\s*large|entity\s*too\s*large|too\s*large/i.test(msg));
      if (isTooLarge) {
        setError(
          "Image size limit exceeded (~600KB). Please use a smaller image."
        );
      } else {
        setError(msg || "Failed to add record. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper: wait for video frames using dual event + polling fallback
  const waitForVideoReady = (video: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 40; // 40 * 150ms = ~6s
      let pollTimer: number | undefined;

      const cleanup = () => {
        video.removeEventListener("playing", onEventReady);
        video.removeEventListener("loadeddata", onEventReady);
        if (pollTimer) clearTimeout(pollTimer);
      };

      const onEventReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          cleanup();
          resolve();
        }
      };

      const poll = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          cleanup();
          resolve();
          return;
        }
        attempts++;
        if (attempts >= maxAttempts) {
          cleanup();
          reject(new Error("Camera initialization timeout"));
          return;
        }
        pollTimer = window.setTimeout(poll, 150);
      };

      video.addEventListener("playing", onEventReady, { once: true });
      video.addEventListener("loadeddata", onEventReady, { once: true });
      pollTimer = window.setTimeout(poll, 150);
    });
  };

  // Helper: get media stream with fallback attempts
  const getStreamWithFallback = async (): Promise<MediaStream> => {
    const constraintsList: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "environment" } }, audio: false },
      { video: true, audio: false },
    ];
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

  // Backend JSON limit increased; allow larger but still bounded images (~600KB)
  const MAX_IMAGE_BYTES = 600_000;

  const dataUrlBytes = (dataUrl: string): number => {
    const base64 = dataUrl.split(",")[1] || "";
    const padding = (base64.match(/=+$/) || [""])[0].length;
    return (base64.length * 3) / 4 - padding;
  };

  const compressToLimit = async (
    dataUrl: string,
    targetBytes: number = MAX_IMAGE_BYTES
  ): Promise<string> => {
    if (!dataUrl) return dataUrl;
    if (dataUrlBytes(dataUrl) <= targetBytes) return dataUrl;
    let quality = 0.8;
    let maxDim = 1280;
    let attempt = 0;
    const MAX_ATTEMPTS = 8;
    let current = dataUrl;
    while (attempt < MAX_ATTEMPTS && dataUrlBytes(current) > targetBytes) {
      attempt++;
      current = await new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const { width, height } = img;
            const scale = maxDim / Math.max(width, height);
            const targetW = Math.round(width * scale);
            const targetH = Math.round(height * scale);
            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(current);
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const next = canvas.toDataURL("image/jpeg", quality);
            resolve(next);
          } catch {
            resolve(current);
          }
        };
        img.onerror = () => resolve(current);
        img.src = current;
      });
      quality = Math.max(0.4, quality - 0.1);
      maxDim = Math.max(640, Math.round(maxDim * 0.75));
    }
    return current;
  };

  // Open camera (deferred stream init handled in useEffect)
  const openCamera = () => {
    setError("");
    setCameraAttempts((a) => a + 1);
    // If a previous stream exists, ensure cleanup before reopening
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCameraInitializing(true);
    setCameraOpen(true);
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

  // Capture photo from camera (with compression)
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    if (!cameraReady) {
      setError("Camera not ready yet");
      return;
    }
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.drawImage(videoRef.current, 0, 0);
      const rawDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const dataUrl = await compressToLimit(rawDataUrl);
      if (dataUrlBytes(dataUrl) > MAX_IMAGE_BYTES) {
        setError(
          "Image size limit exceeded (~600KB). Capture closer or lower resolution."
        );
        return;
      }
      setImagePreview(dataUrl);
      setForm((prev) => ({ ...prev, image: dataUrl }));
      closeCamera();
    } catch (e: any) {
      setError(e?.message || "Failed to capture image");
    }
  };

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const compressed = await compressToLimit(result);
        if (dataUrlBytes(compressed) > MAX_IMAGE_BYTES) {
          setError(
            "Image size limit exceeded (~600KB). Please choose a smaller image."
          );
          setImagePreview(null);
          setForm((prev) => ({ ...prev, image: null }));
          return;
        }
        setImagePreview(compressed);
        setForm((prev) => ({ ...prev, image: compressed }));
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

  // Stream acquisition & readiness lifecycle when camera modal opens
  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;

    const startStream = async () => {
      setCameraInitializing(true);
      setCameraReady(false);
      // Wait a frame to ensure modal/video mounts
      await new Promise((r) => requestAnimationFrame(r));
      if (!videoRef.current) {
        setError("Video element not available");
        setCameraInitializing(false);
        return;
      }
      try {
        const stream = await getStreamWithFallback();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.muted = true; // allow autoplay on mobile
        videoRef.current.setAttribute("playsInline", "");
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video play may need user gesture:", playErr);
        }
        try {
          await waitForVideoReady(videoRef.current);
          if (!cancelled) setCameraReady(true);
        } catch (readyErr: any) {
          console.error(readyErr);
          if (!cancelled) {
            if (
              readyErr?.name === "NotAllowedError" ||
              readyErr?.name === "SecurityError"
            ) {
              setError(
                "Camera permission denied. Grant access and click Retry."
              );
            } else {
              setError(
                "Camera took too long to start. Check permissions or click Retry."
              );
            }
            setCameraReady(false);
          }
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        if (!cancelled) {
          if (
            err?.name === "NotAllowedError" ||
            err?.name === "SecurityError"
          ) {
            setError(
              "Camera permission denied. Allow access in browser settings then click Retry."
            );
          } else {
            setError(
              (err?.message || "Failed to access camera") +
                ". Check permissions or use Upload Image."
            );
          }
          setCameraReady(false);
          setCameraOpen(true); // keep modal open for retry
        }
      } finally {
        if (!cancelled) setCameraInitializing(false);
      }
    };

    startStream();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOpen]);

  // Cleanup camera stream on component unmount (safety)
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const retryCamera = () => {
    // Close and reopen to trigger effect again
    closeCamera();
    requestAnimationFrame(() => openCamera());
  };

  const handleBack = () => {
    closeCamera();
    if (embedded) {
      props.onClose?.();
    } else {
      if (role === "user" && effectiveSiteId) {
        navigate(`/user/site/${effectiveSiteId}`);
      } else {
        navigate(`/admin/dashboard/${effectiveSiteId}/${effectiveTreeId}`);
      }
    }
  };

  // When embedded in drawer, use full-height flex layout with internal scroll to keep save button accessible
  const rootClasses = embedded
    ? "h-full max-h-screen overflow-y-auto flex flex-col bg-gray-50 text-gray-900"
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
              ? "w-full max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-8 mb-8"
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
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                style={{ backgroundColor: "#48845C" }}
              >
                <RefreshCw className="w-4 h-4" />
                {locationLoading ? "Locating..." : "Refresh Location"}
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {embedded ? "Close" : "Back"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {secureContextWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-md text-sm">
              {secureContextWarning}
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
                    Latitude <span className="text-red-500">*</span>{" "}
                    <span className="text-xs text-gray-500 ml-1">
                      {manualCoords ? "(Manual)" : "(Auto-filled from device)"}
                    </span>
                  </label>
                  <input
                    type="number"
                    name="lat"
                    value={form.coordinates.lat || ""}
                    readOnly={!manualCoords}
                    required
                    step="any"
                    onChange={manualCoords ? handleChange : undefined}
                    className={`w-full px-4 py-2 border rounded-md ${
                      manualCoords
                        ? "bg-white"
                        : "bg-gray-100 cursor-not-allowed"
                    } ${
                      coordinatesValid && form.coordinates.lat !== 0
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Waiting for location..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude <span className="text-red-500">*</span>{" "}
                    <span className="text-xs text-gray-500 ml-1">
                      {manualCoords ? "(Manual)" : "(Auto-filled from device)"}
                    </span>
                  </label>
                  <input
                    type="number"
                    name="lng"
                    value={form.coordinates.lng || ""}
                    readOnly={!manualCoords}
                    required
                    step="any"
                    onChange={manualCoords ? handleChange : undefined}
                    className={`w-full px-4 py-2 border rounded-md ${
                      manualCoords
                        ? "bg-white"
                        : "bg-gray-100 cursor-not-allowed"
                    } ${
                      coordinatesValid && form.coordinates.lng !== 0
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Waiting for location..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 mt-2">
                    <input
                      type="checkbox"
                      checked={manualCoords}
                      onChange={(e) => setManualCoords(e.target.checked)}
                    />
                    Use manual coordinates
                  </label>
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
                max={getLocalDateTimeMinuteString(new Date())}
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
                    <Trash2 className="w-4 h-4" />
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
                        muted
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
                      {!cameraInitializing && !cameraReady && !error && (
                        <p className="text-xs text-gray-500 mt-2">
                          Waiting for camera...
                        </p>
                      )}
                      {!cameraInitializing && !cameraReady && error && (
                        <p className="text-xs text-red-600 mt-2">{error}</p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={closeCamera}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition inline-flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition inline-flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {cameraReady ? "Capture Photo" : "Waiting..."}
                      </button>
                      {!cameraInitializing && !cameraReady && (
                        <button
                          type="button"
                          onClick={retryCamera}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition inline-flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={openCamera}
                  disabled={cameraInitializing}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#1D4ED8" }}
                >
                  <Camera className="w-4 h-4" />
                  {cameraInitializing
                    ? "Opening Camera..."
                    : cameraAttempts > 0 && !cameraOpen && !imagePreview
                    ? "Retry Camera"
                    : "Open Camera"}
                </button>
                <label
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 text-center cursor-pointer inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#4B5563" }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
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
                className="sm:flex-1 px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="sm:flex-1 px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: "#48845C" }}
              >
                <Upload className="w-4 h-4" />
                {loading ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
