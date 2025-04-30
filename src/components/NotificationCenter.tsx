
import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/hooks/use-theme';
import { Bell, Check, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { formatDate, isPastDue, isToday } from '@/utils/taskUtils';
import { toast } from "@/components/ui/sonner";

interface NotificationCenterProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ tasks, onToggleComplete }) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Task[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Filtrar tareas relevantes para notificaciones
  useEffect(() => {
    // Tareas que vencen hoy o están vencidas y no completadas
    const importantTasks = tasks.filter(task => 
      (isToday(task.due_date) || isPastDue(task.due_date)) && !task.completed
    );
    
    // Ordenar por prioridad y fecha
    const sortedTasks = [...importantTasks].sort((a, b) => {
      // Primero por fecha vencida
      if (isPastDue(a.due_date) && !isPastDue(b.due_date)) return -1;
      if (!isPastDue(a.due_date) && isPastDue(b.due_date)) return 1;
      
      // Luego por prioridad
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    });
    
    setNotifications(sortedTasks);

    // Mostrar toast con notificaciones pendientes si hay nuevas
    if (sortedTasks.length > 0 && !isOpen) {
      const overdueCount = sortedTasks.filter(task => isPastDue(task.due_date)).length;
      const todayCount = sortedTasks.filter(task => isToday(task.due_date)).length;
      
      if (overdueCount > 0) {
        toast(`Tienes ${overdueCount} tarea(s) vencida(s)`, {
          description: "Click en la campana para ver detalles",
          duration: 5000,
        });
      } else if (todayCount > 0) {
        toast(`Tienes ${todayCount} tarea(s) para hoy`, {
          description: "Click en la campana para ver detalles",
          duration: 5000,
        });
      }
    }
  }, [tasks]);

  const handleMarkAsComplete = (taskId: string) => {
    onToggleComplete(taskId);
  };

  const getMaxToShow = expanded ? notifications.length : 3;
  
  const notificationColor = theme === 'dark' 
    ? 'bg-tareaassist-dark-primary hover:bg-tareaassist-dark-secondary' 
    : '';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell size={16} />
          {notifications.length > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 px-1 min-w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-80 p-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-medium">Notificaciones</h3>
          {notifications.length > 0 && (
            <Badge variant="outline" className="font-normal">
              {notifications.length} pendientes
            </Badge>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <>
              {notifications.slice(0, getMaxToShow).map((task) => (
                <div 
                  key={task.id} 
                  className={`p-3 border-b flex items-start gap-3 ${
                    isPastDue(task.due_date) ? (theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50') : ''
                  }`}
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 rounded-full mt-0.5"
                    onClick={() => handleMarkAsComplete(task.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">{task.title}</h4>
                      <Badge variant={isPastDue(task.due_date) ? "destructive" : "outline"} className="text-xs">
                        {isPastDue(task.due_date) ? "Vencida" : "Hoy"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{task.subject}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full py-2 text-xs"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <div className="flex items-center">
                      Mostrar menos <ChevronUp className="ml-1 h-3 w-3" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Mostrar {notifications.length - 3} más <ChevronDown className="ml-1 h-3 w-3" />
                    </div>
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No hay notificaciones pendientes
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
