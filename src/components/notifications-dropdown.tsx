'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { setupNotificationListener, markNotificationAsRead } from '@/lib/firebase-services';
import type { Notification } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsDropdownProps {
    userId: string;
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        // The listener returns unread notifications based on the query in firebase-services
        // We might want to fetch recent read ones too, but for now let's focus on unread/recent
        const unsubscribe = setupNotificationListener(userId, (newNotifications) => {
            // We need to handle potential data transformation here if dates are Timestamps
            const formattedNotifications = newNotifications.map(n => ({
                ...n,
                // Handle Firestore Timestamp conversion if needed, though types say 'any' for now
                createdAt: n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt),
            })) as Notification[];

            setNotifications(formattedNotifications);
            setUnreadCount(formattedNotifications.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [userId]);

    const handleMarkAsRead = async (id: string, link?: string) => {
        try {
            await markNotificationAsRead(id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        // In a real app, we'd have a batch function, but for now loop
        // or just mark visible ones. 
        notifications.filter(n => !n.read).forEach(n => markNotificationAsRead(n.id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full animate-in zoom-in"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto text-xs px-2" onClick={handleMarkAllAsRead}>
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="flex flex-col p-1">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "relative flex flex-col gap-1 p-3 rounded-md transition-colors hover:bg-muted/50 cursor-pointer",
                                        !notification.read && "bg-muted/30"
                                    )}
                                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className={cn("text-sm font-medium leading-none", !notification.read && "text-primary")}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            className="absolute inset-0"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                            <span className="sr-only">View</span>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
