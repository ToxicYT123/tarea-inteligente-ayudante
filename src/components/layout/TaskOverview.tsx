
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { Task, Attachment } from '@/types';
import TaskList from '@/components/TaskList';

interface TaskOverviewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onAddAttachment: (taskId: string, attachment: Attachment) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Task) => void;
}

const TaskOverview: React.FC<TaskOverviewProps> = ({
  tasks,
  onToggleComplete,
  onAddAttachment,
  onDeleteTask,
  onAddTask
}) => {
  const { theme } = useTheme();

  return (
    <Card className={`${
      theme === 'dark' 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <CardHeader>
        <CardTitle className="text-xl">Mis Tareas</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskList 
          tasks={tasks} 
          onToggleComplete={onToggleComplete}
          onAddAttachment={onAddAttachment}
          onDeleteTask={onDeleteTask}
        />
      </CardContent>
    </Card>
  );
};

export default TaskOverview;
