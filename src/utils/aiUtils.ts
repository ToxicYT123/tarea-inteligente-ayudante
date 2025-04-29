
import { Task } from "@/types";
import { formatDate } from "./taskUtils";
import { generateId } from "@/utils/taskUtils";

/**
 * Analiza si el mensaje del usuario es un comando para crear o eliminar una tarea
 */
const isTaskCreationCommand = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return (
    (lowerQuery.includes('crear') || lowerQuery.includes('nueva') || lowerQuery.includes('agregar')) &&
    lowerQuery.includes('tarea')
  );
};

const isTaskDeletionCommand = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return (
    (lowerQuery.includes('borrar') || lowerQuery.includes('eliminar') || lowerQuery.includes('quitar')) &&
    lowerQuery.includes('tarea')
  );
};

/**
 * Extrae los detalles de la tarea del mensaje del usuario
 */
const extractTaskDetails = (query: string): Partial<Task> => {
  const lowerQuery = query.toLowerCase();
  
  // Intentar extraer el título
  let title = "";
  const titleMatch = query.match(/(?:tarea|llamada|titulada)\s+["'](.+?)["']/i);
  if (titleMatch) {
    title = titleMatch[1];
  } else {
    // Tomar el resto del texto después de "crear tarea" como título
    const afterCommand = query.split(/crear\s+tarea\s+|nueva\s+tarea\s+|agregar\s+tarea\s+/i)[1];
    if (afterCommand) {
      title = afterCommand.split('para')[0].trim();
      if (title.endsWith('.')) {
        title = title.substring(0, title.length - 1);
      }
    }
  }

  // Intentar extraer la materia
  let subject = "General";
  const subjectMatches = [
    /(?:materia|asignatura|clase)\s+(?:de\s+)?["']?([^"']+)["']?/i,
    /(?:para|en|de)\s+(?:la\s+)?(?:materia|asignatura|clase)\s+(?:de\s+)?["']?([^"']+)["']?/i
  ];
  
  for (const pattern of subjectMatches) {
    const match = query.match(pattern);
    if (match) {
      subject = match[1].trim();
      if (subject.endsWith('.')) {
        subject = subject.substring(0, subject.length - 1);
      }
      break;
    }
  }

  // Extraer fecha de entrega
  let dueDate = new Date();
  if (lowerQuery.includes('para mañana') || lowerQuery.includes('para manana')) {
    dueDate.setDate(dueDate.getDate() + 1);
  } else if (lowerQuery.includes('próxima semana') || lowerQuery.includes('proxima semana')) {
    dueDate.setDate(dueDate.getDate() + 7);
  } else if (lowerQuery.includes('siguiente semana')) {
    dueDate.setDate(dueDate.getDate() + 7);
  } else {
    // Buscar patrones de fecha como "27 de mayo" o "5 de abril"
    const dateMatch = query.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)/i);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const monthText = dateMatch[2].toLowerCase();
      
      const months: {[key: string]: number} = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
        'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      };
      
      if (months[monthText] !== undefined) {
        dueDate.setMonth(months[monthText]);
        dueDate.setDate(day);
        
        // Si la fecha ya pasó este año, asumir que es para el próximo año
        if (dueDate < new Date()) {
          dueDate.setFullYear(dueDate.getFullYear() + 1);
        }
      }
    }
  }

  // Extraer prioridad
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (lowerQuery.includes('alta prioridad') || lowerQuery.includes('importante') || lowerQuery.includes('urgente')) {
    priority = 'high';
  } else if (lowerQuery.includes('baja prioridad') || lowerQuery.includes('poco importante')) {
    priority = 'low';
  }

  // Extraer descripción
  let description = "";
  const descMatches = [
    /descripción\s*:\s*["'](.+?)["']/i,
    /descripcion\s*:\s*["'](.+?)["']/i,
    /con\s+(?:la\s+)?descripción\s*(?:de\s+)?["'](.+?)["']/i,
    /con\s+(?:la\s+)?descripcion\s*(?:de\s+)?["'](.+?)["']/i,
  ];
  
  for (const pattern of descMatches) {
    const match = query.match(pattern);
    if (match) {
      description = match[1].trim();
      break;
    }
  }

  return {
    title: title || "Nueva tarea",
    subject: subject,
    description: description,
    due_date: dueDate.toISOString(),
    priority: priority,
    completed: false,
    attachments: []
  };
};

/**
 * Crea una nueva tarea basada en el mensaje del usuario
 */
export const createTaskFromQuery = (query: string): Task => {
  const taskDetails = extractTaskDetails(query);
  
  return {
    id: generateId(),
    title: taskDetails.title || "Nueva tarea",
    subject: taskDetails.subject || "General",
    description: taskDetails.description || "",
    due_date: taskDetails.due_date || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority: taskDetails.priority || "medium",
    completed: false,
    attachments: []
  };
};

/**
 * Identifica la tarea a eliminar basada en el mensaje del usuario
 */
export const findTaskToDelete = (query: string, tasks: Task[]): Task | null => {
  const lowerQuery = query.toLowerCase();
  
  // Buscar si el usuario menciona el título exacto de la tarea
  for (const task of tasks) {
    if (lowerQuery.includes(task.title.toLowerCase())) {
      return task;
    }
  }
  
  // Buscar si el usuario menciona la materia y hay solo una tarea de esa materia
  const subjectMatches = [
    /(?:borrar|eliminar|quitar)\s+(?:la\s+)?tarea\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
    /(?:borrar|eliminar|quitar)\s+(?:la\s+)?tarea\s+(?:para|en|de)\s+([a-záéíóúñ\s]+)/i,
  ];
  
  for (const pattern of subjectMatches) {
    const match = query.match(pattern);
    if (match) {
      const subject = match[1].trim();
      const matchingTasks = tasks.filter(t => 
        t.subject.toLowerCase().includes(subject.toLowerCase())
      );
      
      if (matchingTasks.length === 1) {
        return matchingTasks[0];
      }
    }
  }
  
  return null;
};

/**
 * Genera una respuesta de IA basada en la consulta del usuario y tareas disponibles
 */
export const generateAIResponse = (query: string, tasks: Task[], onCreateTask?: (task: Task) => void, onDeleteTask?: (taskId: string) => void): string => {
  const lowerQuery = query.toLowerCase();
  
  // Detectar si el usuario quiere crear una tarea
  if (isTaskCreationCommand(query)) {
    const newTask = createTaskFromQuery(query);
    
    if (onCreateTask) {
      onCreateTask(newTask);
    }
    
    return `¡He creado una nueva tarea!\n\n` +
           `📝 **${newTask.title}**\n` +
           `📚 Materia: ${newTask.subject}\n` +
           `📅 Fecha de entrega: ${formatDate(newTask.due_date)}\n` +
           `🚩 Prioridad: ${newTask.priority === 'high' ? 'Alta' : newTask.priority === 'medium' ? 'Media' : 'Baja'}\n` +
           (newTask.description ? `📋 Descripción: ${newTask.description}\n` : '') +
           `\nLa tarea ha sido agregada a tu lista.`;
  }
  
  // Detectar si el usuario quiere eliminar una tarea
  if (isTaskDeletionCommand(query)) {
    const taskToDelete = findTaskToDelete(query, tasks);
    
    if (taskToDelete && onDeleteTask) {
      onDeleteTask(taskToDelete.id);
      return `He eliminado la tarea "${taskToDelete.title}" de tu lista.`;
    } else {
      return "No pude identificar qué tarea deseas eliminar. Por favor, sé más específico mencionando el título exacto de la tarea o proporciona más detalles.";
    }
  }

  // Resto de la lógica existente para otras consultas
  // Filter pending tasks
  const pendingTasks = tasks.filter(task => !task.completed);
  
  // Tareas para hoy
  if (lowerQuery.includes('hoy') || lowerQuery.includes('para hoy')) {
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
  if (lowerQuery.includes('pendiente') || lowerQuery.includes('por hacer')) {
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
  if (lowerQuery.includes('matemáticas') || lowerQuery.includes('matematicas')) {
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
  if (lowerQuery.includes('semana') || lowerQuery.includes('próxima semana')) {
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
  if (lowerQuery.includes('ayuda') || lowerQuery.includes('cómo')) {
    return "Puedo ayudarte a organizar tus tareas. Pregúntame cosas como:\n\n" +
      "- ¿Qué tareas tengo para hoy?\n" +
      "- ¿Cuántas tareas tengo pendientes?\n" +
      "- ¿Tengo tareas de matemáticas?\n" +
      "- ¿Qué debo entregar la próxima semana?\n" +
      "\nTambién puedes pedirme que cree o elimine tareas:\n" +
      "- Crear una tarea de matemáticas para el viernes\n" +
      "- Agregar tarea 'Estudiar para el examen' en Física\n" +
      "- Eliminar la tarea de historia";
  }
  
  // Saludo
  if (lowerQuery.includes('hola') || lowerQuery.includes('qué tal')) {
    return "¡Hola! Estoy aquí para ayudarte con tus tareas. ¿En qué puedo ayudarte hoy? Puedo crear nuevas tareas o ayudarte a gestionar las existentes.";
  }
  
  // Respuesta por defecto
  return "No estoy seguro de cómo responder a eso. Puedes preguntarme sobre tus tareas o pedirme que cree una nueva tarea diciendo algo como 'crea una tarea de matemáticas para mañana'.";
};
