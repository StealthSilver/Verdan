import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  deleteNotification as deleteNotificationApi,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteAllNotifications,
  type NotificationRow,
} from "../../services/notificationService";
import { formatRelativeTime } from "../../utils/relativeTime";
import "./NotificationBell.css";

function notifyIcon(type: string) {
  if (type === "PLANT_DELETED" || type === "PLANT_RECORD_DELETED") {
    return (
      <span className="shrink-0 text-red-500" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 3h6v1H9V3zm-2 3h12v16a2 2 0 01-2 2H9a2 2 0 01-2-2V6zm3 4v8h2v-8h-2z"
            fill="currentColor"
          />
        </svg>
      </span>
    );
  }
  if (type === "PLANT_APPROVED") {
    return (
      <span className="shrink-0 text-emerald-600" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
  if (
    type === "PLANT_ADDED" ||
    type === "PLANT_UPDATED" ||
    type === "PLANT_RECORD_ADDED"
  ) {
    return (
      <span className="shrink-0 text-emerald-600" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
  return (
    <span className="shrink-0 text-gray-500" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="2" />
      </svg>
    </span>
  );
}

export default function NotificationBell() {
  const { role, token } = useAuth();
  const notificationsEnabled = role === "admin" || role === "user";
  const navigate = useNavigate();
  const location = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadRef = useRef<number>(0);
  const unreadInitRef = useRef(false);
  const [ring, setRing] = useState(false);
  const [badgePop, setBadgePop] = useState(false);

  const refreshUnread = useCallback(async () => {
    if (!token || !notificationsEnabled) return;
    try {
      const n = await getUnreadCount();
      const prev = prevUnreadRef.current;
      if (!unreadInitRef.current) {
        unreadInitRef.current = true;
        prevUnreadRef.current = n;
        setUnreadCount(n);
        return;
      }
      if (n > prev) {
        setRing(true);
        setBadgePop(true);
        window.setTimeout(() => setRing(false), 700);
        window.setTimeout(() => setBadgePop(false), 220);
      } else if (n !== prev) {
        setBadgePop(true);
        window.setTimeout(() => setBadgePop(false), 220);
      }
      prevUnreadRef.current = n;
      setUnreadCount(n);
    } catch {
      /* ignore */
    }
  }, [token, notificationsEnabled]);

  const loadList = useCallback(async () => {
    if (!token || !notificationsEnabled) return;
    try {
      const data = await getNotifications({ page: 1, limit: 25, filter: "all" });
      setItems(data.notifications || []);
    } catch {
      setItems([]);
    }
  }, [token, notificationsEnabled]);

  useEffect(() => {
    if (!token || !notificationsEnabled) return;
    void refreshUnread();
    const id = window.setInterval(() => void refreshUnread(), 60_000);
    return () => window.clearInterval(id);
  }, [token, notificationsEnabled, refreshUnread]);

  useEffect(() => {
    if (!open) return;
    void loadList();
    void refreshUnread();
  }, [open, loadList, refreshUnread]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!notificationsEnabled) return null;

  const badgeLabel =
    unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : "";

  const onItemClick = async (n: NotificationRow, e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest(".notification-bell-item-delete")) return;
    if (!n.isRead) {
      try {
        await markAsRead(n._id);
        setItems((prev) =>
          prev.map((x) =>
            x._id === n._id ? { ...x, isRead: true } : x,
          ),
        );
        void refreshUnread();
      } catch {
        /* ignore */
      }
    }
  };

  const onDeleteOne = async (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    try {
      await deleteNotificationApi(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
      void refreshUnread();
    } catch {
      /* ignore */
    }
  };

  const onMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      void refreshUnread();
    } catch {
      /* ignore */
    }
  };

  const onDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setItems([]);
      void refreshUnread();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="notification-bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`notification-bell-trigger ${ring ? "notification-bell-trigger--ring" : ""}`}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 10-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 ? (
          <span
            className={`notification-bell-badge ${badgePop ? "notification-bell-badge--pop" : ""}`}
          >
            {badgeLabel}
          </span>
        ) : null}
      </button>

      <div
        className={`notification-bell-panel ${open ? "notification-bell-panel--open" : ""}`}
        role="dialog"
        aria-label="Notification list"
      >
        <div className="notification-bell-header">
          <span className="notification-bell-title">Notifications</span>
          <button
            type="button"
            className="notification-bell-mark-all"
            onClick={() => void onMarkAllRead()}
          >
            Mark all read
          </button>
        </div>
        <div className="notification-bell-list">
          {items.length === 0 ? (
            <div className="notification-bell-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8a6 6 0 10-12 0c0 5-2 6-2 6h16s-2-1-2-6"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                />
                <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#9ca3af" strokeWidth="1.5" />
              </svg>
              <div>You&apos;re all caught up!</div>
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n._id}
                className={`notification-bell-item ${!n.isRead ? "notification-bell-item--unread" : ""}`}
                onClick={(e) => void onItemClick(n, e)}
              >
                {notifyIcon(n.type)}
                <div className="min-w-0 flex-1">
                  <p
                    className={`notification-bell-item-msg ${!n.isRead ? "notification-bell-item-msg--unread" : ""}`}
                  >
                    {n.message}
                  </p>
                  <div className="notification-bell-item-time">
                    {formatRelativeTime(n.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  className="notification-bell-item-delete"
                  aria-label="Delete notification"
                  onClick={(e) => void onDeleteOne(n._id, e)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        <div className="notification-bell-footer">
          <button
            type="button"
            className="notification-bell-delete-all"
            onClick={() => void onDeleteAll()}
          >
            Delete All
          </button>
          <button
            type="button"
            className="notification-bell-see-all"
            onClick={() => {
              setOpen(false);
              const from = `${location.pathname}${location.search}`;
              navigate("/notifications", { state: { from } });
            }}
          >
            See All
          </button>
        </div>
      </div>
    </div>
  );
}
