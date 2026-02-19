/**
 * GitHub API utilities for fetching user profiles and repository data
 */

export type GithubUserProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
};

export type GithubRepo = {
  name: string;
  url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
};

export type GithubLanguageStats = {
  [language: string]: number;
};

const GITHUB_API_BASE = 'https://api.github.com';

async function fetchGitHub<T>(
  endpoint: string,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers,
  } as RequestInit);

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch GitHub user profile by username
 */
export async function fetchGitHubUser(
  username: string,
  token?: string
): Promise<GithubUserProfile> {
  return fetchGitHub<GithubUserProfile>(`/users/${username}`, token);
}

/**
 * Fetch user's repositories
 */
export async function fetchGitHubRepos(
  username: string,
  token?: string,
  page = 1,
  perPage = 30
): Promise<GithubRepo[]> {
  return fetchGitHub<GithubRepo[]>(
    `/users/${username}/repos?sort=stars&direction=desc&page=${page}&per_page=${perPage}`,
    token
  );
}

/**
 * Fetch language statistics for a repository
 */
export async function fetchGitHubLanguages(
  username: string,
  repo: string,
  token?: string
): Promise<GithubLanguageStats> {
  return fetchGitHub<GithubLanguageStats>(
    `/repos/${username}/${repo}/languages`,
    token
  );
}

/**
 * Fetch user's recent events/activity
 */
export async function fetchGitHubActivity(
  username: string,
  token?: string,
  perPage = 30
) {
  return fetchGitHub(
    `/users/${username}/events/public?per_page=${perPage}`,
    token
  );
}

/**
 * Parse language statistics from repositories
 */
export function parseLanguageStats(repos: GithubRepo[]): {
  name: string;
  value: number;
}[] {
  const languageMap: { [key: string]: number } = {};

  repos.forEach((repo) => {
    if (repo.language) {
      languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
    }
  });

  return Object.entries(languageMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 languages
}

/**
 * Format activity summary
 */
export function formatActivitySummary(
  events: any[],
  repos: GithubRepo[]
): string {
  const recentCommits = events.filter(
    (e) => e.type === 'PushEvent'
  ).length;
  const recentPRs = events.filter(
    (e) => e.type === 'PullRequestEvent'
  ).length;
  const recentIssues = events.filter(
    (e) => e.type === 'IssuesEvent'
  ).length;

  const repoCount = repos.length;
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  return `Active developer with ${repoCount} repositories and ${totalStars} total stars. Recent activity: ${recentCommits} commits, ${recentPRs} pull requests, and ${recentIssues} issues in the last 30 days.`;
}

/**
 * Get top repositories by stars
 */
export function getTopRepos(repos: GithubRepo[], limit = 5) {
  return repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit)
    .map((repo) => ({
      name: repo.name,
      url: repo.url,
      stars: repo.stargazers_count,
      language: repo.language || 'Unknown',
    }));
}
