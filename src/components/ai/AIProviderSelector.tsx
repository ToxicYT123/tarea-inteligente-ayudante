
import React, { useState } from 'react';
import { Check, Loader2, Shield } from 'lucide-react';
import { useTheme } from "@/hooks/use-theme";
import { AIProvider, AI_PROVIDERS, AIKeyManager, validateApiKey } from '@/services/aiService';
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIProviderSelectorProps {
  onClose?: () => void;
}

const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIKeyManager.getSelectedProvider());
  const [apiKey, setApiKey] = useState<string>(AIKeyManager.getApiKey(selectedProvider) || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid' | 'checking'>('none');
  
  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setApiKey(AIKeyManager.getApiKey(provider) || '');
    setValidationStatus('none');
  };
  
  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Por favor, ingresa una API Key');
      return;
    }
    
    setIsValidating(true);
    setValidationStatus('checking');
    
    try {
      const isValid = await validateApiKey(selectedProvider, apiKey.trim());
      
      if (isValid) {
        setValidationStatus('valid');
        toast.success('API Key válida');
      } else {
        setValidationStatus('invalid');
        toast.error('API Key inválida o error de conexión');
      }
    } catch (error) {
      console.error('Error validando la API Key:', error);
      setValidationStatus('invalid');
      toast.error('Error al validar la API Key');
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleSaveApiKey = () => {
    if (apiKey.trim() && validationStatus !== 'invalid') {
      AIKeyManager.setApiKey(selectedProvider, apiKey.trim());
      AIKeyManager.setSelectedProvider(selectedProvider);
      
      toast.success(`${AI_PROVIDERS[selectedProvider].name} configurado correctamente`);
      
      if (onClose) {
        onClose();
      }
    } else if (validationStatus === 'invalid') {
      toast.error('No se puede guardar una API Key inválida');
    }
  };
  
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <Select value={selectedProvider} onValueChange={(value: AIProvider) => handleProviderChange(value)}>
          <SelectTrigger className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
            <SelectValue placeholder="Selecciona proveedor de IA" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AI_PROVIDERS).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.name} {AIKeyManager.hasApiKey(key as AIProvider) && <Check className="ml-2 h-4 w-4 inline" />}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <p className="text-sm text-muted-foreground">
          {AI_PROVIDERS[selectedProvider].description}
        </p>
      </div>
      
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Configurar {AI_PROVIDERS[selectedProvider].name}
          </CardTitle>
          <CardDescription>
            Ingresa tu API key para activar las funcionalidades de IA avanzadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="password"
                placeholder={`API Key de ${AI_PROVIDERS[selectedProvider].name}...`}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationStatus('none');
                }}
                className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''} ${
                  validationStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
                  validationStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {validationStatus === 'valid' && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex justify-between gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleValidateApiKey}
              disabled={!apiKey.trim() || isValidating}
              className={`w-1/2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : ''}`}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : "Verificar API Key"}
            </Button>
            
            <Button
              onClick={handleSaveApiKey}
              className="w-1/2"
              disabled={!apiKey.trim() || validationStatus === 'invalid' || isValidating}
            >
              Guardar y Usar
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIProviderSelector;
