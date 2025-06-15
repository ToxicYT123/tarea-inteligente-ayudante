import { useState, useEffect } from 'react';
import { Task, Attachment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tasks')
        .select('*, academic_contexts(*)')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        setError('Error al cargar las tareas');
        return;
      }

      console.log("[Supabase] Tareas recibidas:", data);

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        subject: task.subject,
        title: task.title,
        description: task.description || '',
        due_date: task.due_date,
        created_at: task.created_at,
        completed: task.completed,
        attachments: [],  // cargar desde Supabase en el futuro
        priority: task.priority as 'low' | 'medium' | 'high',
        academic_context_id: task.academic_context_id,
        assignment_type: task.assignment_type,
        updated_at: task.updated_at
      }));

      setTasks(formattedTasks);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Error inesperado al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task: Task) => {
    try {
      setTasks(prev => [...prev, task]);

      const { error } = await supabase
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
        });

      if (error) {
        setTasks(prev => prev.filter(t => t.id !== task.id));
        console.error('Error adding task:', error);
        toast.error('Error al agregar la tarea');
      } else {
        toast.success('Tarea agregada correctamente');
        fetchTasks();
      }
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== task.id));
      console.error('Unexpected error adding task:', err);
      toast.error('Error inesperado al agregar la tarea');
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompletedState = !task.completed;

    try {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: newCompletedState } : t
      ));

      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompletedState })
        .eq('id', taskId);

      if (error) {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, completed: task.completed } : t
        ));
        console.error('Error updating task:', error);
        toast.error('Error al actualizar la tarea');
      } else {
        toast.success(newCompletedState ? 'Tarea completada' : 'Tarea marcada como pendiente');
        fetchTasks();
      }
    } catch (err) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: task.completed } : t
      ));
      console.error('Unexpected error updating task:', err);
      toast.error('Error inesperado al actualizar la tarea');
    }
  };

  const handleAddAttachment = async (taskId: string, attachment: Attachment) => {
    try {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            attachments: [...(task.attachments || []), attachment]
          };
        }
        return task;
      }));

      const { error } = await supabase
        .from('attachments')
        .insert({
          task_id: taskId,
          type: attachment.type,
          name: attachment.name,
          storage_path: attachment.url
        });

      if (error) {
        setTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              attachments: task.attachments?.filter(a => a.id !== attachment.id) || []
            };
          }
          return task;
        }));
        console.error('Error adding attachment:', error);
        toast.error('Error al agregar el archivo adjunto');
      } else {
        toast.success('Archivo adjunto agregado correctamente');
        fetchTasks();
      }
    } catch (err) {
      console.error('Unexpected error adding attachment:', err);
      toast.error('Error inesperado al agregar el archivo adjunto');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    try {
      setTasks(prev => prev.filter(task => task.id !== taskId));

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        setTasks(prev => [...prev, taskToDelete]);
        console.error('Error deleting task:', error);
        toast.error("Error al eliminar la tarea");
      } else {
        toast.success("Tarea eliminada correctamente");
        fetchTasks();
      }
    } catch (err) {
      setTasks(prev => [...prev, taskToDelete]);
      console.error('Unexpected error deleting task:', err);
      toast.error("Error inesperado al eliminar la tarea");
    }
  };

  return {
    tasks,
    loading,
    error,
    handleAddTask,
    handleToggleComplete,
    handleAddAttachment,
    handleDeleteTask,
    refetch: fetchTasks
  };
};
