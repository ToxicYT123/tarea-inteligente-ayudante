
import React from 'react';
import TutorialGuide from '../TutorialGuide';
import NotificationCenter from '../NotificationCenter';
import CalendarSync from '../CalendarSync';
import { Task } from '@/types';

interface DashboardHeaderProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ tasks, onToggleComplete }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <TutorialGuide />
        <NotificationCenter tasks={tasks} onToggleComplete={onToggleComplete} />
        <CalendarSync tasks={tasks} />
      </div>
    </div>
  );
};

export default DashboardHeader;
