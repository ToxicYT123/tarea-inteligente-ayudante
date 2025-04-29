
import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { generateAIResponse } from '@/utils/aiUtils';
import { MessageSquare } from 'lucide-react';
import ChatContainer from './chat/ChatContainer';

interface AIChatProps {
  tasks: Task[];
}

const AIChat: React.FC<AIChatProps> = ({ tasks }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      content: "¡Hola! Soy tu asistente para tareas. Puedes preguntarme cosas como '¿Qué tareas tengo para hoy?' o '¿Cuándo debo entregar el trabajo de matemáticas?'",
      sender: 'assistant',
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    // Simular respuesta de IA
    setTimeout(() => {
      const response = generateAIResponse(input.trim().toLowerCase(), tasks);
      
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
    <div className="flex flex-col rounded-lg border shadow-sm bg-white h-[500px]">
      <div className="p-4 border-b flex items-center space-x-2 bg-tareaassist-primary text-white">
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
