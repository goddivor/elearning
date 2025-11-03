import { gql } from '@apollo/client';

export const SEND_TEST_NOTIFICATION = gql`
  mutation SendTestNotification {
    sendTestNotification {
      _id
      title
      message
      type
      isRead
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($input: MarkNotificationReadInput!) {
    markNotificationAsRead(input: $input) {
      _id
      isRead
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: String!) {
    deleteNotification(notificationId: $notificationId)
  }
`;
