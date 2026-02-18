'use server';
/**
 * @fileOverview An AI agent that analyzes a developer's GitHub profile to provide career insights.
 *
 * - aiPortfolioAnalysis - A function that handles the AI portfolio analysis process.
 * - AIPortfolioAnalysisInput - The input type for the aiPortfolioAnalysis function.
 * - AIPortfolioAnalysisOutput - The return type for the aiPortfolioAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPortfolioAnalysisInputSchema = z.object({
  githubProfileSummary: z
    .string()
    .describe(
      'A comprehensive summary of the developer\'s GitHub profile, including top repositories, languages used, stars, forks, and recent activity. For example: "GitHub user: octocat. Top repos: hello-world (Python, 100 stars, recent commit: \'feat: add new feature\'), MyCoolApp (JavaScript, 50 stars, recent commit: \'fix: bug fix\'). Languages: Python, JavaScript, Shell. Total stars: 150. Recent activity: Actively contributing to open-source projects, 5 commits in the last week." '
    ),
});
export type AIPortfolioAnalysisInput = z.infer<
  typeof AIPortfolioAnalysisInputSchema
>;

const AIPortfolioAnalysisOutputSchema = z.object({
  strengths: z
    .array(z.string())
    .describe('Key strengths identified from the GitHub profile.'),
  recommendedRoles: z
    .array(z.string())
    .describe('Potential job roles suitable for the developer.'),
  skillGaps: z
    .array(z.string())
    .describe('Identified skill gaps or areas for improvement.'),
  projectSuggestions: z
    .array(z.string())
    .describe('Suggestions for projects to undertake to enhance skills.'),
});
export type AIPortfolioAnalysisOutput = z.infer<
  typeof AIPortfolioAnalysisOutputSchema
>;

const aiPortfolioAnalysisPrompt = ai.definePrompt({
  name: 'aiPortfolioAnalysisPrompt',
  input: {schema: AIPortfolioAnalysisInputSchema},
  output: {schema: AIPortfolioAnalysisOutputSchema},
  prompt: `You are an expert career advisor specializing in software development.
Your task is to analyze a developer's GitHub profile summary and provide insights into their strengths, suitable roles, identified skill gaps, and project suggestions for improvement.

Analyze the following GitHub profile summary:
{{{githubProfileSummary}}}

Based on this summary, provide:
1.  **Key Strengths**: List the main technical and soft skills demonstrated.
2.  **Recommended Roles**: Suggest job roles that align with their profile.
3.  **Skill Gaps**: Identify areas where the developer could improve or learn new technologies.
4.  **Project Suggestions**: Propose specific types of projects they could work on to address skill gaps and showcase new abilities.

Format your response as a JSON object strictly adhering to the following schema:
`,
});

const aiPortfolioAnalysisFlow = ai.defineFlow(
  {
    name: 'aiPortfolioAnalysisFlow',
    inputSchema: AIPortfolioAnalysisInputSchema,
    outputSchema: AIPortfolioAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await aiPortfolioAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to generate portfolio analysis.');
    }
    return output;
  }
);

export async function aiPortfolioAnalysis(
  input: AIPortfolioAnalysisInput
): Promise<AIPortfolioAnalysisOutput> {
  return aiPortfolioAnalysisFlow(input);
}
