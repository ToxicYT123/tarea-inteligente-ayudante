
import { Task } from '@/types';
import { AIKeyManager, generateAIResponse, validateApiKey } from '@/services/ai';

// Re-exporting the needed functions from our new aiService
export { validateApiKey, generateAIResponse };

// For backward compatibility
export function setOpenAIApiKey(apiKey: string): void {
  AIKeyManager.setApiKey('openai', apiKey);
}

// For backward compatibility
export function getOpenAIApiKey(): string {
  return AIKeyManager.getApiKey('openai');
}

// For backward compatibility
export function saveApiKeyToHistory(apiKey: string): void {
  AIKeyManager.addApiKeyToHistory('openai', apiKey);
}

// For backward compatibility
export function getApiKeyHistory(): string[] {
  return AIKeyManager.getApiKeyHistory('openai');
}
