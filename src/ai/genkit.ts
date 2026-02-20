import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const modelId = (process.env.GENKIT_MODEL || 'googleai/gemini-1.5-flash').replace('google-genai/', 'googleai/');

export const ai = genkit({
  plugins: [googleAI()],
  model: modelId as any,
});
