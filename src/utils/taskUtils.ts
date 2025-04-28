
import { Task } from "../types";

// Obtener tareas del localStorage
export const getTasks = (): Task[] => {
  const tasksJson = localStorage.getItem('tasks');
  if (!tasksJson) return [];
  
  try {
    return JSON.parse(tasksJson);
  } catch (error) {
    console.error('Error parsing tasks:', error);
    return [];
  }
};

// Guardar tareas en localStorage
export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Agregar una nueva tarea
export const addTask = (task: Task): Task[] => {
  const tasks = getTasks();
  const newTasks = [...tasks, task];
  saveTasks(newTasks);
  return newTasks;
};

// Marcar tarea como completada
export const toggleTaskCompletion = (taskId: string): Task[] => {
  const tasks = getTasks();
  const updatedTasks = tasks.map(task => 
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  saveTasks(updatedTasks);
  return updatedTasks;
};

// Eliminar una tarea
export const deleteTask = (taskId: string): Task[] => {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  saveTasks(updatedTasks);
  return updatedTasks;
};

// Agregar un archivo adjunto a una tarea
export const addAttachmentToTask = (taskId: string, attachment: any): Task[] => {
  const tasks = getTasks();
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return {
        ...task,
        attachments: [...task.attachments, attachment]
      };
    }
    return task;
  });
  saveTasks(updatedTasks);
  return updatedTasks;
};

// Filtrar tareas por fecha de vencimiento (hoy, esta semana, próximamente)
export const filterTasksByDueDate = (filter: 'today' | 'week' | 'upcoming' | 'all'): Task[] => {
  const tasks = getTasks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  
  switch (filter) {
    case 'today':
      return tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    case 'week':
      return tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate > today && dueDate <= endOfWeek;
      });
    case 'upcoming':
      return tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate > endOfWeek;
      });
    case 'all':
    default:
      return tasks;
  }
};

// Ordenar tareas por fecha de vencimiento
export const sortTasksByDueDate = (tasks: Task[], ascending: boolean = true): Task[] => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Generar un ID único
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Formatear fecha para mostrar
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
};

// Verificar si una fecha es hoy
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  return date.getTime() === today.getTime();
};

// Verificar si una fecha está vencida
export const isPastDue = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
};
