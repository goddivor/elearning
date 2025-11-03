export const NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  WELCOME: 'WELCOME',
  COURSE_ENROLLED: 'COURSE_ENROLLED',
  COURSE_COMPLETED: 'COURSE_COMPLETED',
  NEW_LESSON: 'NEW_LESSON',
  CERTIFICATE_EARNED: 'CERTIFICATE_EARNED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  FOLLOW: 'FOLLOW',
  COMMENT: 'COMMENT',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: string; // JSON string
  actionUrl?: string;
  icon?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  stats: NotificationStats;
  hasMore: boolean;
  total: number;
}
