
import React from 'react';
import { useTheme } from "@/hooks/use-theme";
import { useTasks } from '@/hooks/useTasks';
import MainNavigation from '@/components/layout/MainNavigation';
import HeroSection from '@/components/layout/HeroSection';
import QuickActions from '@/components/layout/QuickActions';
import TaskOverview from '@/components/layout/TaskOverview';
import AIAssistant from '@/components/layout/AIAssistant';
import StatsCards from '@/components/layout/StatsCards';

const Dashboard = () => {
  const { theme } = useTheme();
  const {
    tasks,
    handleAddTask,
    handleToggleComplete,
    handleAddAttachment,
    handleDeleteTask
  } = useTasks();

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <MainNavigation />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <HeroSection />
        
        <StatsCards tasks={tasks} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <QuickActions onAddTask={handleAddTask} />
            <TaskOverview
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onAddAttachment={handleAddAttachment}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
            />
          </div>
          
          <div className="xl:col-span-1">
            <AIAssistant 
              tasks={tasks} 
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </main>
      
      <footer className={`mt-16 border-t py-8 ${
        theme === 'dark' 
          ? 'bg-gray-900/50 border-gray-800' 
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 HABY TareaAssist - Desarrollado por HABY y Heber Zadkiel Garcia Perez
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
