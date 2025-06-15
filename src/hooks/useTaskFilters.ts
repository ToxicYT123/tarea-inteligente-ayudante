
import { useMemo, useState } from 'react';
import { Task } from '@/types';

export const useTaskFilters = (tasks: Task[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('dueDate');
  const [filter, setFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState({
    subjects: [] as string[],
    priorities: [] as string[],
    dateRange: { start: '', end: '' }
  });

  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(tasks.map(task => task.subject)));
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Date filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);

      if (filter === 'today' && taskDate.getTime() !== today.getTime()) return false;
      if (filter === 'upcoming' && taskDate <= today) return false;
      if (filter === 'overdue' && taskDate >= today) return false;

      // Advanced filters
      if (advancedFilters.subjects.length > 0 && !advancedFilters.subjects.includes(task.subject)) {
        return false;
      }
      if (advancedFilters.priorities.length > 0 && !advancedFilters.priorities.includes(task.priority)) {
        return false;
      }
      if (advancedFilters.dateRange.start && taskDate < new Date(advancedFilters.dateRange.start)) {
        return false;
      }
      if (advancedFilters.dateRange.end && taskDate > new Date(advancedFilters.dateRange.end)) {
        return false;
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sort) {
        case 'dueDate':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchTerm, sort, filter, advancedFilters]);

  const pendingTasks = filteredAndSortedTasks.filter(task => !task.completed);
  const completedTasks = filteredAndSortedTasks.filter(task => task.completed);

  // Count tasks for filter labels
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);

  const todayCount = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && !task.completed;
  }).length;

  const weekCount = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate > today && taskDate <= weekFromNow && !task.completed;
  }).length;

  const upcomingCount = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate > weekFromNow && !task.completed;
  }).length;

  const hasActiveFilters = searchTerm !== '' || filter !== 'all';
  const hasAdvancedFilters = advancedFilters.subjects.length > 0 || 
                            advancedFilters.priorities.length > 0 || 
                            advancedFilters.dateRange.start !== '' || 
                            advancedFilters.dateRange.end !== '';

  const handleAdvancedFiltersChange = (newFilters: typeof advancedFilters) => {
    setAdvancedFilters(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setAdvancedFilters({
      subjects: [],
      priorities: [],
      dateRange: { start: '', end: '' }
    });
  };

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
