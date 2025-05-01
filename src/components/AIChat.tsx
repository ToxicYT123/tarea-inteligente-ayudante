
import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { generateAIResponse, validateApiKey } from '@/utils/aiUtils';
import { MessageSquare, Loader2, Settings, Check, X, Shield, History, Key, Trash2 } from 'lucide-react';
import ChatContainer from './chat/ChatContainer';
import { toast } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InfoIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIChatProps {
  tasks: Task[];
  onAddTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

// Simple encryption and decryption functions
const encryptApiKey = (key: string): string => {
  // This is a simple obfuscation, not true encryption
  // In a production app, consider using the Web Crypto API
  return btoa(key.split('').reverse().join(''));
};

const decryptApiKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey).split('').reverse().join('');
  } catch (e) {
    return '';
  }
};

// Get encrypted API keys from localStorage
const getStoredApiKeys = (): string[] => {
  const storedKeys = localStorage.getItem('openai_api_keys_history');
  if (!storedKeys) return [];
  try {
    return JSON.parse(storedKeys) as string[];
  } catch (e) {
    return [];
  }
};

// Add new API key to history
const addApiKeyToHistory = (key: string) => {
  const encryptedKey = encryptApiKey(key);
  const storedKeys = getStoredApiKeys();
  
  // Only add if not already in history
  if (!storedKeys.includes(encryptedKey)) {
    const newKeys = [encryptedKey, ...storedKeys].slice(0, 5); // Keep only last 5 keys
    localStorage.setItem('openai_api_keys_history', JSON.stringify(newKeys));
  }
};

// Remove API key from history
const removeApiKeyFromHistory = (encryptedKey: string) => {
  const storedKeys = getStoredApiKeys();
  const newKeys = storedKeys.filter(key => key !== encryptedKey);
  localStorage.setItem('openai_api_keys_history', JSON.stringify(newKeys));
};

const AIChat: React.FC<AIChatProps> = ({ tasks, onAddTask, onDeleteTask }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      content: "¡Hola! Soy tu asistente para tareas. Puedo ayudarte a gestionar tus tareas, incluso crearlas o eliminarlas. Prueba diciendo 'crear tarea de matemáticas para mañana' o 'qué tareas tengo para hoy'.",
      sender: 'assistant',
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('openai_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(!localStorage.getItem('openai_api_key'));
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'none' | 'valid' | 'invalid' | 'checking'>('none');
  const [apiKeyHistory, setApiKeyHistory] = useState<string[]>(getStoredApiKeys());
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update history in state when localStorage changes
    setApiKeyHistory(getStoredApiKeys());
  }, [apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Por favor, ingresa una API Key');
      return;
    }
    
    setIsValidatingKey(true);
    setKeyValidationStatus('checking');
    
    try {
      const isValid = await validateApiKey(apiKey.trim());
      
      if (isValid) {
        setKeyValidationStatus('valid');
        toast.success('API Key válida');
      } else {
        setKeyValidationStatus('invalid');
        toast.error('API Key inválida o error de conexión');
      }
    } catch (error) {
      console.error('Error validando la API Key:', error);
      setKeyValidationStatus('invalid');
      toast.error('Error al validar la API Key');
    } finally {
      setIsValidatingKey(false);
    }
  };
  
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      addApiKeyToHistory(apiKey.trim());
      setShowApiKeyInput(false);
      toast.success('API Key guardada');
      
      // Set the env variable at runtime
      (window as any).VITE_OPENAI_API_KEY = apiKey.trim();
      
      // Reload the messages with a welcome message
      setMessages([
        {
          id: generateId(),
          content: "¡Gracias! Ahora puedo ayudarte con tus tareas usando IA avanzada. Prueba preguntándome algo o pidiéndome que cree una tarea.",
          sender: 'assistant',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSelectApiKey = (encryptedKey: string) => {
    const decrypted = decryptApiKey(encryptedKey);
    setApiKey(decrypted);
    setKeyValidationStatus('none');
  };

  const handleRemoveApiKey = (encryptedKey: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    removeApiKeyFromHistory(encryptedKey);
    setApiKeyHistory(getStoredApiKeys());
  };

  const handleNewMessage = async (input: string) => {
    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: generateId(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Generar respuesta de IA
      const response = await generateAIResponse(
        input.trim(), 
        tasks,
        (newTask) => {
          if (onAddTask) {
            onAddTask(newTask);
            toast.success("Tarea creada correctamente");
          }
        },
        (taskId) => {
          if (onDeleteTask) {
            onDeleteTask(taskId);
            toast.success("Tarea eliminada correctamente");
          }
        }
      );
      
      const aiMessage: ChatMessage = {
        id: generateId(),
        content: response,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
      
      const errorMessage: ChatMessage = {
        id: generateId(),
        content: "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col rounded-lg border shadow-md h-[500px] transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/90 border-gray-700' 
        : 'bg-white/90 backdrop-blur-sm border-gray-200'
    }`}>
      <div className={`p-4 border-b flex items-center justify-between ${
        theme === 'dark'
          ? 'border-gray-700 bg-gradient-to-r from-tareaassist-dark-primary to-tareaassist-dark-secondary text-white'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
      }`}>
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="font-medium">Asistente TareaAssist</h2>
        </div>
        
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configuración de la IA</DialogTitle>
              <DialogDescription>
                Configura tu clave de API de OpenAI para potenciar el asistente de tareas.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Ingresa tu API Key de OpenAI"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setKeyValidationStatus('none');
                    }}
                    className={`pr-10 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''} ${
                      keyValidationStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
                      keyValidationStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  {keyValidationStatus === 'valid' && (
                    <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {keyValidationStatus === 'invalid' && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleValidateApiKey} 
                    className="w-1/2"
                    disabled={!apiKey.trim() || isValidatingKey}
                  >
                    {isValidatingKey ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validando...
                      </>
                    ) : "Verificar API Key"}
                  </Button>
                  <Button 
                    onClick={handleSaveApiKey} 
                    className="w-1/2"
                    disabled={!apiKey.trim() || keyValidationStatus === 'invalid' || isValidatingKey}
                  >
                    Guardar y Usar
                  </Button>
                </div>
              </div>
              
              {apiKeyHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Claves API recientes
                  </h4>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {apiKeyHistory.map((encryptedKey, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectApiKey(encryptedKey)}
                      >
                        <div className="flex items-center gap-2">
                          <Key className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">API Key {index + 1}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => handleRemoveApiKey(encryptedKey, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Información importante</AlertTitle>
                <AlertDescription>
                  Tu clave de API se guarda localmente en tu navegador y nunca se comparte con terceros. La clave se utiliza para conectarse a OpenAI y potenciar el asistente de tareas.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {showApiKeyInput ? (
        <div className="flex-1 p-4 flex flex-col justify-center items-center">
          <div className={`max-w-md w-full p-5 rounded-xl border shadow-sm ${theme === 'dark' ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-white/80'}`}>
            <h3 className="text-lg font-medium mb-2">Configuración de IA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Para utilizar la inteligencia artificial avanzada, necesitas proporcionar una API Key de OpenAI.
            </p>
            
            <div className="space-y-4">
              <Alert variant={theme === 'dark' ? 'default' : 'default'} className={`${theme === 'dark' ? 'bg-gray-700/70 border-gray-600' : 'bg-blue-50 border-blue-200'} border-l-4 border-l-primary`}>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Tu API Key se guardará localmente en este navegador y no se compartirá con terceros.
                </AlertDescription>
              </Alert>
              
              {apiKeyHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Claves API usadas anteriormente
                  </h4>
                  <div className="space-y-1">
                    {apiKeyHistory.map((encryptedKey, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectApiKey(encryptedKey)}
                      >
                        <div className="flex items-center gap-2">
                          <Key className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">API Key {index + 1}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => handleRemoveApiKey(encryptedKey, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Ingresa tu API Key de OpenAI"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setKeyValidationStatus('none');
                    }}
                    className={`pr-10 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''} ${
                      keyValidationStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
                      keyValidationStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  {keyValidationStatus === 'valid' && (
                    <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {keyValidationStatus === 'invalid' && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleValidateApiKey} 
                    className="w-1/2"
                    disabled={!apiKey.trim() || isValidatingKey}
                  >
                    {isValidatingKey ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validando...
                      </>
                    ) : "Verificar API Key"}
                  </Button>
                  <Button 
                    onClick={handleSaveApiKey} 
                    className="w-1/2"
                    disabled={!apiKey.trim() || keyValidationStatus === 'invalid' || isValidatingKey}
                  >
                    Guardar y Continuar
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground mt-2">
                Si no tienes una API Key, puedes seguir usando el asistente básico sin conectar a OpenAI.{' '}
                <button 
                  onClick={() => setShowApiKeyInput(false)}
                  className="text-primary hover:underline"
                >
                  Continuar sin API Key
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ChatContainer 
          messages={messages}
          isTyping={isTyping}
          onNewMessage={handleNewMessage}
          messagesEndRef={messagesEndRef}
        />
      )}
    </div>
  );
};

export default AIChat;
