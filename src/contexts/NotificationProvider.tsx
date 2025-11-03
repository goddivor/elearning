import React, { useState, useEffect, type ReactNode } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useAuth } from './AuthContext';
import {
  GET_MY_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS_COUNT,
  NOTIFICATION_CREATED_SUBSCRIPTION,
} from '@/graphql/queries/notification.queries';
import {
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  DELETE_NOTIFICATION,
} from '@/graphql/mutations/notification.mutations';
import type { Notification, NotificationsResponse } from '@/types/notification';
import { NotificationContext, type NotificationContextType } from './NotificationContext';

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Query to get notifications
  const { data: notificationsData, loading, refetch } = useQuery<{
    getMyNotifications: NotificationsResponse;
  }>(GET_MY_NOTIFICATIONS, {
    variables: {
      input: {
        limit: 20,
        skip: 0,
      },
    },
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  // Query to get unread count
  const { data: unreadCountData } = useQuery<{ getUnreadNotificationsCount: number }>(
    GET_UNREAD_NOTIFICATIONS_COUNT,
    {
      skip: !isAuthenticated,
      pollInterval: 30000, // Poll every 30 seconds
      fetchPolicy: 'network-only',
    }
  );

  // Subscribe to new notifications
  useSubscription(NOTIFICATION_CREATED_SUBSCRIPTION, {
    variables: { userId: user?._id },
    skip: !user?._id,
    onData: ({ data }) => {
      if (data.data?.notificationCreated) {
        const newNotification = data.data.notificationCreated;
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: newNotification.icon || '/logo.png',
            });
          }
        }
      }
    },
  });

  // Mutations
  const [markAsReadMutation] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllAsReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
  const [deleteNotificationMutation] = useMutation(DELETE_NOTIFICATION);

  // Update state when data changes
  useEffect(() => {
    if (notificationsData?.getMyNotifications) {
      console.log('📧 Notifications data received:', notificationsData.getMyNotifications);
      setNotifications(notificationsData.getMyNotifications.notifications);
    }
  }, [notificationsData]);

  useEffect(() => {
    if (unreadCountData?.getUnreadNotificationsCount !== undefined) {
      console.log('🔢 Unread count received:', unreadCountData.getUnreadNotificationsCount);
      setUnreadCount(unreadCountData.getUnreadNotificationsCount);
    }
  }, [unreadCountData]);

  // Request notification permission on mount
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isAuthenticated]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation({
        variables: {
          input: { notificationId },
        },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotificationFn = async (notificationId: string) => {
    try {
      await deleteNotificationMutation({
        variables: { notificationId },
      });

      const notification = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationFn,
    refetch,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
};
