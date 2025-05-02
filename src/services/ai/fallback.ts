
import { Task } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { AIKeyManager, AI_PROVIDERS } from '@/services/ai';

// Fallback function when API fails
export function generateFallbackResponse(
  userInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): string {
  const input = userInput.toLowerCase();
  
  // Detect if user wants to create a task
  if (input.includes('crear tarea') || input.includes('nueva tarea') || input.includes('agregar tarea')) {
    const subjects = ['Matemáticas', 'Español', 'Ciencias', 'Historia', 'Inglés', 'Física', 'Química', 'Biología'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    
    // Try to extract information from user message
    let subject = randomSubject;
    let title = 'Tarea';
    let dueDate = new Date();
    let priority = 'medium';
    
    // Extract subject
    for (const possibleSubject of subjects) {
      if (input.includes(possibleSubject.toLowerCase())) {
        subject = possibleSubject;
        break;
      }
    }
    
    // Extract title (what comes after "sobre" or "de")
    const titleMatches = input.match(/(?:sobre|de) ([^,\.]+)/i);
    if (titleMatches && titleMatches[1]) {
      title = titleMatches[1].trim();
    }
    
    // Extract date
    if (input.includes('mañana')) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
    } else if (input.includes('próxima semana') || input.includes('proxima semana')) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
    } else if (input.includes('hoy')) {
      dueDate = new Date();
    }
    
    // Extract priority
    if (input.includes('alta') || input.includes('urgente') || input.includes('importante')) {
      priority = 'high';
    } else if (input.includes('baja') || input.includes('puede esperar')) {
      priority = 'low';
    }
    
    // Create the task
    if (onAddTask) {
      const newTask: Task = {
        id: generateId(),
        subject,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        description: "Tarea creada por asistente AI",
        due_date: dueDate.toISOString(),
        created_at: new Date().toISOString(),
        completed: false,
        attachments: [],
        priority: priority as 'low' | 'medium' | 'high',
        academic_context_id: null,
        assignment_type: 'homework',
        updated_at: new Date().toISOString()
      };
      
      onAddTask(newTask);
      
      return `He creado una nueva tarea de ${subject} sobre "${title}" para entregar el ${dueDate.toLocaleDateString()}. La he configurado con prioridad ${priority === 'high' ? 'alta' : priority === 'medium' ? 'media' : 'baja'}.`;
    }
  }
  
  // Detect if user wants to delete a task
  else if (input.includes('eliminar tarea') || input.includes('borrar tarea') || input.includes('quitar tarea')) {
    const tasksToSearch = [...tasks].filter(task => !task.completed);
    if (tasksToSearch.length === 0) {
      return 'No tienes tareas pendientes para eliminar.';
    }
    
    // Try to find mentioned task
    let foundTask = null;
    
    // Search by title
    for (const task of tasksToSearch) {
      if (input.includes(task.title.toLowerCase())) {
        foundTask = task;
        break;
      }
    }
    
    // If not found by title, search by subject
    if (!foundTask) {
      for (const task of tasksToSearch) {
        if (input.includes(task.subject.toLowerCase())) {
          foundTask = task;
          break;
        }
      }
    }
    
    // If a task is found, delete it
    if (foundTask && onDeleteTask) {
      onDeleteTask(foundTask.id);
      return `He eliminado la tarea "${foundTask.title}" de ${foundTask.subject}.`;
    }
    
    return 'No encontré una tarea específica para eliminar. Por favor, menciona el título o la materia de la tarea que quieres eliminar.';
  }
  
  // Responses to check if API key is not configured
  else if (input.includes('hola') || input.includes('saludos')) {
    if (!AIKeyManager.hasApiKey(AIKeyManager.getSelectedProvider())) {
      return `Hola. Para poder ayudarte mejor, necesito una API key de ${AI_PROVIDERS[AIKeyManager.getSelectedProvider()].name} válida. Por favor, configúrala en la sección de configuración para desbloquear todas mis capacidades como asistente.`;
    }
    return '¡Hola! Soy tu asistente de tareas. Puedo ayudarte a crear o eliminar tareas, o responder preguntas sobre tus tareas existentes.';
  } 
  else if (input.includes('gracias')) {
    return '¡De nada! Estoy aquí para ayudarte con tus tareas escolares. Si necesitas algo más, solo dímelo.';
  }
  else if (input.includes('qué puedes hacer') || input.includes('que puedes hacer')) {
    if (!AIKeyManager.hasApiKey(AIKeyManager.getSelectedProvider())) {
      return `Puedo ayudarte con la gestión de tus tareas escolares, pero actualmente estoy funcionando con capacidades limitadas. Para aprovechar todas mis funciones de IA, necesito una API key de ${AI_PROVIDERS[AIKeyManager.getSelectedProvider()].name} válida. Puedes configurarla en la sección de ajustes.`;
    }
    return 'Puedo ayudarte a gestionar tus tareas escolares. Puedo crear nuevas tareas, eliminar tareas existentes y responder a preguntas sobre tus tareas. Prueba diciendo "crear tarea de matemáticas para mañana" o "eliminar tarea de historia".';
  }
  else if (input.includes('tareas para hoy') || input.includes('tareas de hoy')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate >= today && taskDate <= todayEnd && !task.completed;
    });
    
    if (todayTasks.length === 0) {
      return '¡Buena noticia! No tienes tareas para entregar hoy.';
    }
    
    return `Tienes ${todayTasks.length} tarea(s) para hoy: ${todayTasks.map(t => t.title).join(', ')}.`;
  }
  else {
    if (!AIKeyManager.hasApiKey(AIKeyManager.getSelectedProvider())) {
      return `Para poder responder a esta consulta de manera efectiva, necesito una API key de ${AI_PROVIDERS[AIKeyManager.getSelectedProvider()].name} válida. Por favor, configúrala en la sección de ajustes para desbloquear todas mis capacidades como asistente.`;
    }
    return 'No estoy seguro de cómo ayudarte con eso. Puedo crear o eliminar tareas, o darte información sobre tus tareas existentes. Prueba diciendo "crear tarea" o "qué tareas tengo para hoy".';
  }
}
