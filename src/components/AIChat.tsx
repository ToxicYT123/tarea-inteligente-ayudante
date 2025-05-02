
import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { MessageSquare, Loader2, Settings, History, Key, Trash2 } from 'lucide-react';
import ChatContainer from './chat/ChatContainer';
import { toast } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AI_PROVIDERS, AIKeyManager, AIProvider, generateAIResponse } from '@/services/aiService';
import AIProviderSelector from './ai/AIProviderSelector';

interface AIChatProps {
  tasks: Task[];
  onAddTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

// Simple encryption and decryption functions for local storage
const encryptApiKey = (key: string): string => {
  // This is a simple obfuscation, not true encryption
  return btoa(key.split('').reverse().join(''));
};

const decryptApiKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey).split('').reverse().join('');
  } catch (e) {
    return '';
  }
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
  const [showSettings, setShowSettings] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState<boolean>(!AIKeyManager.hasApiKey(AIKeyManager.getSelectedProvider()));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIKeyManager.getSelectedProvider());

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Verificar si hay una clave API para el proveedor seleccionado
    const hasKey = AIKeyManager.hasApiKey(selectedProvider);
    if (!hasKey) {
      setShowApiConfig(true);
    }
  }, [selectedProvider]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRemoveApiKey = (provider: AIProvider, e: React.MouseEvent) => {
    e.stopPropagation();
    AIKeyManager.setApiKey(provider, '');
    toast.success(`API Key de ${AI_PROVIDERS[provider].name} eliminada`);
    
    // Si es el proveedor actual, actualizar la interfaz
    if (provider === selectedProvider) {
      setShowApiConfig(true);
    }
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
        },
        selectedProvider
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

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    AIKeyManager.setSelectedProvider(provider);
    
    // Verificar si necesitamos mostrar la configuración
    const hasKey = AIKeyManager.hasApiKey(provider);
    setShowApiConfig(!hasKey);
    
    // Si cambió el proveedor y tiene API key, agregar un mensaje informativo
    if (hasKey && provider !== selectedProvider) {
      const infoMessage: ChatMessage = {
        id: generateId(),
        content: `He cambiado a ${AI_PROVIDERS[provider].name} como proveedor de IA. ¿En qué puedo ayudarte?`,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, infoMessage]);
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
          <h2 className="font-medium">Asistente TareaAssist ({AI_PROVIDERS[selectedProvider].name})</h2>
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
                Configura y selecciona el proveedor de IA para el asistente.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="providers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="providers">Proveedores</TabsTrigger>
                <TabsTrigger value="config">Configuración</TabsTrigger>
              </TabsList>
              
              <TabsContent value="providers" className="space-y-4 py-4">
                <div className="grid gap-4">
                  {Object.entries(AI_PROVIDERS).map(([key, value]) => {
                    const provider = key as AIProvider;
                    const hasApiKey = AIKeyManager.hasApiKey(provider);
                    
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border cursor-pointer ${
                          selectedProvider === provider 
                            ? theme === 'dark'
                              ? 'bg-gray-700 border-tareaassist-dark-primary'
                              : 'bg-purple-50 border-purple-500'
                            : theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleProviderChange(provider)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <h3 className="font-medium">{value.name}</h3>
                            <p className="text-xs text-muted-foreground">{value.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasApiKey && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={(e) => handleRemoveApiKey(provider, e)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                            {hasApiKey && <div className="h-2 w-2 bg-green-500 rounded-full"></div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="config">
                <AIProviderSelector onClose={() => setShowSettings(false)} />
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {showApiConfig ? (
        <div className="flex-1 p-4 flex flex-col justify-center items-center">
          <div className={`max-w-md w-full p-5 rounded-xl border shadow-sm ${theme === 'dark' ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-white/80'}`}>
            <h3 className="text-lg font-medium mb-2">Configuración de IA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Para utilizar la inteligencia artificial avanzada, configura un proveedor de IA.
            </p>
            
            <div className="space-y-4">
              <Alert variant={theme === 'dark' ? 'default' : 'default'} className={`${theme === 'dark' ? 'bg-gray-700/70 border-gray-600' : 'bg-blue-50 border-blue-200'} border-l-4 border-l-primary`}>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Tu API Key se guardará localmente en este navegador y no se compartirá con terceros.
                </AlertDescription>
              </Alert>
              
              <AIProviderSelector onClose={() => setShowApiConfig(false)} />
              
              <p className="text-xs text-center text-muted-foreground mt-2">
                Si no tienes una API Key, puedes seguir usando el asistente básico sin conectar a un proveedor de IA.{' '}
                <button 
                  onClick={() => setShowApiConfig(false)}
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
