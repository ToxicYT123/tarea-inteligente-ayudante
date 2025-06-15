
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task } from '@/types';
import { isPastDue } from '@/utils/taskUtils';

interface FilterState {
  search: string;
  priority: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  subject: string;
  status: string;
}

export const useTaskFilters = (tasks: Task[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('dueDate');
  const [filter, setFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    search: '',
    priority: 'all',
    dateRange: {
      from: undefined,
      to: undefined,
    },
    subject: 'all',
    status: 'all',
  });

  // Memoizar sujetos únicos para evitar recalcular en cada render
  const uniqueSubjects = useMemo(() => {
    return [...new Set(tasks.map(task => task.subject))];
  }, [tasks]);

  // Sincronizar búsqueda avanzada con búsqueda básica
  useEffect(() => {
    if (advancedFilters.search !== searchTerm) {
      setSearchTerm(advancedFilters.search);
    }
  }, [advancedFilters.search]);

  // Memoizar tareas filtradas para mejor performance
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filtro de búsqueda básica
      const matchesSearch = !searchTerm || 
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
        
        switch (filter) {
          case 'today':
            matchesTimeFilter = dueDate.getTime() === today.getTime();
            break;
          case 'upcoming':
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            matchesTimeFilter = dueDate >= tomorrow;
            break;
          case 'overdue':
            matchesTimeFilter = dueDate < today && !task.completed;
            break;
        }
      }
      
      // Filtros avanzados
      let matchesAdvancedFilters = true;
      
      if (advancedFilters.priority !== 'all') {
        matchesAdvancedFilters = matchesAdvancedFilters && task.priority === advancedFilters.priority;
      }
      
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
      
      if (advancedFilters.subject !== 'all') {
        matchesAdvancedFilters = matchesAdvancedFilters && task.subject === advancedFilters.subject;
      }
      
      if (advancedFilters.status !== 'all') {
        switch (advancedFilters.status) {
          case 'completed':
            matchesAdvancedFilters = matchesAdvancedFilters && task.completed;
            break;
          case 'pending':
            matchesAdvancedFilters = matchesAdvancedFilters && !task.completed;
            break;
          case 'overdue':
            matchesAdvancedFilters = matchesAdvancedFilters && isPastDue(task.due_date) && !task.completed;
            break;
        }
      }
      
      return matchesSearch && matchesTimeFilter && matchesAdvancedFilters;
    }).sort((a, b) => {
      switch (sort) {
        case 'dueDate':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityValues = { high: 3, medium: 2, low: 1 };
          return priorityValues[b.priority] - priorityValues[a.priority];
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });
  }, [tasks, searchTerm, filter, sort, advancedFilters]);

  // Memoizar tareas separadas por estado
  const pendingTasks = useMemo(() => 
    filteredTasks.filter(task => !task.completed), [filteredTasks]
  );
  
  const completedTasks = useMemo(() => 
    filteredTasks.filter(task => task.completed), [filteredTasks]
  );
  
  // Contadores para métricas
  const todayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;
  }, [tasks]);

  const weekCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today && dueDate <= nextWeek;
    }).length;
  }, [tasks]);

  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > nextWeek;
    }).length;
  }, [tasks]);

  // Callbacks para manejar cambios
  const handleAdvancedFiltersChange = useCallback((filters: FilterState) => {
    setAdvancedFilters(filters);
  }, []);
  
  const clearFilters = useCallback(() => {
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
  }, []);
  
  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => 
    searchTerm || filter !== 'all' || 
    advancedFilters.priority !== 'all' || 
    advancedFilters.dateRange.from || 
    advancedFilters.dateRange.to ||
    advancedFilters.subject !== 'all' ||
    advancedFilters.status !== 'all'
  , [searchTerm, filter, advancedFilters]);

  const hasAdvancedFilters = useMemo(() => 
    advancedFilters.priority !== 'all' || 
    advancedFilters.dateRange.from || 
    advancedFilters.dateRange.to ||
    advancedFilters.subject !== 'all' ||
    advancedFilters.status !== 'all'
  , [advancedFilters]);

  return {
    searchTerm,
    setSearchTerm,
    sort,
    setSort,
    filter,
    setFilter,
    uniqueSubjects,
    pendingTasks,
    completedTasks,
    todayCount,
    weekCount,
    upcomingCount,
    hasActiveFilters,
    hasAdvancedFilters,
    handleAdvancedFiltersChange,
    clearFilters
  };
};
