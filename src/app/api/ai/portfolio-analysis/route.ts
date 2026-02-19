/**
 * API route for AI portfolio analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  aiPortfolioAnalysis,
  type AIPortfolioAnalysisInput,
} from '@/ai/flows/ai-portfolio-analysis-flow';

export async function POST(request: NextRequest) {
  try {
    const { githubProfileSummary } = await request.json();

    if (!githubProfileSummary) {
      return NextResponse.json(
        { error: 'GitHub profile summary is required' },
        { status: 400 }
      );
    }

    const input: AIPortfolioAnalysisInput = {
      githubProfileSummary,
    };

    const result = await aiPortfolioAnalysis(input);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Portfolio Analysis error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate portfolio analysis',
      },
      { status: 500 }
    );
  }
}
