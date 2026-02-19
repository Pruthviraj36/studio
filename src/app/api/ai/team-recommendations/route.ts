/**
 * API route for AI team recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  aiTeamRecommendations,
  type AITeamRecommendationsInput,
} from '@/ai/flows/ai-team-recommendations-flow';

export async function POST(request: NextRequest) {
  try {
    const {
      developerProfile,
      skills,
      interests,
      githubActivity,
      teams,
    } = await request.json();

    if (!developerProfile || !skills || !interests || !teams) {
      return NextResponse.json(
        {
          error:
            'developerProfile, skills, interests, and teams are required',
        },
        { status: 400 }
      );
    }

    const input: AITeamRecommendationsInput = {
      developerProfile,
      skills,
      interests,
      githubActivity: githubActivity || 'No GitHub activity provided.',
      availableTeams: teams,
    };

    const result = await aiTeamRecommendations(input);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Team Recommendations error:', error);
    return NextResponse.json(
      {
        error:
          error.message || 'Failed to generate team recommendations',
      },
      { status: 500 }
    );
  }
}
