
import { Task } from '@/types';
import { AI_PROVIDERS } from '../types';

// Generate response using AIMLAPI
export async function generateAIMLAPIResponse(
  apiKey: string,
  systemPrompt: string,
  enhancedInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): Promise<string> {
  const response = await fetch('https://api.aimlapi.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      model: AI_PROVIDERS.aimlapi.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: enhancedInput }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error in AIMLAPI API (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
