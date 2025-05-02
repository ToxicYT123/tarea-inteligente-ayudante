
import { Task } from '@/types';
import { AI_PROVIDERS } from '../types';

// Generate response using Eden AI
export async function generateEdenAIResponse(
  apiKey: string,
  systemPrompt: string,
  enhancedInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): Promise<string> {
  const response = await fetch('https://api.edenai.run/v2/text/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      providers: "openai",
      text: enhancedInput,
      settings: {
        openai: {
          model: AI_PROVIDERS.edenai.defaultModel.split('/')[1],
          temperature: 0.7,
          max_tokens: 500,
        }
      },
      conversation: [
        { role: "system", message: systemPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error in Eden AI API (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.openai.generated_text || data.openai.message || "Lo siento, no pude procesar tu consulta.";
}
