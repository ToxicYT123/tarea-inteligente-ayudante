
import { Task } from "@/types";
import { formatDate } from "./taskUtils";

/**
 * Generates a simulated AI response based on user query and available tasks
 */
export const generateAIResponse = (query: string, tasks: Task[]): string => {
  // Filter pending tasks
  const pendingTasks = tasks.filter(task => !task.completed);
  
  // Tareas para hoy
  if (query.includes('hoy') || query.includes('para hoy')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = pendingTasks.filter(task => {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
    
    if (todayTasks.length === 0) {
      return "No tienes tareas para entregar hoy. ¡Buen trabajo!";
    }
    
    let response = `Tienes ${todayTasks.length} tarea(s) para hoy:\n\n`;
    todayTasks.forEach(task => {
      response += `- ${task.subject}: ${task.title}\n`;
    });
    
    return response;
  }
  
  // Tareas pendientes
  if (query.includes('pendiente') || query.includes('por hacer')) {
    if (pendingTasks.length === 0) {
      return "No tienes tareas pendientes. ¡Estás al día!";
    }
    
    let response = `Tienes ${pendingTasks.length} tarea(s) pendiente(s):\n\n`;
    pendingTasks.forEach(task => {
      response += `- ${task.subject}: ${task.title} (Entrega: ${formatDate(task.due_date)})\n`;
    });
    
    return response;
  }
  
  // Buscar tarea específica
  if (query.includes('matemáticas') || query.includes('matematicas')) {
    const mathTasks = pendingTasks.filter(
      task => task.subject.toLowerCase().includes('matem')
    );
    
    if (mathTasks.length === 0) {
      return "No encuentro tareas pendientes de matemáticas.";
    }
    
    let response = `Encontré ${mathTasks.length} tarea(s) de matemáticas:\n\n`;
    mathTasks.forEach(task => {
      response += `- ${task.title} (Entrega: ${formatDate(task.due_date)})\n`;
      if (task.description) {
        response += `  Descripción: ${task.description}\n`;
      }
    });
    
    return response;
  }
  
  // Buscar por fecha
  if (query.includes('semana') || query.includes('próxima semana')) {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const weekTasks = pendingTasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate > today && dueDate <= nextWeek;
    });
    
    if (weekTasks.length === 0) {
      return "No tienes tareas para la próxima semana.";
    }
    
    let response = `Tienes ${weekTasks.length} tarea(s) para la próxima semana:\n\n`;
    weekTasks.forEach(task => {
      response += `- ${task.subject}: ${task.title} (Entrega: ${formatDate(task.due_date)})\n`;
    });
    
    return response;
  }
  
  // Respuestas generales
  if (query.includes('ayuda') || query.includes('cómo')) {
    return "Puedo ayudarte a organizar tus tareas. Pregúntame cosas como:\n\n" +
      "- ¿Qué tareas tengo para hoy?\n" +
      "- ¿Cuántas tareas tengo pendientes?\n" +
      "- ¿Tengo tareas de matemáticas?\n" +
      "- ¿Qué debo entregar la próxima semana?";
  }
  
  // Saludo
  if (query.includes('hola') || query.includes('qué tal')) {
    return "¡Hola! Estoy aquí para ayudarte con tus tareas. ¿En qué puedo ayudarte hoy?";
  }
  
  // Respuesta por defecto
  return "No estoy seguro de cómo responder a eso. ¿Podrías reformular tu pregunta? Puedes preguntarme sobre tus tareas de hoy, tareas pendientes o tareas de una materia específica.";
};
