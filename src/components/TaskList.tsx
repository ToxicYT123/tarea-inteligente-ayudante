
import React, { useState, useEffect } from 'react';
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
import { filterTasksByDueDate, isPastDue } from '@/utils/taskUtils';
import AdvancedFilters from './AdvancedFilters';
import { Button } from '@/components/ui/button';

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
  const [advancedFilters, setAdvancedFilters] = useState({
    search: '',
    priority: 'all',
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
    subject: 'all',
    status: 'all',
  });
  
  // Lista de materias única para los filtros
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  
  useEffect(() => {
    // Extraer materias únicas de las tareas
    const subjects = [...new Set(tasks.map(task => task.subject))];
    setUniqueSubjects(subjects);
    
    // Aplicar la búsqueda avanzada cuando cambie
    if (advancedFilters.search) {
      setSearchTerm(advancedFilters.search);
    }
  }, [tasks, advancedFilters.search]);

  // Aplicar filtros básicos y avanzados
  const filteredTasks = tasks.filter(task => {
    // Filtro de búsqueda básica
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de tiempo básico
    let matchesTimeFilter = true;
    if (filter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueDate = new Date(task.due_date);
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
    
    // Filtros avanzados
    let matchesAdvancedFilters = true;
    
    // Filtro de prioridad
    if (advancedFilters.priority !== 'all') {
      matchesAdvancedFilters = matchesAdvancedFilters && task.priority === advancedFilters.priority;
    }
    
    // Filtro de fecha
    if (advancedFilters.dateRange.from || advancedFilters.dateRange.to) {
      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);
      
      if (advancedFilters.dateRange.from) {
        matchesAdvancedFilters = matchesAdvancedFilters && taskDate >= advancedFilters.dateRange.from;
      }
      
      if (advancedFilters.dateRange.to) {
        matchesAdvancedFilters = matchesAdvancedFilters && taskDate <= advancedFilters.dateRange.to;
      }
    }
    
    // Filtro de materia
    if (advancedFilters.subject !== 'all') {
      matchesAdvancedFilters = matchesAdvancedFilters && task.subject === advancedFilters.subject;
    }
    
    // Filtro de estado
    if (advancedFilters.status !== 'all') {
      if (advancedFilters.status === 'completed') {
        matchesAdvancedFilters = matchesAdvancedFilters && task.completed;
      } else if (advancedFilters.status === 'pending') {
        matchesAdvancedFilters = matchesAdvancedFilters && !task.completed;
      } else if (advancedFilters.status === 'overdue') {
        matchesAdvancedFilters = matchesAdvancedFilters && isPastDue(task.due_date) && !task.completed;
      }
    }
    
    return matchesSearch && matchesTimeFilter && matchesAdvancedFilters;
  }).sort((a, b) => {
    if (sort === 'dueDate') {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
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
  
  const handleAdvancedFiltersChange = (filters: typeof advancedFilters) => {
    setAdvancedFilters(filters);
    
    // Si hay una búsqueda en los filtros avanzados, actualizamos la búsqueda básica
    if (filters.search !== searchTerm) {
      setSearchTerm(filters.search);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setAdvancedFilters({
      search: '',
      priority: 'all',
      dateRange: {
        from: undefined,
        to: undefined,
      },
      subject: 'all',
      status: 'all',
    });
  };
  
  const hasActiveFilters = searchTerm || filter !== 'all' || 
    advancedFilters.priority !== 'all' || 
    advancedFilters.dateRange.from || 
    advancedFilters.dateRange.to ||
    advancedFilters.subject !== 'all' ||
    advancedFilters.status !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex flex-grow items-center gap-2">
          <Input
            placeholder="Buscar tarea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          
          <AdvancedFilters 
            onFiltersChange={handleAdvancedFiltersChange}
            subjects={uniqueSubjects}
          />
        </div>
        
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
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="text-xs h-8"
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}
      
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
              {searchTerm || filter !== 'all' || Object.values(advancedFilters).some(v => v !== 'all' && v !== '')
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
              {searchTerm || filter !== 'all'
                ? 'No se encontraron tareas completadas que coincidan con los filtros.'
                : 'No hay tareas completadas.'}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskList;
