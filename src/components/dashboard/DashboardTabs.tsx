
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, Attachment } from '@/types';
import TaskList from '../TaskList';
import TaskForm from '../TaskForm';
import TaskStats from '../TaskStats';
import AcademicContextForm from '../AcademicContextForm';
import { useTheme } from "@/hooks/use-theme";

interface DashboardTabsProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onAddAttachment: (taskId: string, attachment: Attachment) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Task) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tasks,
  onToggleComplete,
  onAddAttachment,
  onDeleteTask,
  onAddTask
}) => {
  const { theme } = useTheme();
  
  const cardClasses = theme === 'dark' 
    ? 'bg-gray-800/80 border-gray-700/50 shadow-md transition-all duration-300' 
    : 'bg-white shadow-sm backdrop-blur-sm border-gray-100/50 transition-all duration-300';

  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className={`grid w-full grid-cols-4 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
        <TabsTrigger value="tasks">Mis Tareas</TabsTrigger>
        <TabsTrigger value="add">Agregar Tarea</TabsTrigger>
        <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        <TabsTrigger value="context">Contexto</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tasks" className={`p-4 rounded-lg border ${cardClasses}`}>
        <TaskList 
          tasks={tasks} 
          onToggleComplete={onToggleComplete}
          onAddAttachment={onAddAttachment}
          onDeleteTask={onDeleteTask}
        />
      </TabsContent>
      
      <TabsContent value="add" className={`p-4 rounded-lg border ${cardClasses}`}>
        <TaskForm onAddTask={onAddTask} />
      </TabsContent>
      
      <TabsContent value="stats" className={`p-4 rounded-lg border ${cardClasses}`}>
        <TaskStats tasks={tasks} />
      </TabsContent>

      <TabsContent value="context" className={`p-4 rounded-lg border ${cardClasses}`}>
        <AcademicContextForm />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
