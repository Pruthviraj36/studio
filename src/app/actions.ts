'use server';

import {
  aiPortfolioAnalysis,
  type AIPortfolioAnalysisInput,
} from '@/ai/flows/ai-portfolio-analysis-flow';
import {
  aiTeamRecommendations,
  type AITeamRecommendationsInput,
} from '@/ai/flows/ai-team-recommendations-flow';
import { currentUser, teams } from '@/lib/data';

export async function getAIPortfolioAnalysis() {
  try {
    const githubProfileSummary = `
      User: ${currentUser.name}.
      Bio: ${currentUser.bio}.
      Top Repositories: ${currentUser.githubStats.topRepos
        .map((repo) => `${repo.name} (${repo.language}, ${repo.stars} stars)`)
        .join(', ')}.
      Languages: ${currentUser.githubStats.languages
        .map((lang) => `${lang.name} (${lang.value}%)`)
        .join(', ')}.
      Total Stars: ${currentUser.githubStats.stars}.
      Recent Activity: ${currentUser.githubStats.recentActivity}.
    `;

    const input: AIPortfolioAnalysisInput = {
      githubProfileSummary,
    };
    const result = await aiPortfolioAnalysis(input);
    return { result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to generate AI portfolio analysis.' };
  }
}

export async function getAITeamRecommendations() {
  try {
    const developerProfile = `
        Name: ${currentUser.name}
        Bio: ${currentUser.bio}
        Experience Level: ${currentUser.experience}
        Location: ${currentUser.location}
    `;

    const input: AITeamRecommendationsInput = {
      developerProfile,
      skills: currentUser.skills,
      interests: currentUser.interests,
      githubActivity: currentUser.githubStats.recentActivity,
      availableTeams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.projectDescription,
        requiredSkills: team.requiredSkills,
        currentMembers: team.members.map((m) => m.name),
      })),
    };

    const result = await aiTeamRecommendations(input);
    return { result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to generate AI team recommendations.' };
  }
}
