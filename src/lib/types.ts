export type User = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  skills: string[];
  interests: string[];
  githubUrl: string;
  githubStats: GithubStats;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  projectDescription: string;
  requiredSkills: string[];
  members: Pick<User, 'id' | 'name' | 'avatar'>[];
};

export type GithubStats = {
  topRepos: Repo[];
  languages: { name: string; value: number }[];
  stars: number;
  forks: number;
  recentActivity: string;
};

export type Repo = {
  name: string;
  url: string;
  stars: number;
  language: string;
};
