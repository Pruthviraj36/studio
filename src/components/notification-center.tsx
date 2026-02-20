'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { setupNotificationListener, markNotificationAsRead } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ChatMessage' | 'JoinRequest' | 'TeamUpdate' | 'Info';
  link: string;
  read: boolean;
  createdAt: any;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = setupNotificationListener(user.uid, (notifs) => {
      setNotifications(notifs as Notification[]);
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe?.();
  }, [user]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ChatMessage':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'JoinRequest':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'TeamUpdate':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold">Notifications</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative',
                    !notif.read && 'bg-blue-50 dark:bg-blue-950/20'
                  )}
                  onClick={() => {
                    if (!notif.read) {
                      handleMarkAsRead(notif.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{notif.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(() => {
                          const date = notif.createdAt?.toDate?.() || new Date(notif.createdAt);
                          const now = new Date();
                          const diff = now.getTime() - date.getTime();
                          const minutes = Math.floor(diff / 60000);
                          const hours = Math.floor(diff / 3600000);
                          const days = Math.floor(diff / 86400000);

                          if (minutes < 1) return 'just now';
                          if (minutes < 60) return `${minutes}m ago`;
                          if (hours < 24) return `${hours}h ago`;
                          return `${days}d ago`;
                        })()}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
