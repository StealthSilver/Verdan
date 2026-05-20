import API from "../api";

export interface NotificationRow {
  _id: string;
  type: string;
  message: string;
  siteId?: string;
  siteName?: string;
  isRead: boolean;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  filter?: string;
}) {
  const res = await API.get<{
    notifications: NotificationRow[];
    pagination: NotificationsPagination;
  }>("api/notifications", { params });
  return res.data;
}

export async function getUnreadCount() {
  const res = await API.get<{ count: number }>("api/notifications/unread-count");
  return res.data.count;
}

export async function markAsRead(id: string) {
  const res = await API.patch(`api/notifications/${id}/read`);
  return res.data;
}

export async function markAllAsRead() {
  const res = await API.patch("api/notifications/mark-all-read");
  return res.data;
}

export async function deleteNotification(id: string) {
  const res = await API.delete(`api/notifications/${id}`);
  return res.data;
}

export async function deleteAllNotifications() {
  const res = await API.delete("api/notifications");
  return res.data;
}
