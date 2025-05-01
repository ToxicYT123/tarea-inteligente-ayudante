import { Task } from '@/types';
import { generateId } from './taskUtils';
import { generateEnhancedSystemPrompt, enhanceAIInput } from './aiContext';

// Variable para almacenar la API key
let OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Función para establecer la API key
export function setOpenAIApiKey(apiKey: string): void {
  OPENAI_API_KEY = apiKey;
  localStorage.setItem('openai_api_key', apiKey);
}

// Función para obtener la API key almacenada
export function getOpenAIApiKey(): string {
  return localStorage.getItem('openai_api_key') || OPENAI_API_KEY || '';
}

// Función para guardar la API key en el historial
export function saveApiKeyToHistory(apiKey: string): void {
  if (!apiKey) return;
  
  const history = getApiKeyHistory();
  
  // Evitar duplicados
  if (!history.includes(apiKey)) {
    history.unshift(apiKey); // Añadir al principio
    
    // Limitar a 5 claves en el historial
    const limitedHistory = history.slice(0, 5);
    
    try {
      // Podríamos implementar algún tipo de cifrado básico aquí
      localStorage.setItem('openai_api_key_history', JSON.stringify(limitedHistory));
    } catch (e) {
      console.error('Error al guardar el historial de API keys:', e);
    }
  }
}

// Función para obtener el historial de API keys
export function getApiKeyHistory(): string[] {
  try {
    const history = localStorage.getItem('openai_api_key_history');
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error('Error al obtener el historial de API keys:', e);
    return [];
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Error validando API key:", error);
    return false;
  }
}

export async function generateAIResponse(
  userInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): Promise<string> {
  try {
    // Obtener API key guardada (la más actualizada)
    const apiKey = getOpenAIApiKey();
    
    if (!apiKey) {
      console.error("OpenAI API key no encontrada. Usando respuesta de respaldo.");
      return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
    }

    // Obtener el prompt del sistema mejorado
    const systemPrompt = generateEnhancedSystemPrompt();
    
    // Obtener la entrada de usuario mejorada con contexto
    const enhancedInput = enhanceAIInput(
      userInput,
      tasks,
      document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
    );

    // Mostrar al usuario que estamos procesando su consulta
    console.log("Enviando consulta a OpenAI...");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Usar gpt-4o-mini para mejores resultados a menor costo
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedInput }
        ],
        max_tokens: 500, // Aumentamos los tokens para respuestas más completas
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error en la API de OpenAI (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    // Guardar que la clave API funciona correctamente
    saveApiKeyToHistory(apiKey);
    
    // Procesar la respuesta para detectar comandos
    processAICommandsFromMessage(aiMessage, userInput, tasks, onAddTask, onDeleteTask);
    
    return aiMessage;
  } catch (error) {
    console.error("Error al generar respuesta de IA:", error);
    return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
  }
}

// Función de respaldo cuando la API falla
function generateFallbackResponse(
  userInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): string {
  const input = userInput.toLowerCase();
  
  // Detectar si el usuario quiere crear una tarea
  if (input.includes('crear tarea') || input.includes('nueva tarea') || input.includes('agregar tarea')) {
    const subjects = ['Matemáticas', 'Español', 'Ciencias', 'Historia', 'Inglés', 'Física', 'Química', 'Biología'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    
    // Intentar extraer información del mensaje del usuario
    let subject = randomSubject;
    let title = 'Tarea';
    let dueDate = new Date();
    let priority = 'medium';
    
    // Extraer materia
    for (const possibleSubject of subjects) {
      if (input.includes(possibleSubject.toLowerCase())) {
        subject = possibleSubject;
        break;
      }
    }
    
    // Extraer título (lo que viene después de "sobre" o "de")
    const titleMatches = input.match(/(?:sobre|de) ([^,\.]+)/i);
    if (titleMatches && titleMatches[1]) {
      title = titleMatches[1].trim();
    }
    
    // Extraer fecha
    if (input.includes('mañana')) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
    } else if (input.includes('próxima semana') || input.includes('proxima semana')) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
    } else if (input.includes('hoy')) {
      dueDate = new Date();
    }
    
    // Extraer prioridad
    if (input.includes('alta') || input.includes('urgente') || input.includes('importante')) {
      priority = 'high';
    } else if (input.includes('baja') || input.includes('puede esperar')) {
      priority = 'low';
    }
    
    // Crear la tarea
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
  
  // Detectar si el usuario quiere eliminar una tarea
  else if (input.includes('eliminar tarea') || input.includes('borrar tarea') || input.includes('quitar tarea')) {
    const tasksToSearch = [...tasks].filter(task => !task.completed);
    if (tasksToSearch.length === 0) {
      return 'No tienes tareas pendientes para eliminar.';
    }
    
    // Intentar encontrar la tarea mencionada
    let foundTask = null;
    
    // Buscar por título
    for (const task of tasksToSearch) {
      if (input.includes(task.title.toLowerCase())) {
        foundTask = task;
        break;
      }
    }
    
    // Si no encuentra por título, buscar por materia
    if (!foundTask) {
      for (const task of tasksToSearch) {
        if (input.includes(task.subject.toLowerCase())) {
          foundTask = task;
          break;
        }
      }
    }
    
    // Si encuentra una tarea, eliminarla
    if (foundTask && onDeleteTask) {
      onDeleteTask(foundTask.id);
      return `He eliminado la tarea "${foundTask.title}" de ${foundTask.subject}.`;
    }
    
    return 'No encontré una tarea específica para eliminar. Por favor, menciona el título o la materia de la tarea que quieres eliminar.';
  }
  
  // Respuestas para verificar si la API key no está configurada
  else if (input.includes('hola') || input.includes('saludos')) {
    if (!getOpenAIApiKey()) {
      return 'Hola. Para poder ayudarte mejor, necesito una API key de OpenAI válida. Por favor, configúrala en la sección de configuración para desbloquear todas mis capacidades como asistente.';
    }
    return '¡Hola! Soy tu asistente de tareas. Puedo ayudarte a crear o eliminar tareas, o responder preguntas sobre tus tareas existentes.';
  } 
  else if (input.includes('gracias')) {
    return '¡De nada! Estoy aquí para ayudarte con tus tareas escolares. Si necesitas algo más, solo dímelo.';
  }
  else if (input.includes('qué puedes hacer') || input.includes('que puedes hacer')) {
    if (!getOpenAIApiKey()) {
      return 'Puedo ayudarte con la gestión de tus tareas escolares, pero actualmente estoy funcionando con capacidades limitadas. Para aprovechar todas mis funciones de IA, necesito una API key de OpenAI válida. Puedes configurarla en la sección de ajustes.';
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
    if (!getOpenAIApiKey()) {
      return 'Para poder responder a esta consulta de manera efectiva, necesito una API key de OpenAI válida. Por favor, configúrala en la sección de ajustes para desbloquear todas mis capacidades como asistente.';
    }
    return 'No estoy seguro de cómo ayudarte con eso. Puedo crear o eliminar tareas, o darte información sobre tus tareas existentes. Prueba diciendo "crear tarea" o "qué tareas tengo para hoy".';
  }
}

// Función para procesar los comandos detectados en la respuesta de la IA
function processAICommandsFromMessage(
  aiMessage: string,
  userInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
) {
  const message = aiMessage.toLowerCase();
  
  // Detectar creación de tarea en la respuesta de la IA
  if ((message.includes('he creado') || message.includes('he agregado') || message.includes('nueva tarea')) && 
      userInput.toLowerCase().includes('tarea') && onAddTask) {
    
    // La IA ya ha indicado que creó una tarea, intentamos extraer detalles
    let subject = 'General';
    let title = 'Tarea';
    let dueDate = new Date();
    let priority = 'medium';
    
    // Extraer materia (después de "de" o "para")
    const subjectMatches = userInput.match(/(?:de|para) ([^\s,\.]+)/i);
    if (subjectMatches && subjectMatches[1]) {
      subject = subjectMatches[1].trim();
      subject = subject.charAt(0).toUpperCase() + subject.slice(1);
    }
    
    // Extraer título (después de "sobre" o antes de "para")
    const titleMatches = userInput.match(/(?:sobre|de) ([^,\.]+?)(?:para|$)/i);
    if (titleMatches && titleMatches[1]) {
      title = titleMatches[1].trim();
    }
    
    // Crear la tarea si parece que la IA ha decidido crearla
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
  }
  
  // Detectar eliminación de tarea en la respuesta de la IA
  if ((message.includes('he eliminado') || message.includes('he borrado') || message.includes('tarea eliminada')) &&
      userInput.toLowerCase().includes('eliminar') && onDeleteTask) {
    
    // Buscar tarea por título en el mensaje del usuario
    const taskToDelete = tasks.find(task => 
      userInput.toLowerCase().includes(task.title.toLowerCase()) ||
      userInput.toLowerCase().includes(task.subject.toLowerCase())
    );
    
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
    }
  }
}
