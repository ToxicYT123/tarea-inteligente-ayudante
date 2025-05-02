
import { AIProvider, AI_PROVIDERS } from './types';

// Class for managing API keys
export class AIKeyManager {
  private static readonly STORAGE_PREFIX = 'ai_key_';
  private static readonly HISTORY_PREFIX = 'ai_key_history_';
  private static readonly SELECTED_PROVIDER_KEY = 'selected_ai_provider';
  
  // Get API key for a specific provider
  static getApiKey(provider: AIProvider): string {
    return localStorage.getItem(`${this.STORAGE_PREFIX}${provider}`) || '';
  }
  
  // Set API key for a provider
  static setApiKey(provider: AIProvider, apiKey: string): void {
    localStorage.setItem(`${this.STORAGE_PREFIX}${provider}`, apiKey);
    this.addApiKeyToHistory(provider, apiKey);
  }
  
  // Check if an API key exists for the provider
  static hasApiKey(provider: AIProvider): boolean {
    return !!this.getApiKey(provider);
  }
  
  // Add API key to history
  static addApiKeyToHistory(provider: AIProvider, apiKey: string): void {
    if (!apiKey) return;
    
    try {
      const historyKey = `${this.HISTORY_PREFIX}${provider}`;
      const history = this.getApiKeyHistory(provider);
      
      // Avoid duplicates
      if (!history.includes(apiKey)) {
        history.unshift(apiKey); // Add to beginning
        
        // Limit to 5 keys in history
        const limitedHistory = history.slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
      }
    } catch (e) {
      console.error(`Error saving API key history for ${provider}:`, e);
    }
  }
  
  // Get API key history
  static getApiKeyHistory(provider: AIProvider): string[] {
    try {
      const historyKey = `${this.HISTORY_PREFIX}${provider}`;
      const history = localStorage.getItem(historyKey);
      return history ? JSON.parse(history) : [];
    } catch (e) {
      console.error(`Error getting API key history for ${provider}:`, e);
      return [];
    }
  }
  
  // Remove a key from history
  static removeApiKeyFromHistory(provider: AIProvider, apiKey: string): void {
    try {
      const historyKey = `${this.HISTORY_PREFIX}${provider}`;
      const history = this.getApiKeyHistory(provider);
      const filteredHistory = history.filter(key => key !== apiKey);
      localStorage.setItem(historyKey, JSON.stringify(filteredHistory));
    } catch (e) {
      console.error(`Error removing API key from history for ${provider}:`, e);
    }
  }
  
  // Get selected provider
  static getSelectedProvider(): AIProvider {
    return (localStorage.getItem(this.SELECTED_PROVIDER_KEY) as AIProvider) || 'openai';
  }
  
  // Set selected provider
  static setSelectedProvider(provider: AIProvider): void {
    localStorage.setItem(this.SELECTED_PROVIDER_KEY, provider);
  }
}
