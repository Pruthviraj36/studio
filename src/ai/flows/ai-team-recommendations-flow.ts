'use server';
/**
 * @fileOverview An AI agent that provides team recommendations to developers
 * based on their profile, skills, and interests, matching them with available hackathon teams.
 *
 * - aiTeamRecommendations - A function that handles the team recommendation process.
 * - AITeamRecommendationsInput - The input type for the aiTeamRecommendations function.
 * - AITeamRecommendationsOutput - The return type for the aiTeamRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AITeamRecommendationsInputSchema = z.object({
  developerProfile: z.string().describe('A detailed description of the developer, their experience, and career goals.'),
  skills: z.array(z.string()).describe('A list of technical skills the developer possesses, e.g., ["React", "Node.js", "Python"]').default([]),
  interests: z.array(z.string()).describe('A list of topics or domains the developer is interested in, e.g., ["AI/ML", "Web3", "Fintech"]').default([]),
  githubActivity: z.string().describe('A summary of the developer\'s GitHub activity, including top repositories, languages used, and recent contributions.').default('No GitHub activity provided.'),
  availableTeams: z.array(
    z.object({
      id: z.string().describe('Unique identifier for the team.'),
      name: z.string().describe('The name of the hackathon team.'),
      description: z.string().describe('A description of the team\'s project idea or goal.'),
      requiredSkills: z.array(z.string()).describe('Skills the team is specifically looking for.'),
      currentMembers: z.array(z.string()).describe('Names or roles of current team members.').default([]),
    })
  ).describe('A list of currently available hackathon teams with their details.'),
});
export type AITeamRecommendationsInput = z.infer<typeof AITeamRecommendationsInputSchema>;

const AITeamRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      teamId: z.string().describe('The unique identifier of the recommended team.'),
      teamName: z.string().describe('The name of the recommended team.'),
      reasoning: z.string().describe('A clear, concise explanation of why this team is a good match for the developer, highlighting aligned skills, interests, or project goals.'),
      matchScore: z.number().int().min(0).max(100).describe('A percentage score (0-100) indicating the compatibility between the developer and the team.'),
    })
  ).describe('A list of recommended teams with detailed matching information.'),
});
export type AITeamRecommendationsOutput = z.infer<typeof AITeamRecommendationsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiTeamRecommendationsPrompt',
  input: { schema: AITeamRecommendationsInputSchema },
  output: { schema: AITeamRecommendationsOutputSchema },
  prompt: `You are an expert hackathon team matching assistant. Your goal is to help a developer find the most compatible teams based on their profile, skills, interests, and GitHub activity.

Here is the developer's information:
Developer Profile: {{{developerProfile}}}
Skills: {{#each skills}}- {{{this}}}\n{{/each}}
Interests: {{#each interests}}- {{{this}}}\n{{/each}}
GitHub Activity Summary: {{{githubActivity}}}

Here are the available teams:
{{#each availableTeams}}
Team ID: {{{id}}}
Team Name: {{{name}}}
Project Description: {{{description}}}
Required Skills: {{#each requiredSkills}}- {{{this}}}\n{{/each}}
Current Members: {{#each currentMembers}}- {{{this}}}\n{{/each}}
---
{{/each}}

Analyze the developer's information and compare it with each available team. For each team, determine the compatibility based on:
1.  **Skill Match**: How well the developer's skills align with the team's required skills.
2.  **Interest Alignment**: How well the developer's interests align with the team's project description or goals.
3.  **Profile Fit**: General fit based on the developer's profile and GitHub activity.

Provide a list of recommended teams, including the team's ID, name, a detailed reasoning for the match, and a match score (0-100). Focus on giving clear and helpful explanations.

Example of expected output structure:
\`\`\`json
{
  "recommendations": [
    {
      "teamId": "team123",
      "teamName": "Data Innovators",
      "reasoning": "Your strong Python skills and interest in AI/ML are a perfect fit for this team's data science project.",
      "matchScore": 95
    },
    {
      "teamId": "team456",
      "teamName": "Web Wizards",
      "reasoning": "Your React and Node.js expertise aligns well with their full-stack web application development.",
      "matchScore": 80
    }
  ]
}
\`\`\`
`,
});

const aiTeamRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiTeamRecommendationsFlow',
    inputSchema: AITeamRecommendationsInputSchema,
    outputSchema: AITeamRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function aiTeamRecommendations(input: AITeamRecommendationsInput): Promise<AITeamRecommendationsOutput> {
  return aiTeamRecommendationsFlow(input);
}
