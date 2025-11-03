import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, Check } from '@phosphor-icons/react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  console.log('📋 Dropdown state:', { notificationsCount: notifications.length, unreadCount });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      WELCOME: '🎉',
      SUCCESS: '✅',
      INFO: 'ℹ️',
      WARNING: '⚠️',
      ERROR: '❌',
      COURSE_ENROLLED: '📚',
      COURSE_COMPLETED: '🎓',
      NEW_LESSON: '📖',
      CERTIFICATE_EARNED: '🏆',
      PAYMENT_SUCCESS: '💳',
      PAYMENT_FAILED: '❌',
      FOLLOW: '👤',
      COMMENT: '💬',
      SYSTEM: '⚙️',
    };
    return icons[type] || '🔔';
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    e.preventDefault();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    e.preventDefault();
    await deleteNotification(notificationId);
  };

  const displayedNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors"
      >
        <Bell size={24} weight="bold" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Check size={14} weight="bold" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              displayedNotifications.map((notification) => (
                <Link
                  key={notification._id}
                  to={notification.actionUrl || '/dashboard/notifications'}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                    setIsOpen(false);
                  }}
                  className={`block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0">
                      {notification.icon || getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notification._id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check size={16} weight="bold" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, notification._id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Supprimer"
                      >
                        <X size={16} weight="bold" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link
              to="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-center text-sm text-purple-600 hover:text-purple-700 font-medium border-t border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Voir toutes les notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
