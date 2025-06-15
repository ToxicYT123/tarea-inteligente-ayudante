
import React from 'react';
import { Task, Attachment } from '@/types';
import TaskFilters from './task/TaskFilters';
import TaskTabs from './task/TaskTabs';
import { useTaskFilters } from '@/hooks/useTaskFilters';

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
  const {
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
  } = useTaskFilters(tasks);

  return (
    <div className="space-y-6">
      <TaskFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        uniqueSubjects={uniqueSubjects}
        onAdvancedFiltersChange={handleAdvancedFiltersChange}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        todayCount={todayCount}
        weekCount={weekCount}
        upcomingCount={upcomingCount}
      />
      
      <TaskTabs
        pendingTasks={pendingTasks}
        completedTasks={completedTasks}
        onToggleComplete={onToggleComplete}
        onAddAttachment={onAddAttachment}
        onDeleteTask={onDeleteTask}
        searchTerm={searchTerm}
        filter={filter}
        hasAdvancedFilters={hasAdvancedFilters}
      />
    </div>
  );
};

export default TaskList;
