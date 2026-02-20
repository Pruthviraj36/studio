'use client';

import type { GithubStats as GithubStatsType } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { RefreshCw, GitFork, Github, Star } from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Button } from './ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type GithubStatsProps = {
  stats: GithubStatsType;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function GithubStats({ stats, onRefresh, isRefreshing }: GithubStatsProps) {
  return (
    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6" />
            <CardTitle className="font-headline text-lg">GitHub Snapshot</CardTitle>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
        </div>
        <CardDescription>{stats.recentActivity}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-background/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Repos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {stats.topRepos?.slice(0, 3).map((repo) => (
                  <li key={repo.name}>
                    <Link
                      href={repo.url}
                      className="text-sm font-medium hover:underline text-primary"
                    >
                      {repo.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-background/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stars}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
              <GitFork className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.forks}</div>
            </CardContent>
          </Card>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Language Distribution</h4>
          <div className="h-[200px] w-full">
            {stats.languages && stats.languages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.languages as any}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border-2 border-dashed rounded-lg bg-background/20">
                <p className="text-sm text-muted-foreground italic">No language data available</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
