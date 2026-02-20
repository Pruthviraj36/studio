'use client';

import { useMemo } from 'react';
import { User } from '@/lib/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

type AdminAnalyticsProps = {
    users: User[];
};

export function AdminAnalytics({ users }: AdminAnalyticsProps) {
    // 1. Calculate Skill Distribution
    const skillData = useMemo(() => {
        const counts: Record<string, number> = {};
        users.forEach((user) => {
            user.skills.forEach((skill) => {
                counts[skill] = (counts[skill] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 skills
    }, [users]);

    // 2. Calculate Experience Distribution
    const experienceData = useMemo(() => {
        const counts: Record<string, number> = {
            Beginner: 0,
            Intermediate: 0,
            Advanced: 0,
            Expert: 0,
        };
        users.forEach((user) => {
            if (counts[user.experience] !== undefined) {
                counts[user.experience]++;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [users]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // 3. Registration Timeline (Last 7 days)
    const registrationTimeline = useMemo(() => {
        const dailyCounts: Record<string, number> = {};
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        last7Days.forEach(date => dailyCounts[date] = 0);

        users.forEach(user => {
            if (user.createdAt) {
                // Handle Firestore timestamp vs Date
                const dateObj = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                const dateStr = dateObj.toISOString().split('T')[0];
                if (dailyCounts[dateStr] !== undefined) {
                    dailyCounts[dateStr]++;
                }
            }
        });

        return last7Days.map(date => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            count: dailyCounts[date]
        }));
    }, [users]);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Skill Distribution</CardTitle>
                        <CardDescription>Top 10 skills across all users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={skillData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                        }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Experience Levels</CardTitle>
                        <CardDescription>Breakdown of developer seniority</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={experienceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {experienceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {experienceData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-lg">User Growth</CardTitle>
                    <CardDescription>Registration trends over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationTimeline}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                    }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
