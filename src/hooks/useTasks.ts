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

  // Para ver los logs y depurar desde la consola del navegador.
  const debug = (msg: any, ...args: any[]) => {
    console.log("[useTasks]", msg, ...args);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    debug("Cargando tareas...");
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        debug('Error al cargar', error);
        setError('Error al cargar las tareas');
        setTasks([]);
        toast.error('No se pudo cargar las tareas');
        return;
      }
      debug('Tareas obtenidas:', data);
      setTasks((data || []).map((task: any) => ({
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
      })));
      toast.success('Tareas actualizadas', { duration: 1300 });
    } catch (err: any) {
      debug("Error inesperado al cargar tareas", err);
      setError('Error inesperado');
      setTasks([]);
      toast.error('Error inesperado al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task: Task) => {
    setLoading(true);
    debug("Agregando tarea...", task);
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
        debug('Error al agregar tarea', error);
        toast.error('No se pudo agregar la tarea');
        return false;
      }
      debug('Tarea agregada:', data);
      setTasks(prev => [...prev, {
        id: data.id,
        subject: data.subject,
        title: data.title,
        description: data.description || '',
        due_date: data.due_date,
        created_at: data.created_at,
        completed: data.completed ?? false,
        attachments: [],
        priority: data.priority as 'low' | 'medium' | 'high',
        academic_context_id: data.academic_context_id,
        assignment_type: data.assignment_type,
        updated_at: data.updated_at,
      }]);
      toast.success('Tarea agregada correctamente');
      return true;
    } catch (err: any) {
      debug("Error inesperado al agregar tarea", err);
      toast.error('Error inesperado al agregar la tarea');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    debug("Toggle complete", taskId);
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
        debug('Error al cambiar estado', error);
        toast.error('No se pudo actualizar el estado');
        return;
      }
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t)
      );
      toast.success(newCompleted ? '¡Tarea marcada como completada!' : 'Tarea marcada como pendiente');
    } catch (err) {
      debug("Error inesperado al marcar tarea", err);
      toast.error('Error inesperado al actualizar tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttachment = async (taskId: string, attachment: Attachment) => {
    setLoading(true);
    debug("Adjuntando archivo a tarea:", taskId, attachment);
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
        debug("Error al subir attachment", error);
        toast.error('Error al subir attachment');
        return false;
      }
      toast.success('Archivo adjunto registrado correctamente');
      // Puedes recargar tareas si quieres verlo reflejado
      fetchTasks();
      return true;
    } catch (err) {
      debug("Error adjuntando archivo", err);
      toast.error('Error inesperado subiendo archivo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setLoading(true);
    debug("Eliminando tarea", taskId);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        debug("Error al eliminar tarea", error);
        toast.error('No se pudo eliminar la tarea');
        return false;
      }
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Tarea eliminada correctamente');
      return true;
    } catch (err) {
      debug("Error inesperado al eliminar tarea", err);
      toast.error('Error inesperado al eliminar tarea');
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
