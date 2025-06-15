
import { useState, useEffect } from 'react';
import { Task, Attachment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

export const useTasks = () => {
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
      
      const formattedTasks: Task[] = data?.map(task => ({
        id: task.id,
        subject: task.subject,
        title: task.title,
        description: task.description || '',
        due_date: task.due_date,
        created_at: task.created_at,
        completed: task.completed,
        attachments: [],
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

  return {
    tasks,
    handleAddTask,
    handleToggleComplete,
    handleAddAttachment,
    handleDeleteTask
  };
};
