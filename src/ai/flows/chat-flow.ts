'use server';
/**
 * @fileOverview An AI flow for handling user chats, responding in Markdown.
 * - generateChatResponse - A function that generates a response to a user's query.
 */

import { ai } from '@/ai/genkit';
import fs from 'fs';
import path from 'path';

// Read the documentation file.
const documentationPath = path.join(
  process.cwd(),
  'src',
  'ai',
  'docs',
  'app-documentation.md'
);
const appDocumentation = fs.readFileSync(documentationPath, 'utf-8');

export interface GenerateChatResponseInput {
  prompt: string;
  userName: string;
}

export async function generateChatResponse(
  input: GenerateChatResponseInput
): Promise<string> {
  const { prompt, userName } = input;

  const systemPrompt = `You are JoSha, a friendly and helpful AI assistant for a personal finance app called "Finance Track".
The user you are talking to is named ${userName}.

Your two main purposes are:
1.  **App Support:** Answer questions about how to use the "Finance Track" app. Use the documentation provided below to answer these questions.
2.  **Financial Advice:** Provide general financial advice and answer questions about personal finance concepts.

When it's helpful to guide the user to a page in the app, provide a Markdown link, like this: "You can see your accounts on the [Accounts Page](/dashboard/accounts)."

Always respond in clear, helpful Markdown.

DOCUMENTATION:
---
${appDocumentation}
---
`;

  try {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      prompt: prompt,
    });

    return llmResponse.text;
  } catch (e: any) {
    console.error('Error during AI generation in chat-flow:', e);
    const errorMessage = e.message || 'An unknown error occurred.';
    return `I'm sorry, an unexpected error occurred. Please try again later. \n\n**Error details:** \`${errorMessage}\``;
  }
}
