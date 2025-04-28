
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import AIChat from '@/components/AIChat';
import AcademicContextForm from '@/components/AcademicContextForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, academic_contexts(*)');
      
      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }
      
      setTasks(data || []);
    };

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto p-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tasks">Mis Tareas</TabsTrigger>
                <TabsTrigger value="add">Agregar Tarea</TabsTrigger>
                <TabsTrigger value="context">Contexto Académico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks">
                <TaskList tasks={tasks} />
              </TabsContent>
              
              <TabsContent value="add">
                <TaskForm />
              </TabsContent>

              <TabsContent value="context">
                <AcademicContextForm />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <AIChat tasks={tasks} />
          </div>
        </div>
      </main>
      
      <footer className="bg-card border-t py-4">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2025 TareaAssist - Desarrollado por HABY y Heber Zadkiel Garcia Perez. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
