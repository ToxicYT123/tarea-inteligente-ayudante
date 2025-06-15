
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { Task } from '@/types';
import AIChat from '@/components/AIChat';
import { Bot } from 'lucide-react';

interface AIAssistantProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ tasks, onAddTask, onDeleteTask }) => {
  const { theme } = useTheme();

  return (
    <Card className={`h-fit ${
      theme === 'dark' 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>Asistente IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AIChat 
          tasks={tasks} 
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
        />
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
