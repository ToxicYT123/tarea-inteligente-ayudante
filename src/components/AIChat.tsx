
import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateId, formatDate } from '@/utils/taskUtils';
import { MessageSquare } from 'lucide-react';

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
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: generateId(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
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

  // Esta es una función simulada; en un entorno real usaríamos un servicio de IA
  const generateAIResponse = (query: string, tasks: Task[]): string => {
    // Filtrar tareas pendientes
    const pendingTasks = tasks.filter(task => !task.completed);
    
    // Tareas para hoy
    if (query.includes('hoy') || query.includes('para hoy')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayTasks = pendingTasks.filter(task => {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
      
      if (todayTasks.length === 0) {
        return "No tienes tareas para entregar hoy. ¡Buen trabajo!";
      }
      
      let response = `Tienes ${todayTasks.length} tarea(s) para hoy:\n\n`;
      todayTasks.forEach(task => {
        response += `- ${task.subject}: ${task.title}\n`;
      });
      
      return response;
    }
    
    // Tareas pendientes
    if (query.includes('pendiente') || query.includes('por hacer')) {
      if (pendingTasks.length === 0) {
        return "No tienes tareas pendientes. ¡Estás al día!";
      }
      
      let response = `Tienes ${pendingTasks.length} tarea(s) pendiente(s):\n\n`;
      pendingTasks.forEach(task => {
        response += `- ${task.subject}: ${task.title} (Entrega: ${formatDate(task.due_date)})\n`;
      });
      
      return response;
    }
    
    // Buscar tarea específica
    if (query.includes('matemáticas') || query.includes('matematicas')) {
      const mathTasks = pendingTasks.filter(
        task => task.subject.toLowerCase().includes('matem')
      );
      
      if (mathTasks.length === 0) {
        return "No encuentro tareas pendientes de matemáticas.";
      }
      
      let response = `Encontré ${mathTasks.length} tarea(s) de matemáticas:\n\n`;
      mathTasks.forEach(task => {
        response += `- ${task.title} (Entrega: ${formatDate(task.due_date)})\n`;
        if (task.description) {
          response += `  Descripción: ${task.description}\n`;
        }
      });
      
      return response;
    }
    
    // Buscar por fecha
    if (query.includes('semana') || query.includes('próxima semana')) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const weekTasks = pendingTasks.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate > today && dueDate <= nextWeek;
      });
      
      if (weekTasks.length === 0) {
        return "No tienes tareas para la próxima semana.";
      }
      
      let response = `Tienes ${weekTasks.length} tarea(s) para la próxima semana:\n\n`;
      weekTasks.forEach(task => {
        response += `- ${task.subject}: ${task.title} (Entrega: ${formatDate(task.due_date)})\n`;
      });
      
      return response;
    }
    
    // Respuestas generales
    if (query.includes('ayuda') || query.includes('cómo')) {
      return "Puedo ayudarte a organizar tus tareas. Pregúntame cosas como:\n\n" +
        "- ¿Qué tareas tengo para hoy?\n" +
        "- ¿Cuántas tareas tengo pendientes?\n" +
        "- ¿Tengo tareas de matemáticas?\n" +
        "- ¿Qué debo entregar la próxima semana?";
    }
    
    // Saludo
    if (query.includes('hola') || query.includes('qué tal')) {
      return "¡Hola! Estoy aquí para ayudarte con tus tareas. ¿En qué puedo ayudarte hoy?";
    }
    
    // Respuesta por defecto
    return "No estoy seguro de cómo responder a eso. ¿Podrías reformular tu pregunta? Puedes preguntarme sobre tus tareas de hoy, tareas pendientes o tareas de una materia específica.";
  };

  return (
    <div className="flex flex-col rounded-lg border shadow-sm bg-white h-[500px]">
      <div className="p-4 border-b flex items-center space-x-2 bg-tareaassist-primary text-white">
        <MessageSquare className="h-5 w-5" />
        <h2 className="font-medium">Asistente TareaAssist</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-tareaassist-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-line">{message.content}</div>
                <div className={`text-[10px] mt-1 ${
                  message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-grow"
          />
          <Button type="submit" size="sm" disabled={isTyping}>
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
