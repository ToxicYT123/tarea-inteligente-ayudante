
import { AIProvider } from './types';

// Function to validate an API key with the corresponding provider
export async function validateApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  try {
    if (!apiKey.trim()) return false;
    
    switch (provider) {
      case 'openai':
        return await validateOpenAIKey(apiKey);
      case 'edenai':
        return await validateEdenAIKey(apiKey);
      case 'aimlapi':
        return await validateAIMLAPIKey(apiKey);
      default:
        console.error('Unsupported AI provider:', provider);
        return false;
    }
  } catch (error) {
    console.error(`Error validating API key for ${provider}:`, error);
    return false;
  }
}

// Validate OpenAI key
async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Error validating OpenAI API key:", error);
    return false;
  }
}

// Validate Eden AI key
async function validateEdenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.edenai.run/v2/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Error validating Eden AI API key:", error);
    return false;
  }
}

// Validate AIMLAPI key
async function validateAIMLAPIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.aimlapi.com/models', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Error validating AIMLAPI API key:", error);
    return false;
  }
}
