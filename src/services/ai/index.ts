
import { Task } from '@/types';
import { enhanceAIInput, generateEnhancedSystemPrompt } from '@/utils/aiContext';
import { type AIProvider, AI_PROVIDERS } from './types';
import { AIKeyManager } from './keyManager';
import { validateApiKey } from './validation';
import { generateOpenAIResponse } from './providers/openai';
import { generateEdenAIResponse } from './providers/edenai';
import { generateAIMLAPIResponse } from './providers/aimlapi';
import { generateFallbackResponse } from './fallback';
import { processAICommandsFromMessage } from './commandProcessor';

// Generate response using specified provider
export async function generateAIResponse(
  userInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void,
  provider?: AIProvider
): Promise<string> {
  // Get current provider or use specified one
  const currentProvider = provider || AIKeyManager.getSelectedProvider();
  const apiKey = AIKeyManager.getApiKey(currentProvider);
  
  if (!apiKey) {
    console.error(`API key not found for ${currentProvider}. Using fallback response.`);
    return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
  }

  try {
    // Get enhanced system prompt
    const systemPrompt = generateEnhancedSystemPrompt();
    
    // Get user input enhanced with context
    const enhancedInput = enhanceAIInput(
      userInput,
      tasks,
      document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
    );

    // Show user we're processing their query
    console.log(`Sending query to ${AI_PROVIDERS[currentProvider].name}...`);

    // Use provider-specific function
    let aiMessage: string;
    switch (currentProvider) {
      case 'openai':
        aiMessage = await generateOpenAIResponse(apiKey, systemPrompt, enhancedInput, tasks, onAddTask, onDeleteTask);
        break;
      case 'edenai':
        aiMessage = await generateEdenAIResponse(apiKey, systemPrompt, enhancedInput, tasks, onAddTask, onDeleteTask);
        break;
      case 'aimlapi':
        aiMessage = await generateAIMLAPIResponse(apiKey, systemPrompt, enhancedInput, tasks, onAddTask, onDeleteTask);
        break;
      default:
        return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
    }
    
    // Process response to detect commands
    processAICommandsFromMessage(aiMessage, enhancedInput, tasks, onAddTask, onDeleteTask);
    
    return aiMessage;
  } catch (error) {
    console.error(`Error generating AI response with ${currentProvider}:`, error);
    return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
  }
}

// Export everything needed
export { AIKeyManager, validateApiKey };
export { AI_PROVIDERS };
export type { AIProvider };

export default {
  generateAIResponse,
  validateApiKey,
  AIKeyManager,
  AI_PROVIDERS
};
