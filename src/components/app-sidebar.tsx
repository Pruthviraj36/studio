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
import { currentUser } from '@/lib/data';

const menuItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/ai-match', label: 'AI Match', icon: Sparkles },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="h-16 justify-center text-lg font-headline font-semibold">
        <Link href="/discover" className="flex items-center gap-2">
          <Code className="h-8 w-8 text-primary" />
          <span>HackConnect</span>
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-4">
        {menuItems.map(({ href, label, icon: Icon }) => (
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
                  src={`https://picsum.photos/seed/${currentUser.avatar}/200/200`}
                  alt={currentUser.name}
                  data-ai-hint="professional person"
                />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className='font-medium'>{currentUser.name}</span>
              <span className="text-xs text-muted-foreground">{currentUser.experience}</span>
            </div>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
