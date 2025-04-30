
import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { generateAIResponse } from '@/utils/aiUtils';
import { MessageSquare, Loader2 } from 'lucide-react';
import ChatContainer from './chat/ChatContainer';
import { toast } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className={`flex flex-col rounded-lg border shadow-sm h-[500px] transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/90 border-gray-700' 
        : 'bg-white'
    }`}>
      <div className={`p-4 border-b flex items-center space-x-2 ${
        theme === 'dark'
          ? 'border-gray-700 bg-tareaassist-dark-primary text-white'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
      }`}>
        <MessageSquare className="h-5 w-5" />
        <h2 className="font-medium">Asistente TareaAssist</h2>
      </div>
      
      {showApiKeyInput ? (
        <div className="flex-1 p-4 flex flex-col justify-center items-center">
          <div className={`max-w-md w-full p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-medium mb-2">Configuración de IA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Para utilizar la inteligencia artificial avanzada, necesitas proporcionar una API Key de OpenAI.
            </p>
            
            <div className="space-y-4">
              <Alert variant="default" className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
                <AlertDescription>
                  Tu API Key se guardará localmente en este navegador y no se compartirá con terceros.
                </AlertDescription>
              </Alert>
              
              <Input
                type="password"
                placeholder="Ingresa tu API Key de OpenAI"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}
              />
              
              <Button 
                onClick={handleSaveApiKey} 
                className="w-full"
                disabled={!apiKey.trim()}
              >
                Guardar y Continuar
              </Button>
              
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
