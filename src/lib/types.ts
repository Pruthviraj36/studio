export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  skills: string[];
  interests: string[];
  githubUrl: string;
  websiteUrl: string; // Added websiteUrl
  githubStats: GithubStats;
  role: 'admin' | 'user';
  favorites: string[]; // List of developer IDs
  createdAt?: any;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  projectDescription: string;
  requiredSkills: string[];
  members: Pick<User, 'id' | 'name' | 'avatar'>[];
  pendingRequests?: Pick<User, 'id' | 'name' | 'avatar' | 'skills'>[];
  tasks?: TeamTask[];
  meetings?: TeamMeeting[];
  createdBy: string;
};

export type TeamTask = {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  assigneeId?: string;
  dueDate?: any;
};

export type TeamMeeting = {
  id: string;
  title: string;
  description: string;
  date: any;
  link?: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'team_invite' | 'message' | 'system' | 'JoinRequest' | 'TeamUpdate' | 'ChatMessage'; // Keeping existing types for safety
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: any;
  metadata?: any;
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

export type Hackathon = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: any;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  image: string;
  link: string;
  organizer: string;
  createdAt?: any;
};
