
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import AIChat from '@/components/AIChat';
import AcademicContextForm from '@/components/AcademicContextForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Task, Attachment } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { toast } from "@/components/ui/sonner";

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

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    // Add to Supabase
    supabase
      .from('tasks')
      .insert(task)
      .then(({ error }) => {
        if (error) console.error('Error adding task:', error);
      });
  };

  const handleToggleComplete = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      supabase
        .from('tasks')
        .update({ completed: !taskToUpdate.completed })
        .eq('id', taskId)
        .then(({ error }) => {
          if (error) console.error('Error updating task:', error);
        });
    }
  };

  const handleAddAttachment = (taskId: string, attachment: Attachment) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          attachments: [...(task.attachments || []), attachment]
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    
    supabase
      .from('attachments')
      .insert({
        task_id: taskId,
        type: attachment.type,
        name: attachment.name,
        storage_path: attachment.url
      })
      .then(({ error }) => {
        if (error) console.error('Error adding attachment:', error);
      });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting task:', error);
          toast.error("Error al eliminar la tarea");
        } else {
          toast.success("Tarea eliminada correctamente");
        }
      });
  };

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
                <TaskList 
                  tasks={tasks} 
                  onToggleComplete={handleToggleComplete}
                  onAddAttachment={handleAddAttachment}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
              
              <TabsContent value="add">
                <TaskForm onAddTask={handleAddTask} />
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
