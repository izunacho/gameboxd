'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getUnreadNotificationCount,
  getMyNotifications,
  markAllNotificationsRead,
  AppNotification,
} from '@/lib/notifications-data';

/** Bell icon with unread badge and a dropdown of recent notifications. */
export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshCount = () => {
    getUnreadNotificationCount()
      .then(setUnread)
      .catch((err) => console.error('Failed to load notification count:', err));
  };

  useEffect(() => {
    refreshCount();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshCount());
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      getMyNotifications(10)
        .then(setNotifications)
        .catch((err) => console.error('Failed to load notifications:', err))
        .finally(() => setLoading(false));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-dark-text hover:text-primary transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary text-black text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card p-2 z-10 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {loading && (
            <p className="text-sm text-dark-text px-2 py-3">Loading...</p>
          )}
          {!loading && notifications.length === 0 && (
            <p className="text-sm text-dark-text px-2 py-3">No notifications yet.</p>
          )}
          {!loading &&
            notifications.map((n) => (
              <Link
                key={n.id}
                href={n.review ? `/game/${n.review.igdbId}` : `/user/${encodeURIComponent(n.actorUsername)}`}
                onClick={() => setOpen(false)}
                className={`block px-2 py-2 rounded text-sm hover:bg-dark-bg ${
                  n.read ? 'text-dark-text' : 'text-white font-medium'
                }`}
              >
                {n.type === 'new_review' ? (
                  <>
                    <span className="text-primary">{n.actorUsername}</span> posted a review
                    {n.review ? ` for ${n.review.gameName}` : ''}
                  </>
                ) : (
                  <>
                    <span className="text-primary">{n.actorUsername}</span> started following you
                  </>
                )}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
