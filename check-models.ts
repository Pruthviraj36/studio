
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
// @ts-ignore
import fetch from 'node-fetch';

if (!global.fetch) {
    (global as any).fetch = fetch;
}

dotenv.config();

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
    console.error('GOOGLE_GENAI_API_KEY is not set in .env');
    process.exit(1);
}

// Direct fetch implementation because SDK listModels might be tricky in some versions
async function directListModels() {
    console.log(`Checking available models for API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log('\n--- AVAILABLE MODELS ---');
        if (data.models) {
            data.models.forEach((model: any) => {
                const supportedMethods = model.supportedGenerationMethods || [];
                if (supportedMethods.includes('generateContent')) {
                    console.log(`- ${model.name} (${model.displayName})`);
                }
            });
        } else {
            console.log('No models found in response.');
            console.log(JSON.stringify(data, null, 2));
        }
        console.log('------------------------\n');

    } catch (error: any) {
        console.error('Error fetching models:', error.message);
    }
}

directListModels();
