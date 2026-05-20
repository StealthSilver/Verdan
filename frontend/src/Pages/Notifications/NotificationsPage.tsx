import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { avatarDataUrl } from "../../utils/avatars";
import API from "../../api";
import {
  deleteNotification,
  deleteAllNotifications,
  getNotifications,
  markAllAsRead,
  markAsRead,
  type NotificationRow,
} from "../../services/notificationService";
import { formatRelativeTime } from "../../utils/relativeTime";
import { messageFromUnknown } from "../../utils/apiError";
import NotificationBell from "../../components/NotificationBell/NotificationBell";
import "./NotificationsPage.css";

const VERDAN_GREEN = "#48845C";

type FilterKey = "all" | "unread" | "plants" | "team" | "sites" | "access";

interface UserMe {
  name?: string;
  email?: string;
}

function notifyIconLarge(type: string) {
  if (type === "PLANT_APPROVED") {
    return (
      <span className="shrink-0 text-emerald-600" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 12l2.5 2.5L16 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (type === "PLANT_DELETED" || type === "PLANT_RECORD_DELETED") {
    return (
      <span className="shrink-0 text-red-500" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 3h6v1H9V3zm-2 3h12v16a2 2 0 01-2 2H9a2 2 0 01-2-2V6zm3 4v8h2v-8h-2z"
            fill="currentColor"
          />
        </svg>
      </span>
    );
  }
  if (
    type === "PLANT_ADDED" ||
    type === "PLANT_UPDATED" ||
    type === "PLANT_RECORD_ADDED"
  ) {
    return (
      <span className="shrink-0 text-emerald-600" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3c-3 4-6 7.5-6 11a6 6 0 1012 0c0-3.5-3-7-6-11z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </span>
    );
  }
  if (
    type === "TEAM_MEMBER_ADDED" ||
    type === "TEAM_MEMBER_UPDATED" ||
    type === "TEAM_MEMBER_REMOVED"
  ) {
    return (
      <span className="shrink-0 text-blue-600" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5 19c1.5-4 6.5-4 8 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (type === "SITE_UPDATED") {
    return (
      <span className="shrink-0 text-amber-600" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 20V10l8-5 8 5v10h-6v-6H10v6H4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (type === "ACCESS_REQUEST_SUBMITTED") {
    return (
      <span className="shrink-0 text-violet-600" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6h16v12H4V6zm2 0 8 5 8-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return null;
}

function emptyMessage(filter: FilterKey, isUser: boolean): string {
  if (isUser) {
    if (filter === "unread") return "No unread notifications.";
    return "No plant approvals yet. You will see a notice when an admin approves a plant on your site.";
  }
  switch (filter) {
    case "unread":
      return "No unread notifications.";
    case "plants":
      return "No plant activity for your managed sites.";
    case "team":
      return "No team updates yet.";
    case "sites":
      return "No site updates yet.";
    case "access":
      return "No access requests in notifications.";
    default:
      return "You're all caught up — nothing to show for this view.";
  }
}

export default function NotificationsPage() {
  const { token, logout, role, avatarId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserMe | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      try {
        const res = await API.get<UserMe>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data as UserMe);
      } catch {
        setUser(null);
      }
    };
    void run();
  }, [token]);

  useEffect(() => {
    if (role === "user" && filter !== "all" && filter !== "unread") {
      setFilter("all");
      setPage(1);
    }
  }, [role, filter]);

  useEffect(() => {
    if (!token || (role !== "admin" && role !== "user")) return;

    let cancelled = false;
    const append = page > 1;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const qFilter =
          filter === "all" ? undefined : filter === "unread" ? "unread" : filter;
        const data = await getNotifications({
          page,
          limit: 20,
          filter: qFilter,
        });
        if (cancelled) return;
        setPagination(data.pagination);
        setItems((prev) =>
          append ? [...prev, ...data.notifications] : data.notifications,
        );
      } catch (err: unknown) {
        if (!cancelled) {
          setError(messageFromUnknown(err, "Failed to load notifications"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [token, role, filter, page]);

  const isUser = role === "user";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBack = () => {
    const st = location.state as { from?: string } | undefined;
    if (typeof st?.from === "string" && st.from.startsWith("/")) {
      navigate(st.from);
      return;
    }
    if (role === "user") {
      navigate("/user/dashboard");
      return;
    }
    navigate(-1);
  };

  const setFilterAndReset = (f: FilterKey) => {
    setFilter(f);
    setPage(1);
  };

  const onCardClick = async (n: NotificationRow, e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest(".notifications-card-delete")) return;
    if (!n.isRead) {
      try {
        await markAsRead(n._id);
        setItems((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)),
        );
      } catch {
        /* ignore */
      }
    }
  };

  const onDeleteOne = async (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    try {
      await deleteNotification(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch {
      /* ignore */
    }
  };

  const onMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    } catch {
      /* ignore */
    }
  };

  const onDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setItems([]);
    } catch {
      /* ignore */
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  if (role !== "admin" && role !== "user") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  const hasMore = pagination.currentPage < pagination.totalPages;
  const pills: { key: FilterKey; label: string }[] = isUser
    ? [
        { key: "all", label: "All" },
        { key: "unread", label: "Unread" },
      ]
    : [
        { key: "all", label: "All" },
        { key: "unread", label: "Unread" },
        { key: "plants", label: "Plants" },
        { key: "team", label: "Team" },
        { key: "sites", label: "Sites" },
        { key: "access", label: "Access" },
      ];

  return (
    <div className="notifications-page min-h-screen bg-gray-50">
      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ borderBottomColor: VERDAN_GREEN + "15" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="Harit Logo" className="h-8" />
              <span className="text-2xl font-bold text-gray-800">हरित</span>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={avatarDataUrl(avatarId)}
                    alt="Profile avatar"
                    className="h-8 w-8 rounded-xl border border-gray-200 bg-white"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="font-medium text-gray-800 text-sm hidden sm:block">
                    {user?.name}
                  </span>
                </button>

                {dropdownOpen ? (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 overflow-hidden z-50 shadow-card">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>
                    <ul className="py-1">
                      <li
                        onClick={() => navigate("/profile")}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        Profile
                      </li>
                      <li
                        onClick={() => navigate("/settings")}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        Settings
                      </li>
                      <li
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-200 transition-colors"
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
              {isUser ? "Notifications" : "All Notifications"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isUser
                ? "Plants approved by an admin on your assigned sites"
                : "Activity across your managed sites"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors active:scale-95 shrink-0 self-start sm:self-auto"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft className="text-xs" aria-hidden />
            Back
          </button>
        </div>

        <div className="notifications-pills">
          {pills.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`notifications-pill ${filter === p.key ? "notifications-pill--active" : ""}`}
              onClick={() => setFilterAndReset(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {items.length > 0 ? (
          <div className="notifications-bulk">
            <button
              type="button"
              className="notifications-bulk-mark"
              onClick={() => void onMarkAllRead()}
            >
              Mark All as Read
            </button>
            <button
              type="button"
              className="notifications-bulk-delete"
              onClick={() => void onDeleteAll()}
            >
              Delete All
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        ) : null}

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-16 text-gray-500 text-sm">
            Loading notifications…
          </div>
        ) : items.length === 0 ? (
          <div className="notifications-empty">
            {emptyMessage(filter, isUser)}
          </div>
        ) : (
          <>
            {items.map((n) => (
              <div
                key={n._id}
                className={`notifications-card ${!n.isRead ? "notifications-card--unread" : ""}`}
                onClick={(e) => void onCardClick(n, e)}
              >
                {notifyIconLarge(n.type)}
                <div className="min-w-0 flex-1 pr-8">
                  <p
                    className={`notifications-card-msg ${!n.isRead ? "notifications-card-msg--unread" : ""}`}
                  >
                    {n.message}
                  </p>
                  <div className="notifications-card-time">
                    {formatRelativeTime(n.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  className="notifications-card-delete"
                  aria-label="Delete notification"
                  onClick={(e) => void onDeleteOne(n._id, e)}
                >
                  ×
                </button>
              </div>
            ))}
            {hasMore ? (
              <div className="notifications-load-more">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
