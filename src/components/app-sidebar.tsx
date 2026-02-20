'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  MessageSquare,
  Sparkles,
  User,
  Users,
  Code,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from './auth-provider';

const menuItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/ai-match', label: 'AI Match', icon: Sparkles },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const userDisplay = {
    name: profile?.name || 'Builder',
    avatar: profile?.avatar || 'default',
    experience: profile?.experience || 'Developer',
  };

  const currentMenuItems = [...menuItems];
  if (profile?.role === 'admin') {
    currentMenuItems.push({ href: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-16 justify-center text-lg font-headline font-semibold">
        <Link href="/discover" className="flex items-center gap-2">
          <Code className="h-8 w-8 text-primary" />
          <span>HackConnect</span>
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-4">
        {currentMenuItems.map(({ href, label, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(href)}
              tooltip={{ children: label }}
              className="justify-start"
            >
              <Link href={href}>
                <Icon />
                <span>{label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter className="p-4">
        <Button asChild variant="outline" className="w-full justify-start gap-2 p-2 h-12">
          <Link href="/profile">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://picsum.photos/seed/${userDisplay.avatar}/200/200`}
                alt={userDisplay.name}
                data-ai-hint="professional person"
              />
              <AvatarFallback>{userDisplay.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className='font-medium'>{userDisplay.name}</span>
              <span className="text-xs text-muted-foreground">{userDisplay.experience}</span>
            </div>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
