
import React, { useRef } from 'react';
import { Task } from '@/types';
import ChatContainer from './chat/ChatContainer';
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import AIProviderSelector from './ai/AIProviderSelector';
import AIProviderSettings from './ai/AIProviderSettings';
import { useAIChat } from '@/hooks/useAIChat';

interface AIChatProps {
  tasks: Task[];
  onAddTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const AIChat: React.FC<AIChatProps> = ({ tasks, onAddTask, onDeleteTask }) => {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isTyping,
    showSettings,
    setShowSettings,
    showApiConfig,
    setShowApiConfig,
    selectedProvider,
    setSelectedProvider,
    aiKeyVersion,
    setAiKeyVersion,
    handleNewMessage,
  } = useAIChat({ tasks, onAddTask, onDeleteTask });

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
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setShowSettings(true)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <AIProviderSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        setShowApiConfig={setShowApiConfig}
        setAiKeyVersion={setAiKeyVersion}
      />
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
              <AIProviderSelector onClose={() => {
                setShowApiConfig(false);
                setAiKeyVersion((v) => v + 1);
              }} />
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
