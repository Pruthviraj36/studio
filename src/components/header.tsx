'use client';

import { Bell, LogOut, Settings, User, MessageCircle, UserPlus, Info } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidebarTrigger } from './ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from './auth-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './ui/sidebar';
import { signOutUser, markNotificationAsRead } from '@/lib/firebase-services';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';

const pathToTitle: { [key: string]: string } = {
  '/discover': 'Discover Developers',
  '/teams': 'Manage Your Teams',
  '/ai-match': 'AI Team Recommendations',
  '/chat': 'Conversations',
  '/profile': 'My Profile',
  '/admin': 'Admin Dashboard',
};

export function Header() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const { user: authUser, profile } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!authUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', authUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [authUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'ChatMessage': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'JoinRequest': return <UserPlus className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      localStorage.clear();
      sessionStorage.clear();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userDisplay = {
    name: profile?.name || authUser?.displayName || 'Builder',
    avatar: profile?.avatar || authUser?.uid || 'default',
    location: profile?.location || 'Remote',
  };

  const getTitle = () => {
    for (const path in pathToTitle) {
      if (pathname.startsWith(path)) {
        return pathToTitle[path];
      }
    }
    return 'HackConnect';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-8">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-lg font-semibold font-headline tracking-tight">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
            <DropdownMenuLabel className="p-4 border-b">
              Notifications
            </DropdownMenuLabel>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-accent",
                      !notif.read && "bg-primary/5 border-l-2 border-primary"
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getNotifIcon(notif.type)}
                        <span className="font-semibold text-sm">{notif.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleDateString() : 'now'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-xs" size="sm" onClick={() => router.push('/profile?tab=notifications')}>
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={`https://picsum.photos/seed/${userDisplay.avatar}/200/200`}
                  alt={userDisplay.name}
                />
                <AvatarFallback>{userDisplay.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userDisplay.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userDisplay.location}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
