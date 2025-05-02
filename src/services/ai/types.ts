
// AI provider types and interfaces
export type AIProvider = 'openai' | 'edenai' | 'aimlapi';

// Configuration for each provider
export interface AIProviderConfig {
  name: string;
  apiUrl: string;
  requiresApiKey: boolean;
  defaultModel: string;
  description: string;
  available: boolean;
}

// Configurations of the providers
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    description: 'Proveedor de IA original con modelos GPT',
    available: true
  },
  edenai: {
    name: 'Eden AI',
    apiUrl: 'https://api.edenai.run/v2/text/chat',
    requiresApiKey: true,
    defaultModel: 'openai/gpt-4o-mini',
    description: 'Plataforma unificada con acceso a múltiples APIs de IA',
    available: true
  },
  aimlapi: {
    name: 'AIMLAPI',
    apiUrl: 'https://api.aimlapi.com/chat/completions',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    description: 'Acceso a más de 200 modelos de IA con una sola API',
    available: true
  }
};
