import { gql } from '@apollo/client';

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($input: GetNotificationsInput) {
    getMyNotifications(input: $input) {
      notifications {
        _id
        userId
        title
        message
        type
        isRead
        metadata
        actionUrl
        icon
        createdAt
        readAt
      }
      stats {
        total
        unread
        read
      }
      hasMore
      total
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount {
    getUnreadNotificationsCount
  }
`;

export const NOTIFICATION_CREATED_SUBSCRIPTION = gql`
  subscription NotificationCreated($userId: String!) {
    notificationCreated(userId: $userId) {
      _id
      userId
      title
      message
      type
      isRead
      metadata
      actionUrl
      icon
      createdAt
    }
  }
`;

export const NOTIFICATION_UPDATED_SUBSCRIPTION = gql`
  subscription NotificationUpdated($userId: String!) {
    notificationUpdated(userId: $userId) {
      _id
      userId
      title
      message
      type
      isRead
      metadata
      actionUrl
      icon
      createdAt
      readAt
    }
  }
`;
