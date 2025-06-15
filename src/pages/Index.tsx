
import React from 'react';
import Header from '@/components/Header';
import AIChat from '@/components/AIChat';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { useTheme } from "@/hooks/use-theme";
import { useTasks } from '@/hooks/useTasks';

const Index = () => {
  const { theme } = useTheme();
  const {
    tasks,
    handleAddTask,
    handleToggleComplete,
    handleAddAttachment,
    handleDeleteTask
  } = useTasks();

  return (
    <div className={`min-h-screen bg-background transition-theme ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />

      <main className="container mx-auto p-4 sm:px-6 py-6 pb-20">
        <DashboardHeader tasks={tasks} onToggleComplete={handleToggleComplete} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardTabs
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onAddAttachment={handleAddAttachment}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
            />
          </div>
          
          <div className="lg:col-span-1">
            <AIChat 
              tasks={tasks} 
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </main>
      
      <footer className={`fixed bottom-0 left-0 right-0 border-t py-3 z-10 ${theme === 'dark' ? 'bg-gray-900/90 backdrop-blur-sm border-gray-800' : 'bg-white/90 backdrop-blur-sm border-gray-100'}`}>
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2025 HABY TareaAssist - Desarrollado por HABY y Heber Zadkiel Garcia Perez. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
