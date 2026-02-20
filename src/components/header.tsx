'use client';

import { LogOut, Settings, User, MessageCircle, UserPlus, Info } from 'lucide-react';
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
import { signOutUser } from '@/lib/firebase-services';
import { useRouter } from 'next/navigation';
import { NotificationsDropdown } from './notifications-dropdown';

const pathToTitle: { [key: string]: string } = {
  '/discover': 'Discover Developers',
  '/teams': 'Manage Your Teams',
  '/ai-match': 'AI Team Recommendations',
  '/hackathons': 'Find Hackathons',
  '/chat': 'Conversations',
  '/profile': 'My Profile',
  '/admin': 'Admin Dashboard',
};

export function Header() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const { user: authUser, profile } = useAuth();
  const router = useRouter();

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
        {authUser && <NotificationsDropdown userId={authUser.uid} />}

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
