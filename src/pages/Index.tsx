
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
import { useTheme } from "@/hooks/use-theme";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, academic_contexts(*)');
      
      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }
      
      // Map the database data to our Task interface format
      const formattedTasks: Task[] = data?.map(task => ({
        id: task.id,
        subject: task.subject,
        title: task.title,
        description: task.description || '',
        due_date: task.due_date,
        created_at: task.created_at,
        completed: task.completed,
        attachments: [], // We'll fetch attachments separately if needed
        priority: task.priority as 'low' | 'medium' | 'high',
        academic_context_id: task.academic_context_id,
        assignment_type: task.assignment_type,
        updated_at: task.updated_at
      })) || [];
      
      setTasks(formattedTasks);
    };

    fetchTasks();
  }, []);

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    // Add to Supabase - ensure task data matches the schema
    supabase
      .from('tasks')
      .insert({
        id: task.id,
        subject: task.subject,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        completed: task.completed,
        academic_context_id: task.academic_context_id,
        assignment_type: task.assignment_type
      })
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

  const cardClasses = theme === 'dark' 
    ? 'bg-gray-800/80 border-gray-700/50 shadow-md transition-all duration-300' 
    : 'bg-white shadow-sm transition-all duration-300';

  return (
    <div className={`min-h-screen bg-background transition-theme ${theme === 'dark' ? 'bg-gray-900' : ''}`}>
      <Header />

      <main className="container mx-auto p-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className={`grid w-full grid-cols-3 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
                <TabsTrigger value="tasks">Mis Tareas</TabsTrigger>
                <TabsTrigger value="add">Agregar Tarea</TabsTrigger>
                <TabsTrigger value="context">Contexto Académico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks" className={`p-4 rounded-lg ${cardClasses}`}>
                <TaskList 
                  tasks={tasks} 
                  onToggleComplete={handleToggleComplete}
                  onAddAttachment={handleAddAttachment}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
              
              <TabsContent value="add" className={`p-4 rounded-lg ${cardClasses}`}>
                <TaskForm onAddTask={handleAddTask} />
              </TabsContent>

              <TabsContent value="context" className={`p-4 rounded-lg ${cardClasses}`}>
                <AcademicContextForm />
              </TabsContent>
            </Tabs>
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
      
      <footer className={`border-t py-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-card border-gray-100'}`}>
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2025 HABY TareaAssist - Desarrollado por HABY y Heber Zadkiel Garcia Perez. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
