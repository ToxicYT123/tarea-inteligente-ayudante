
import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { generateAIResponse } from '@/utils/aiUtils';
import { MessageSquare } from 'lucide-react';
import ChatContainer from './chat/ChatContainer';
import { toast } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewMessage = (input: string) => {
    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: generateId(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Generar respuesta de IA con capacidad para crear/eliminar tareas
    setTimeout(() => {
      const response = generateAIResponse(
        input.trim().toLowerCase(), 
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
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className={`flex flex-col rounded-lg border shadow-sm h-[500px] transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/90 border-gray-700' 
        : 'bg-white'
    }`}>
      <div className={`p-4 border-b flex items-center space-x-2 ${
        theme === 'dark'
          ? 'border-gray-700 bg-gradient-app-dark'
          : 'bg-tareaassist-primary'
      } text-white`}>
        <MessageSquare className="h-5 w-5" />
        <h2 className="font-medium">Asistente TareaAssist</h2>
      </div>
      
      <ChatContainer 
        messages={messages}
        isTyping={isTyping}
        onNewMessage={handleNewMessage}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
};

export default AIChat;
