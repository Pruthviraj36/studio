import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const modelId = `googleai/${process.env.GENKIT_MODEL || 'gemini-2.5-flash'}`;

export const ai = genkit({
  plugins: [googleAI()],
  model: modelId as any,
});
