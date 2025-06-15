
import { useState, useEffect, useMemo } from 'react';
import { Task } from '@/types';
import { filterTasksByDueDate, isPastDue } from '@/utils/taskUtils';

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

  const uniqueSubjects = useMemo(() => {
    return [...new Set(tasks.map(task => task.subject))];
  }, [tasks]);

  useEffect(() => {
    if (advancedFilters.search) {
      setSearchTerm(advancedFilters.search);
    }
  }, [advancedFilters.search]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Basic search filter
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Basic time filter
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
      
      // Advanced filters
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
  }, [tasks, searchTerm, filter, sort, advancedFilters]);

  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);
  
  const todayCount = filterTasksByDueDate('today').length;
  const weekCount = filterTasksByDueDate('week').length;
  const upcomingCount = filterTasksByDueDate('upcoming').length;

  const handleAdvancedFiltersChange = (filters: FilterState) => {
    setAdvancedFilters(filters);
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

  const hasAdvancedFilters = advancedFilters.priority !== 'all' || 
    advancedFilters.dateRange.from || 
    advancedFilters.dateRange.to ||
    advancedFilters.subject !== 'all' ||
    advancedFilters.status !== 'all';

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
