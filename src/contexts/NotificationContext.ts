import { createContext } from 'react';
import type { Notification } from '@/types/notification';

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refetch: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
