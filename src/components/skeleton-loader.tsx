'use client';

import { cn } from '@/lib/utils';

export function SkeletonMessage({ isMe }: { isMe?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-end gap-2 mt-4',
        isMe ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className="w-8 flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
      <div
        className={cn(
          'max-w-[85%] px-3 py-1.5 rounded-2xl',
          isMe
            ? 'bg-slate-200 dark:bg-slate-700 rounded-tr-none'
            : 'bg-slate-100 dark:bg-slate-800 rounded-tl-none'
        )}
      >
        <div className="space-y-2">
          <div className="h-3 w-48 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
          <div className="h-3 w-32 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonUser() {
  return (
    <div className="p-4 flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
        <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonChatHeader() {
  return (
    <div className="p-4 border-b flex items-center gap-4 bg-white/50 dark:bg-black/50">
      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonUser key={i} />
      ))}
    </div>
  );
}
