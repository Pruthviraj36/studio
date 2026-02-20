'use server';

import type { User, Team } from '@/lib/types';
import { getAllTeams, toggleFavoriteDeveloper as toggleFavInDb, updateUserGithubStats } from '@/lib/firebase-services';
import { fetchGitHubUser, fetchGitHubRepos, fetchGitHubActivity, parseLanguageStats, formatActivitySummary, getTopRepos, GithubRepo, GithubUserProfile } from '@/lib/github';
import { headers } from 'next/headers';

async function getBaseUrl() {
  const host = (await headers()).get('host') || 'localhost:3000' || 'localhost:9002';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('192.168');
  const protocol = isLocal ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function refreshGithubStats(userId: string, githubUrl: string) {
  try {
    const username = githubUrl.split('/').pop();
    if (!username) throw new Error('Invalid GitHub URL');

    const token = process.env.GITHUB_TOKEN;
    const [user, repos, events] = (await Promise.all([
      fetchGitHubUser(username, token),
      fetchGitHubRepos(username, token),
      fetchGitHubActivity(username, token),
    ])) as [GithubUserProfile, GithubRepo[], any[]];

    const stats = {
      stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      forks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      topRepos: getTopRepos(repos, 3),
      languages: parseLanguageStats(repos),
      recentActivity: formatActivitySummary(events, repos),
    };

    await updateUserGithubStats(userId, stats);
    return { success: true, stats };
  } catch (error: any) {
    console.error('Error refreshing GitHub stats:', error);
    return { error: error.message };
  }
}

export async function toggleFavorite(currentUserId: string, targetUserId: string) {
  try {
    await toggleFavInDb(currentUserId, targetUserId);
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return { error: error.message };
  }
}

export async function getGitHubUser(username: string): Promise<User | null> {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/github/${username}`,
      { next: { revalidate: 3600 } } as any
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub user: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('Error fetching GitHub user:', error);
    throw error;
  }
}

export async function getAIPortfolioAnalysis(user: User) {
  try {
    console.log(`[AI] Generating portfolio analysis for user: ${user.id}`);
    const githubProfileSummary = `
      User: ${user.name}.
      Bio: ${user.bio}.
      Top Repositories: ${user.githubStats?.topRepos
        ?.map((repo) => `${repo.name} (${repo.language}, ${repo.stars} stars)`)
        .join(', ') || 'No repositories found'}.
      Languages: ${user.githubStats?.languages
        ?.map((lang) => `${lang.name} (${lang.value}%)`)
        .join(', ') || 'No language data'}.
      Total Stars: ${user.githubStats?.stars || 0}.
      Recent Activity: ${user.githubStats?.recentActivity || 'No recent activity'}.
    `;

    console.log(`[AI] Calling portfolio analysis API...`);
    const baseUrl = await getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/ai/portfolio-analysis`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubProfileSummary }),
      }
    );

    if (!response.ok) {
      console.error(`[AI] API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to get portfolio analysis: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`[AI] Portfolio analysis completed successfully.`);
    return { result };
  } catch (e: any) {
    console.error(`[AI] Critical Error in getAIPortfolioAnalysis:`, e);
    return { error: e.message || 'Failed to generate AI portfolio analysis.' };
  }
}

export async function getAITeamRecommendations(user: User) {
  try {
    console.log(`[AI] Generating team recommendations for user: ${user.id}`);
    const teams = await getAllTeams();

    const developerProfile = `
        Name: ${user.name}
        Bio: ${user.bio}
        Experience Level: ${user.experience}
        Location: ${user.location}
    `;

    const input = {
      developerProfile,
      skills: user.skills,
      interests: user.interests,
      teams: teams.map((team: Team) => ({
        id: team.id,
        name: team.name,
        description: team.projectDescription,
        requiredSkills: team.requiredSkills,
        currentMembers: team.members.map((m: any) => m.name),
      })),
    };

    console.log(`[AI] Calling team recommendations API with ${teams.length} teams...`);
    const baseUrl = await getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/ai/team-recommendations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      console.error(`[AI] API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to get team recommendations: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`[AI] Team recommendations completed successfully.`);
    return { result };
  } catch (e: any) {
    console.error(`[AI] Critical Error in getAITeamRecommendations:`, e);
    return { error: e.message || 'Failed to generate AI team recommendations.' };
  }
}

export async function searchUsers(
  users: User[],
  query: string,
  skillFilter?: string
): Promise<User[]> {
  const lowerQuery = query.toLowerCase();
  return users.filter((user) => {
    const nameMatch = user.name.toLowerCase().includes(lowerQuery);
    const bioMatch = user.bio.toLowerCase().includes(lowerQuery);
    const locationMatch = user.location.toLowerCase().includes(lowerQuery);

    const matchesQuery = nameMatch || bioMatch || locationMatch || !query;

    if (skillFilter && skillFilter !== 'all') {
      return matchesQuery && user.skills.some(
        (skill) => skill.toLowerCase() === skillFilter.toLowerCase()
      );
    }

    return matchesQuery;
  });
}

export async function filterUsersBySkill(users: User[], skill: string): Promise<User[]> {
  if (!skill || skill === 'all') return users;
  return users.filter((user) =>
    user.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
  );
}

export async function filterUsersByExperience(
  users: User[],
  experience: string
): Promise<User[]> {
  if (!experience || experience === 'all') return users;
  return users.filter((user) => user.experience === experience);
}
