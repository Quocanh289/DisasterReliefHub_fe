export interface NotificationItem {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: string | null;
}
