
import { useState, useRef, useEffect } from 'react';
import { generateId } from '@/utils/taskUtils';
import { AI_PROVIDERS, AIKeyManager, AIProvider, generateAIResponse } from '@/services/ai';
import { toast } from "@/components/ui/sonner";
import { ChatMessage, Task } from '@/types';

interface UseAIChatParams {
  tasks: Task[];
  onAddTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function useAIChat({ tasks, onAddTask, onDeleteTask }: UseAIChatParams) {
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
  const [showApiConfig, setShowApiConfig] = useState<boolean>(
    !AIKeyManager.hasApiKey(AIKeyManager.getSelectedProvider())
  );
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIKeyManager.getSelectedProvider());
  const [aiKeyVersion, setAiKeyVersion] = useState(0);

  useEffect(() => {
    const hasKey = AIKeyManager.hasApiKey(selectedProvider);
    setShowApiConfig(!hasKey);
    setAiKeyVersion((v) => v + 1);
  }, [selectedProvider]);

  const handleNewMessage = async (input: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    try {
      const apiKey = AIKeyManager.getApiKey(selectedProvider);
      if (!apiKey) {
        setShowApiConfig(true);
        setIsTyping(false);
        toast.error("Por favor, configura tu API Key para usar el asistente IA.");
        return;
      }
      const response = await generateAIResponse(
        input.trim(),
        tasks,
        (newTask) => {
          if (onAddTask) {
            onAddTask(newTask);
            toast.success("Tarea creada correctamente por la IA");
          }
        },
        (taskId) => {
          if (onDeleteTask) {
            onDeleteTask(taskId);
            toast.success("Tarea eliminada correctamente por la IA");
          }
        },
        selectedProvider
      );
      const aiMessage: ChatMessage = {
        id: generateId(),
        content: response || "No se pudo obtener respuesta de la IA.",
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        content: "Lo siento, hubo un error procesando tu mensaje. Revisa tu API Key o intenta de nuevo.",
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
    const hasKey = AIKeyManager.hasApiKey(provider);
    setShowApiConfig(!hasKey);
    setAiKeyVersion((v) => v + 1);
    if (hasKey && provider !== selectedProvider) {
      const infoMessage: ChatMessage = {
        id: generateId(),
        content: `Proveedor IA cambiado a ${AI_PROVIDERS[provider].name}.`,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, infoMessage]);
    }
  };

  return {
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    showSettings,
    setShowSettings,
    showApiConfig,
    setShowApiConfig,
    selectedProvider,
    setSelectedProvider: handleProviderChange,
    aiKeyVersion,
    setAiKeyVersion,
    handleNewMessage,
  };
}
