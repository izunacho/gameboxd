'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, BellRing } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getUnreadNotificationCount,
  getMyNotifications,
  markAllNotificationsRead,
  AppNotification,
} from '@/lib/notifications-data';
import { getPushStatus, enablePush, disablePush, PushStatus } from '@/lib/push';
import VerifiedTick from './VerifiedTick';

/** Bell icon with unread badge and a dropdown of recent notifications. */
export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

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
      getPushStatus()
        .then(setPushStatus)
        .catch(() => setPushStatus('unsupported'));
    }
  };

  const handleTogglePush = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    setPushError(null);
    try {
      if (pushStatus === 'subscribed') {
        await disablePush();
        setPushStatus('unsubscribed');
      } else {
        await enablePush();
        setPushStatus('subscribed');
      }
    } catch (err: any) {
      if (err?.message === 'PERMISSION_DENIED') {
        setPushStatus('denied');
      } else if (err?.message === 'SW_NOT_READY') {
        setPushError('Push alerts only work in the deployed app.');
      } else {
        setPushError("Couldn't update push alerts. Try again.");
        console.error('Failed to toggle push:', err);
      }
    } finally {
      setPushBusy(false);
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
          <span className="absolute -top-0.5 -right-0.5 bg-primary on-primary text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
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

          {/* Push alerts toggle */}
          <div className="px-2 py-2 border-b border-dark-border mb-1">
            {pushStatus === 'unsupported' && (
              <p className="text-xs text-dark-text">
                Push alerts aren't available here. Install Hitboxd on your device first —{' '}
                <Link
                  href="/install"
                  onClick={() => setOpen(false)}
                  className="text-primary hover:underline"
                >
                  see how
                </Link>
                .
              </p>
            )}
            {pushStatus === 'denied' && (
              <p className="text-xs text-dark-text">
                Notifications are blocked for this site — allow them in your browser settings to
                get push alerts.
              </p>
            )}
            {(pushStatus === 'subscribed' || pushStatus === 'unsubscribed') && (
              <button
                onClick={handleTogglePush}
                disabled={pushBusy}
                className="flex items-center gap-2 text-xs text-primary hover:underline disabled:opacity-50"
              >
                <BellRing className="w-3.5 h-3.5" />
                {pushBusy
                  ? 'Updating...'
                  : pushStatus === 'subscribed'
                    ? 'Push alerts on — turn off for this device'
                    : 'Enable push alerts on this device'}
              </button>
            )}
            {pushError && <p className="text-xs text-red-400 mt-1">{pushError}</p>}
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
                    <span className="text-primary">{n.actorUsername}</span>
                    <VerifiedTick cosmetics={n.actorCosmetics} className="w-3.5 h-3.5 ml-0.5" /> posted a review
                    {n.review ? ` for ${n.review.gameName}` : ''}
                  </>
                ) : (
                  <>
                    <span className="text-primary">{n.actorUsername}</span>
                    <VerifiedTick cosmetics={n.actorCosmetics} className="w-3.5 h-3.5 ml-0.5" /> started following you
                  </>
                )}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
