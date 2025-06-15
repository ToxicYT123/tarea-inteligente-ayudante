
import { useState, useEffect } from 'react';
import { Task, Attachment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

// Función para transformar datos de Supabase a nuestro tipo Task
function mapSupabaseTask(task: any): Task {
  return {
    id: task.id,
    subject: task.subject,
    title: task.title,
    description: task.description || '',
    due_date: task.due_date,
    created_at: task.created_at,
    completed: task.completed ?? false,
    attachments: task.attachments || [],
    priority: task.priority as 'low' | 'medium' | 'high',
    academic_context_id: task.academic_context_id,
    assignment_type: task.assignment_type,
    updated_at: task.updated_at,
  };
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    // Suscribirse a realtime de supabase
    // Si lo quieres en tiempo real, puedes usar el canal de postgres_changes aquí
    // (no incluido porque depende de si lo necesitas)
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('[Supabase] Error fetching tasks:', error);
        setError('Error al cargar las tareas');
        setTasks([]);
        toast.error('No se pudo cargar las tareas');
        return;
      }

      setTasks((data || []).map(mapSupabaseTask));
      toast.success('Tareas actualizadas', { duration: 1200 });
    } catch (err: any) {
      setError('Error inesperado');
      setTasks([]);
      toast.error('Error inesperado al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task: Task) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          id: task.id,
          subject: task.subject,
          title: task.title,
          description: task.description ?? '',
          due_date: task.due_date,
          priority: task.priority,
          completed: task.completed ?? false,
          academic_context_id: task.academic_context_id ?? null,
          assignment_type: task.assignment_type ?? '',
        })
        .select('*')
        .maybeSingle();

      if (error || !data) {
        console.error('[Supabase] Error adding task:', error);
        toast.error('No se pudo agregar la tarea');
        return false;
      }
      setTasks(prev => [...prev, mapSupabaseTask(data)]);
      toast.success('Tarea agregada correctamente');
      return true;
    } catch (err: any) {
      toast.error('Error inesperado al agregar la tarea');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      toast.error('Tarea no encontrada');
      return;
    }
    const newCompleted = !task.completed;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompleted })
        .eq('id', taskId);

      if (error) {
        toast.error('No se pudo actualizar el estado');
        return;
      }
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t)
      );
      toast.success(newCompleted ? '¡Tarea marcada como completada!' : 'Tarea marcada como pendiente');
    } catch (err) {
      toast.error('Error inesperado al actualizar tarea');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttachment = async (taskId: string, attachment: Attachment) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('attachments')
        .insert({
          task_id: taskId,
          type: attachment.type,
          name: attachment.name,
          storage_path: attachment.url,
          transcription: attachment.transcription ?? ''
        });

      if (error) {
        toast.error('Error al subir attachment');
        return false;
      }
      toast.success('Archivo adjunto registrado correctamente');
      // No cargamos inmediatamente el attachment real, pero puedes recargar tareas si lo deseas
      // fetchTasks();
      return true;
    } catch (err) {
      toast.error('Error inesperado subiendo archivo');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        toast.error('No se pudo eliminar la tarea');
        return false;
      }
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Tarea eliminada correctamente');
      return true;
    } catch (err) {
      toast.error('Error inesperado al eliminar tarea');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
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
    refetch: fetchTasks,
  };
};

