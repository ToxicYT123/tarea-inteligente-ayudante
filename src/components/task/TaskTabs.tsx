
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, Attachment } from '@/types';
import TaskItem from '../TaskItem';

interface TaskTabsProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onAddAttachment: (taskId: string, attachment: Attachment) => void;
  onDeleteTask: (taskId: string) => void;
  searchTerm: string;
  filter: string;
  hasAdvancedFilters: boolean;
}

const TaskTabs: React.FC<TaskTabsProps> = ({
  pendingTasks,
  completedTasks,
  onToggleComplete,
  onAddAttachment,
  onDeleteTask,
  searchTerm,
  filter,
  hasAdvancedFilters
}) => {
  const hasActiveFilters = searchTerm || filter !== 'all' || hasAdvancedFilters;

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="pending">Pendientes ({pendingTasks.length})</TabsTrigger>
        <TabsTrigger value="completed">Completadas ({completedTasks.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending">
        {pendingTasks.length > 0 ? (
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onAddAttachment={onAddAttachment}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {hasActiveFilters
              ? 'No se encontraron tareas que coincidan con los filtros.'
              : '¡No hay tareas pendientes!'}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="completed">
        {completedTasks.length > 0 ? (
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onAddAttachment={onAddAttachment}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {hasActiveFilters
              ? 'No se encontraron tareas completadas que coincidan con los filtros.'
              : 'No hay tareas completadas.'}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default TaskTabs;
