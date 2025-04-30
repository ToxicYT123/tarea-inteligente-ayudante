
import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { generateAIResponse, validateApiKey } from '@/utils/aiUtils';
import { MessageSquare, Loader2 } from 'lucide-react';
import ChatContainer from './chat/ChatContainer';
import { toast } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InfoIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AIChatProps {
  tasks: Task[];
  onAddTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className={`p-4 border-b flex items-center space-x-2 ${
        theme === 'dark'
          ? 'border-gray-700 bg-gradient-to-r from-tareaassist-dark-primary to-tareaassist-dark-secondary text-white'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
      }`}>
        <MessageSquare className="h-5 w-5" />
        <h2 className="font-medium">Asistente TareaAssist</h2>
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
