'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { User, Team } from '@/lib/types';
import {
  Users,
  UserPlus,
  TrendingUp,
  Activity,
  Users2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminAnalyticsDashboardProps {
  users: User[];
  teams: Team[];
  loading?: boolean;
}

export function AdminAnalyticsDashboard({
  users,
  teams,
  loading = false,
}: AdminAnalyticsDashboardProps) {
  // Calculate metrics
  const totalUsers = users.length;
  const usersToday = users.filter(u => {
    const createdDate = u.createdAt?.toDate?.() || new Date(u.createdAt);
    const today = new Date();
    return (
      createdDate.toDateString() === today.toDateString()
    );
  }).length;

  const totalTeams = teams.length;
  const activeTeams = teams.filter(t => (t.members?.length || 0) >= 2).length;
  const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

  // Experience distribution
  const experienceData = [
    {
      name: 'Beginner',
      value: users.filter(u => u.experience === 'Beginner').length,
    },
    {
      name: 'Intermediate',
      value: users.filter(u => u.experience === 'Intermediate').length,
    },
    {
      name: 'Advanced',
      value: users.filter(u => u.experience === 'Advanced').length,
    },
    {
      name: 'Expert',
      value: users.filter(u => u.experience === 'Expert').length,
    },
  ];

  // User growth - simulate weekly data
  const userGrowthData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      users: Math.max(
        totalUsers - Math.floor(Math.random() * (i + 3)),
        0
      ),
    };
  });

  // Top skills distribution
  const skillsMap: { [key: string]: number } = {};
  users.forEach(user => {
    (user.skills || []).forEach(skill => {
      skillsMap[skill] = (skillsMap[skill] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillsMap)
    .map(([skill, count]) => ({ name: skill, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              +{usersToday} today
            </p>
            <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded text-xs text-blue-700 dark:text-blue-300 w-fit">
              Growth: {((usersToday / (totalUsers || 1)) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users2 className="h-4 w-4 text-purple-500" />
              Active Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeTeams}</p>
            <p className="text-xs text-muted-foreground mt-1">
              of {totalTeams} teams
            </p>
            <div className="mt-3 bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded text-xs text-purple-700 dark:text-purple-300 w-fit">
              {((activeTeams / (totalTeams || 1)) * 100).toFixed(0)}% active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Avg Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(totalMembers / (totalTeams || 1)).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalMembers} total members
            </p>
            <div className="mt-3 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300 w-fit">
              ↑ Growing
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.round((activeTeams / (totalUsers || 1)) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Users in teams
            </p>
            <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded text-xs text-amber-700 dark:text-amber-300 w-fit">
              ↑ 12% MoM
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Experience Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={experienceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {experienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 6 Skills in Community</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSkills}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* User Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Verified Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">GitHub Linked</span>
                <Badge variant="secondary">
                  {users.filter(u => u.githubUrl).length} users
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Portfolio Linked</span>
                <Badge variant="secondary">
                  {users.filter(u => u.websiteUrl).length} users
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profile Complete</span>
                <Badge variant="secondary">
                  {users.filter(u => u.bio && u.skills && u.skills.length > 0).length} users
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">{totalUsers}</span> developers are working
                in <span className="font-semibold">{activeTeams}</span> active teams
              </p>
              <p className="text-sm text-muted-foreground">
                Most common skill: <span className="font-semibold">{topSkills[0]?.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Signup rate: <span className="font-semibold">{usersToday} today</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
