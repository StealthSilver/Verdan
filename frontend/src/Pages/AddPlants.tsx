import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { Camera, Upload, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import NotificationBell from "../components/NotificationBell/NotificationBell";
import API from "../api";
import { crossOriginForRemoteImage } from "../utils/crossOriginMedia";
import {
  axiosResponseDataMessage,
  axiosResponseStatus,
  errorMessage,
  errorName,
  messageFromUnknown,
} from "../utils/apiError";

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
  plantedBy: string;
  image: string | null;
}

interface Site {
  _id: string;
  name: string;
}

/** Shape used when loading an existing tree for edit */
interface FetchedTree {
  _id: string;
  treeName?: string;
  treeType?: string;
  coordinates?: { lat?: number; lng?: number };
  datePlanted?: string;
  timestamp?: string;
  status?: string;
  remarks?: string;
  plantedByName?: string;
  images?: { url: string }[];
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
  const { token, role, username } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [site, setSite] = useState<Site | null>(null);
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
  const [cameraAttempts, setCameraAttempts] = useState(0); // track retries
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!treeId;

  // Helpers to generate local date/time strings compatible with inputs
  const getLocalDateString = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getLocalDateTimeMinuteString = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [form, setForm] = useState<TreeForm>({
    treeName: "",
    treeType: "",
    coordinates: {
      lat: 0,
      lng: 0,
    },
    datePlanted: getLocalDateString(),
    timestamp: getLocalDateTimeMinuteString(),
    status: "healthy",
    remarks: "",
    plantedBy: username || "",
    image: null,
  });

  // Update plantedBy when username changes
  useEffect(() => {
    if (username && !form.plantedBy) {
      setForm((prev: TreeForm) => ({ ...prev, plantedBy: username }));
    }
  }, [username, form.plantedBy]);

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
    setSecureContextWarning("");
    const isSecure =
      window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";
    if (!isSecure) {
      setSecureContextWarning(
        "Geolocation requires HTTPS or localhost. Please use https:// or run locally.",
      );
    }
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation not supported. Please use a compatible browser/device.",
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
          setForm((prev: TreeForm) => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
          }));
          setLocationError("");
          setManualCoords(false);
        } else {
          setLocationError("Invalid coordinates received. Please retry.");
          setManualCoords(true);
        }
        setLocationLoading(false);
      },
      (error) => {
        let msg = "Failed to obtain location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg =
              "Location permission denied. Allow access and press 'Get Location' again.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location unavailable. Check device settings and retry.";
            break;
          case error.TIMEOUT:
            msg = "Location request timed out. Ensure connectivity and retry.";
            break;
        }
        setLocationError(msg);
        setLocationLoading(false);
        setCoordinatesValid(false);
        setManualCoords(true);
        // Try IP-based approximate fallback (best-effort)
        try {
          fetch("https://ipapi.co/json/")
            .then((r) =>
              r.ok ? r.json() : Promise.reject(new Error("IP lookup failed")),
            )
            .then((data: unknown) => {
              const row =
                data && typeof data === "object"
                  ? (data as { latitude?: unknown; longitude?: unknown })
                  : {};
              const lat = Number(row.latitude);
              const lng = Number(row.longitude);
              if (validateCoordinates(lat, lng)) {
                setForm((prev: TreeForm) => ({
                  ...prev,
                  coordinates: { lat, lng },
                }));
                setLocationError(
                  "Used approximate location from IP lookup. Please verify or edit manually.",
                );
              }
            })
            .catch(() => {
              /* optional IP lookup */
            });
        } catch {
          /* geolocation error path may not provide ipapi */
        }
      },
      options,
    );
  };

  // Update date and timestamp automatically from browser time (only for new entries)
  useEffect(() => {
    if (!isEditMode) {
      const updateDateTime = () => {
        const now = new Date();
        const currentDate = getLocalDateString(now);
        const currentTimestamp = getLocalDateTimeMinuteString(now);

        setForm((prev: TreeForm) => ({
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

  // Fetch site details and tree data (edit mode) with role awareness
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !siteId) return;
      const isUser = role === "user";
      try {
        if (isUser) {
          // Attempt admin site fetch (may fail if user); fallback minimal
          try {
            const siteRes = await API.get<Site>(`/admin/sites/${siteId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setSite(siteRes.data);
          } catch {
            setSite({ _id: siteId as string, name: "Site" });
          }
        } else {
          const siteRes = await API.get<Site>(`/admin/sites/${siteId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSite(siteRes.data);
        }

        if (treeId) {
          let tree: FetchedTree | null = null;
          if (isUser) {
            try {
              const singleTreeRes = await API.get<FetchedTree>(
                `/user/sites/${siteId}/trees/${treeId}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              tree = singleTreeRes.data;
            } catch {
              const listRes = await API.get<
                { trees?: FetchedTree[] } | FetchedTree[]
              >(`/user/sites/${siteId}/trees`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const raw = listRes.data;
              const arr = Array.isArray(raw) ? raw : raw.trees;
              tree = Array.isArray(arr)
                ? arr.find((t) => t._id === treeId) ?? null
                : null;
            }
          } else {
            // Prefer single-tree endpoint for edit (most reliable shape)
            try {
              const singleTreeRes = await API.get<FetchedTree>(
                `/admin/trees/${treeId}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              tree = singleTreeRes.data;
            } catch {
              // Fallback: some endpoints return { trees: [] }, others return []
              const treesRes = await API.get<
                { trees?: FetchedTree[] } | FetchedTree[]
              >(`/admin/sites/${siteId}/trees`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const raw = treesRes.data;
              const arr = Array.isArray(raw) ? raw : raw.trees;
              tree = Array.isArray(arr)
                ? arr.find((t) => t._id === treeId) ?? null
                : null;
            }
          }
          if (tree) {
            const datePlanted = tree.datePlanted
              ? getLocalDateString(new Date(tree.datePlanted))
              : getLocalDateString();
            const timestamp = tree.timestamp
              ? getLocalDateTimeMinuteString(new Date(tree.timestamp))
              : getLocalDateTimeMinuteString();
            setForm({
              treeName: tree.treeName || "",
              treeType: tree.treeType || "",
              coordinates: {
                lat: tree.coordinates?.lat || 0,
                lng: tree.coordinates?.lng || 0,
              },
              datePlanted,
              timestamp,
              status: tree.status || "healthy",
              remarks: tree.remarks || "",
              plantedBy: tree.plantedByName || username || "",
              image:
                tree.images && tree.images.length > 0
                  ? tree.images[0].url
                  : null,
            });
            if (tree.images && tree.images.length > 0)
              setImagePreview(tree.images[0].url);
            if (tree.coordinates?.lat && tree.coordinates?.lng)
              validateCoordinates(tree.coordinates.lat, tree.coordinates.lng);
            validateTimestamp(timestamp);
          }
        }
      } catch (err: unknown) {
        console.error(err);
        setError(messageFromUnknown(err, "Failed to fetch data"));
      }
    };
    fetchData();
  }, [token, siteId, treeId, role, username]);

  // Auto geolocation attempt for new entries (runs once shortly after mount if coords unset)
  useEffect(
    () => {
      if (
        !isEditMode &&
        form.coordinates.lat === 0 &&
        form.coordinates.lng === 0
      ) {
        const timer = setTimeout(() => {
          getCurrentLocation();
        }, 300); // slight delay to allow initial render
        return () => clearTimeout(timer);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot; getCurrentLocation is not stable
    [isEditMode, form.coordinates.lat, form.coordinates.lng],
  );

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Coordinates: allow manual edit when manual mode is enabled
    if (name === "lat" || name === "lng") {
      if (!manualCoords) return; // locked unless manual mode
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

  const handleSubmit = async (e: FormEvent) => {
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
        "Valid coordinates are required. Please use the 'Get Current Location' button or enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180).",
      );
      setLoading(false);
      return;
    }

    // Strict timestamp validation
    if (!validateTimestamp(form.timestamp)) {
      setError(
        "Valid timestamp is required. Timestamp must be a valid date and time (not in the future).",
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
      const images = form.image
        ? [{ url: form.image, timestamp: new Date().toISOString() }]
        : [];
      const isUser = role === "user";
      if (isEditMode && treeId) {
        const updateUrl = isUser
          ? `/user/sites/${siteId}/trees/${treeId}`
          : `/admin/trees/${treeId}`;
        await API.put(
          updateUrl,
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
            // Backend stores plantedBy (ObjectId) separately; this is display-only.
            plantedByName: form.plantedBy || username || undefined,
            images,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        toast.info("Plant updated successfully");
      } else {
        const createUrl = isUser
          ? `/user/sites/${siteId}/trees`
          : `/admin/trees/add`;
        try {
          await API.post(
            createUrl,
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
              // Backend stores plantedBy (ObjectId) separately; this is display-only.
              plantedByName: form.plantedBy || username || undefined,
              images,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          toast.success("Plant added successfully");
        } catch (primaryErr: unknown) {
          const notFound =
            axiosResponseStatus(primaryErr) === 404 &&
            /Route not found/i.test(axiosResponseDataMessage(primaryErr));
          if (isUser && notFound) {
            await API.post(
              `/user/site/dashboard/add`,
              {
                treeName: form.treeName,
                coordinates: {
                  lat: form.coordinates.lat,
                  lng: form.coordinates.lng,
                },
                image: images[0]?.url, // legacy endpoint expects single image field
                status: form.status,
                remarks: form.remarks || undefined,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            toast.success("Plant added successfully");
          } else {
            throw primaryErr;
          }
        }
      }

      // Notify parent and close or navigate depending on context
      if (onTreeSaved) onTreeSaved();
      if (onClose) {
        onClose();
      } else if (siteId) {
        if (role === "user") {
          navigate(`/user/site/${siteId}`, { state: { refresh: true } });
        } else {
          navigate(`/admin/dashboard/${siteId}`, { state: { refresh: true } });
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const status = axiosResponseStatus(err);
      const msg = messageFromUnknown(
        err,
        err instanceof Error ? err.message : "",
      );
      const isTooLarge =
        status === 413 ||
        (typeof msg === "string" &&
          /payload\s*too\s*large|entity\s*too\s*large|too\s*large/i.test(msg));
      if (isTooLarge) {
        setError(
          "Image size limit exceeded (~4MB). Please use a smaller image.",
        );
      } else {
        setError(
          msg ||
            `Failed to ${isEditMode ? "update" : "add"} tree. Please try again.`,
        );
      }
      toast.error(
        msg ||
          `Failed to ${isEditMode ? "update" : "add"} plant. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper: wait for video frames (events + polling fallback)
  const waitForVideoReady = (video: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 40; // ~6s
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

  // Helper: get stream with fallback attempts
  const getStreamWithFallback = async (): Promise<MediaStream> => {
    const constraintsList: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "environment" } }, audio: false },
      { video: true, audio: false },
    ];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const backCam = devices.find(
        (d) =>
          d.kind === "videoinput" && /back|rear|environment/i.test(d.label),
      );
      if (backCam) {
        constraintsList.unshift({
          video: { deviceId: { exact: backCam.deviceId } },
          audio: false,
        });
      }
    } catch {
      // ignore errors
    }
    let lastError: unknown = null;
    for (const c of constraintsList) {
      try {
        return await navigator.mediaDevices.getUserMedia(c);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error("Unable to access camera");
  };

  // Larger cap when API uploads to S3 (see harit-api body limit); still compress on device
  const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
  const dataUrlBytes = (dataUrl: string): number => {
    const base64 = dataUrl.split(",")[1] || "";
    const padding = (base64.match(/=+$/) || [""])[0].length;
    return (base64.length * 3) / 4 - padding;
  };
  const compressToLimit = async (
    dataUrl: string,
    targetBytes: number = MAX_IMAGE_BYTES,
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

  // Open camera (stream init deferred to effect)
  const openCamera = () => {
    setError("");
    setCameraAttempts((a: number) => a + 1);
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((t: MediaStreamTrack) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCameraInitializing(true);
    setCameraOpen(true);
  };

  // Close camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
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
          "Image size limit exceeded (~4MB). Capture closer or lower resolution.",
        );
        return;
      }
      setImagePreview(dataUrl);
      setForm((prev: TreeForm) => ({ ...prev, image: dataUrl }));
      closeCamera();
    } catch (e: unknown) {
      setError(errorMessage(e) || "Failed to capture image");
    }
  };

  // Handle file input change
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const compressed = await compressToLimit(result);
        if (dataUrlBytes(compressed) > MAX_IMAGE_BYTES) {
          setError(
            "Image size limit exceeded (~4MB). Please choose a smaller image.",
          );
          setImagePreview(null);
          setForm((prev: TreeForm) => ({ ...prev, image: null }));
          return;
        }
        setImagePreview(compressed);
        setForm((prev: TreeForm) => ({ ...prev, image: compressed }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    setForm((prev: TreeForm) => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Stream acquisition lifecycle when camera modal opens
  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;

    const startStream = async () => {
      setCameraInitializing(true);
      setCameraReady(false);
      await new Promise((r) => requestAnimationFrame(r));
      if (!videoRef.current) {
        setError("Video element not available");
        setCameraInitializing(false);
        return;
      }
      try {
        const stream = await getStreamWithFallback();
        if (cancelled) {
          stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.muted = true;
        videoRef.current.setAttribute("playsInline", "");
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          void playErr;
        }
        try {
          await waitForVideoReady(videoRef.current);
          if (!cancelled) setCameraReady(true);
        } catch (readyErr: unknown) {
          console.error(readyErr);
          if (!cancelled) {
            if (
              errorName(readyErr) === "NotAllowedError" ||
              errorName(readyErr) === "SecurityError"
            ) {
              setError(
                "Camera permission denied. Grant access and click Retry.",
              );
            } else {
              setError(
                "Camera took too long to start. Check permissions or click Retry.",
              );
            }
            setCameraReady(false);
          }
        }
      } catch (err: unknown) {
        console.error("Error accessing camera:", err);
        if (!cancelled) {
          if (
            errorName(err) === "NotAllowedError" ||
            errorName(err) === "SecurityError"
          ) {
            setError(
              "Camera permission denied. Allow access then click Retry.",
            );
          } else {
            setError(
              (errorMessage(err) || "Failed to access camera") +
                ". Check permissions or use Upload Image.",
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
        streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  const retryCamera = () => {
    closeCamera();
    requestAnimationFrame(() => openCamera());
  };

  const handleBack = () => {
    closeCamera();
    if (onClose) return onClose();
    if (siteId) {
      if (role === "user") navigate(`/user/site/${siteId}`);
      else navigate(`/admin/dashboard/${siteId}`);
    } else {
      if (role === "user") navigate(`/user/dashboard`);
      else navigate(`/admin/dashboard`);
    }
  };

  const isModal = !!onClose;

  return (
    <div
      className={
        isModal
          ? "h-full max-h-screen overflow-y-auto bg-white text-gray-900 flex flex-col"
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
              <div className="flex items-center gap-2">
                <img src="/icon.svg" alt="Harit Logo" className="h-8" />
                <span className="text-2xl font-bold text-gray-800">हरित</span>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <div
        className={
          isModal ? "p-4 sm:p-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
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
          {secureContextWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-md text-sm">
              {secureContextWarning}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      {manualCoords ? "(Manual)" : "(Auto-filled from device)"}
                    </span>
                  </label>
                  <input
                    type="number"
                    id="lat"
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
                      {manualCoords ? "(Manual)" : "(Auto-filled from device)"}
                    </span>
                  </label>
                  <input
                    type="number"
                    id="lng"
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
                        : form.coordinates.lng === 0
                          ? "border-gray-300"
                          : "border-red-500"
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
                htmlFor="plantedBy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Planted By
                <span className="text-xs text-gray-500 ml-1">
                  (Optional - defaults to your name)
                </span>
              </label>
              <input
                type="text"
                id="plantedBy"
                name="plantedBy"
                value={form.plantedBy}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the name of the person who planted this tree"
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
                    crossOrigin={crossOriginForRemoteImage(imagePreview)}
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

              {/* Camera Modal */}
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
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 inline-flex items-center justify-center gap-2"
                        style={{ backgroundColor: "#48845C" }}
                      >
                        <Camera className="w-4 h-4" />
                        {cameraReady ? "Capture Photo" : "Waiting..."}
                      </button>
                      {!cameraInitializing && !cameraReady && (
                        <button
                          type="button"
                          onClick={retryCamera}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 inline-flex items-center justify-center gap-2"
                          style={{ backgroundColor: "#1D4ED8" }}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Capture Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={openCamera}
                  disabled={cameraInitializing}
                  className="sm:flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
                  className="sm:flex-1 px-4 py-2 text-sm font-medium rounded-lg text-center cursor-pointer inline-flex items-center justify-center gap-2 border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 active:bg-sky-200 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-300/60 focus-within:ring-offset-2"
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
