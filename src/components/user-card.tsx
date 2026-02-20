import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, MessageCircle, X } from 'lucide-react';

import { toggleFavorite } from '@/app/actions';
import { useAuth } from './auth-provider';

type UserCardProps = {
  user: User;
  isFavorite?: boolean;
  onUpdate?: () => void;
};

export function UserCard({ user, isFavorite, onUpdate }: UserCardProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border bg-white/20 p-1 shadow-lg dark:bg-black/20 backdrop-blur-md">
      <div
        className="relative cursor-pointer group"
        onClick={() => router.push(`/profile/${user.id}`)}
      >
        <img
          src={`https://picsum.photos/seed/${user.avatar}/400/300`}
          alt={user.name}
          className="h-48 w-full rounded-xl object-cover transition-transform group-hover:scale-105"
          data-ai-hint="person portrait"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-xl" />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/40 text-white backdrop-blur-md border-white/20">
            {user.experience || 'Beginner'}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <h3 className="text-xl font-bold text-white drop-shadow-lg font-headline">
            {user.name}
          </h3>
          <p className="text-sm text-white/90 drop-shadow-md">
            {user.location}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 pt-2 flex flex-col">
        <p className="text-sm text-muted-foreground mb-3 flex-grow">{user.bio}</p>
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold">Top Skills</h4>
          <div className="flex flex-wrap gap-1">
            {user.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className='bg-primary/10 text-primary border-primary/20'>
                {skill}
              </Badge>
            ))}
            {user.skills.length > 3 && (
              <Badge variant="secondary" className='bg-primary/10 text-primary border-primary/20'>+{user.skills.length - 3} more</Badge>
            )}
          </div>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2">
          <Button size="icon" variant="outline" className="h-12 w-full rounded-lg bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black">
            <X className="h-6 w-6 text-destructive/80" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-full rounded-lg bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black"
            onClick={() => router.push(`/chat?userId=${user.id}`)}
          >
            <MessageCircle className="h-5 w-5 text-primary/80" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-full rounded-lg bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black"
            disabled={loading}
            onClick={async (e) => {
              e.stopPropagation();
              if (!authUser) return;
              setLoading(true);
              try {
                await toggleFavorite(authUser.uid, user.id);
                onUpdate?.();
              } finally {
                setLoading(false);
              }
            }}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-red-500/80'}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
