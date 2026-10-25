import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hodNotificationsApi } from "../../../../../api/hodNotificationsApi";
import HODLayout from "../../components/hod/HODLayout";
import "../../styles/hod/HODNotifications.css";

function HODNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setNotifications(await hodNotificationsApi.getMine());
    } catch (loadError) {
      setError(loadError.message || "Unable to load HOD notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const openNotification = async (notification) => {
    setUpdatingId(notification.id);
    setError("");
    try {
      if (!notification.read) {
        await hodNotificationsApi.markRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );
      }
      navigate(notification.target);
    } catch (updateError) {
      setError(updateError.message || "Unable to update notification status.");
    } finally {
      setUpdatingId("");
    }
  };

  const markAllRead = async () => {
    setIsMarkingAllRead(true);
    setError("");
    try {
      await hodNotificationsApi.markAllRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true }))
      );
    } catch (updateError) {
      setError(updateError.message || "Unable to mark notifications as read.");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <HODLayout>
      <section className="hod-notifications">
        <header className="hod-notifications-header">
          <div>
            <h2>Notifications</h2>
            <p>Department requests that need your attention.</p>
          </div>
          {unreadCount > 0 && (
            <button
              className="hod-notifications-mark-read"
              disabled={isMarkingAllRead}
              onClick={markAllRead}
              type="button"
            >
              {isMarkingAllRead ? "Saving..." : "Mark all as read"}
            </button>
          )}
        </header>

        {error && (
          <div className="hod-notifications-error" role="alert">
            <span>{error}</span>
            <button onClick={loadNotifications} type="button">Retry</button>
          </div>
        )}

        {isLoading ? (
          <p className="hod-notifications-empty" role="status">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="hod-notifications-empty">
            You&apos;re all caught up. There are no pending department requests.
          </p>
        ) : (
          <div className="hod-notifications-list">
            {notifications.map((notification) => (
              <button
                aria-label={`${notification.read ? "" : "Unread: "}${notification.title}. ${notification.text}`}
                className={`hod-notification-item${notification.read ? "" : " unread"}`}
                disabled={updatingId === notification.id}
                key={notification.id}
                onClick={() => openNotification(notification)}
                type="button"
              >
                <span className="hod-notification-indicator" aria-hidden="true" />
                <span className="hod-notification-content">
                  <strong>{notification.title}</strong>
                  <span>{notification.text}</span>
                  <time dateTime={notification.createdAt}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </time>
                </span>
                <span className="hod-notification-action" aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </HODLayout>
  );
}

export default HODNotifications;
