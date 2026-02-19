/**
 * API route to fetch GitHub user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGitHubUser,
  fetchGitHubRepos,
  getTopRepos,
  parseLanguageStats,
  formatActivitySummary,
  fetchGitHubActivity,
} from '@/lib/github';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    // Fetch user data, repos, and activity
    const [user, repos, events] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
      fetchGitHubActivity(username),
    ]);

    // Process data
    const topRepos = getTopRepos(repos, 5);
    const languages = parseLanguageStats(repos);
    const recentActivity = formatActivitySummary(events as any[], repos);

    const githubStats = {
      topRepos,
      languages,
      stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      forks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      recentActivity,
    };

    return NextResponse.json({
      id: user.login,
      name: user.name || user.login,
      avatar: user.avatar_url,
      bio: user.bio || '',
      location: user.location || '',
      experience: 'Intermediate', // This would come from user profile in real app
      skills: languages.map((l) => l.name), // Derived from languages
      interests: [], // Would come from user profile
      githubUrl: `https://github.com/${user.login}`,
      githubStats,
    });
  } catch (error: any) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch GitHub user profile',
      },
      { status: 500 }
    );
  }
}
