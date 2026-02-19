'use server';

import type { User } from '@/lib/types';
import { currentUser, teams } from '@/lib/data';

export async function getGitHubUser(username: string): Promise<User | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002'}/api/github/${username}`,
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
    const githubProfileSummary = `
      User: ${user.name}.
      Bio: ${user.bio}.
      Top Repositories: ${user.githubStats.topRepos
        .map((repo) => `${repo.name} (${repo.language}, ${repo.stars} stars)`)
        .join(', ')}.
      Languages: ${user.githubStats.languages
        .map((lang) => `${lang.name} (${lang.value}%)`)
        .join(', ')}.
      Total Stars: ${user.githubStats.stars}.
      Recent Activity: ${user.githubStats.recentActivity}.
    `;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002'}/api/ai/portfolio-analysis`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubProfileSummary }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get portfolio analysis: ${response.statusText}`);
    }

    const result = await response.json();
    return { result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to generate AI portfolio analysis.' };
  }
}

export async function getAITeamRecommendations(user: User) {
  try {
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
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.projectDescription,
        requiredSkills: team.requiredSkills,
        currentMembers: team.members.map((m) => m.name),
      })),
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002'}/api/ai/team-recommendations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get team recommendations: ${response.statusText}`);
    }

    const result = await response.json();
    return { result };
  } catch (e: any) {
    console.error(e);
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
