import { google } from '@ai-sdk/google';
import { streamText, generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = await generateText({
            model: google('gemini-2.5-flash'),
            messages,
        });

        return new Response(result.text);
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
