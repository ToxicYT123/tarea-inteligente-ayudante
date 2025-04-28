
import React, { useState } from 'react';
import { Task, Attachment } from '@/types';
import TaskItem from './TaskItem';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { filterTasksByDueDate } from '@/utils/taskUtils';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onAddAttachment: (taskId: string, attachment: Attachment) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onAddAttachment,
  onDeleteTask
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('dueDate');
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Aplicar el filtro de tiempo (hoy, semana, etc.)
      let matchesTimeFilter = true;
      if (filter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (filter === 'today') {
          matchesTimeFilter = dueDate.getTime() === today.getTime();
        } 
        else if (filter === 'upcoming') {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          matchesTimeFilter = dueDate >= tomorrow;
        }
        else if (filter === 'overdue') {
          matchesTimeFilter = dueDate < today && !task.completed;
        }
      }
      
      return matchesSearch && matchesTimeFilter;
    })
    .sort((a, b) => {
      if (sort === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sort === 'priority') {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return priorityValues[b.priority] - priorityValues[a.priority];
      } else if (sort === 'subject') {
        return a.subject.localeCompare(b.subject);
      }
      return 0;
    });

  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);
  
  const todayCount = filterTasksByDueDate('today').length;
  const weekCount = filterTasksByDueDate('week').length;
  const upcomingCount = filterTasksByDueDate('upcoming').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Input
          placeholder="Buscar tarea..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        
        <div className="flex flex-col sm:flex-row gap-2 sm:w-auto w-full">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="sm:w-[150px] w-full">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="today">Hoy ({todayCount})</SelectItem>
              <SelectItem value="upcoming">Próximamente ({weekCount + upcomingCount})</SelectItem>
              <SelectItem value="overdue">Vencidas</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="sm:w-[150px] w-full">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Fecha de entrega</SelectItem>
              <SelectItem value="priority">Prioridad</SelectItem>
              <SelectItem value="subject">Materia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
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
              {searchTerm ? 'No se encontraron tareas que coincidan con la búsqueda.' : '¡No hay tareas pendientes!'}
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
              No hay tareas completadas.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskList;
