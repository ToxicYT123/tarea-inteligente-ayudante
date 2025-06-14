// Utilidad para generar un id único tipo uuid v4 (solo para frontend/offline)
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Formatea una fecha a formato legible (ejemplo: 15 de junio de 2025)
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-MX", {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return "";
  }
}

// Devuelve true si la fecha es hoy
export function isToday(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

// Devuelve true si la fecha ya pasó y no es hoy
export function isPastDue(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0,0,0,0);
  return d < today;
}

// Filtra tareas según el rango de fechas
import type { Task } from '@/types';
export function filterTasksByDueDate(type: "week" | "upcoming", tasks: Task[] = []): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (type === "week") {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + (7 - today.getDay()));
    return tasks.filter(task => {
      const due = new Date(task.due_date);
      due.setHours(0,0,0,0);
      return due >= today && due <= weekEnd && !task.completed;
    });
  } else if (type === "upcoming") {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + (7 - today.getDay()));
    return tasks.filter(task => {
      const due = new Date(task.due_date);
      due.setHours(0,0,0,0);
      return due > weekEnd && !task.completed;
    });
  }
  return [];
}

// Puedes añadir otras utilidades si es necesario.

console.warn("El archivo taskUtils.ts contiene utilidades esenciales para manejo de fechas, ids y filtros.");
