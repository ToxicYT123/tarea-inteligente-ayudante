
import { Task } from '@/types';
import { generateId } from '@/utils/taskUtils';
import { enhanceAIInput, generateEnhancedSystemPrompt } from '@/utils/aiContext';

// Definición de tipos para los proveedores de IA
export type AIProvider = 'openai' | 'edenai' | 'aimlapi';

// Configuración para cada proveedor
interface AIProviderConfig {
  name: string;
  apiUrl: string;
  requiresApiKey: boolean;
  defaultModel: string;
  description: string;
  available: boolean;
}

// Configuraciones de los proveedores
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    description: 'Proveedor de IA original con modelos GPT',
    available: true
  },
  edenai: {
    name: 'Eden AI',
    apiUrl: 'https://api.edenai.run/v2/text/chat',
    requiresApiKey: true,
    defaultModel: 'openai/gpt-4o-mini',
    description: 'Plataforma unificada con acceso a múltiples APIs de IA',
    available: true
  },
  aimlapi: {
    name: 'AIMLAPI',
    apiUrl: 'https://api.aimlapi.com/chat/completions',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    description: 'Acceso a más de 200 modelos de IA con una sola API',
    available: true
  }
};

// Clase para gestionar las claves API
export class AIKeyManager {
  private static readonly STORAGE_PREFIX = 'ai_key_';
  private static readonly HISTORY_PREFIX = 'ai_key_history_';
  private static readonly SELECTED_PROVIDER_KEY = 'selected_ai_provider';
  
  // Obtener la clave API para un proveedor específico
  static getApiKey(provider: AIProvider): string {
    return localStorage.getItem(`${this.STORAGE_PREFIX}${provider}`) || '';
  }
  
  // Establecer la clave API para un proveedor
  static setApiKey(provider: AIProvider, apiKey: string): void {
    localStorage.setItem(`${this.STORAGE_PREFIX}${provider}`, apiKey);
    this.addApiKeyToHistory(provider, apiKey);
  }
  
  // Verificar si existe una clave API para el proveedor
  static hasApiKey(provider: AIProvider): boolean {
    return !!this.getApiKey(provider);
  }
  
  // Agregar clave API al historial
  static addApiKeyToHistory(provider: AIProvider, apiKey: string): void {
    if (!apiKey) return;
    
    try {
      const historyKey = `${this.HISTORY_PREFIX}${provider}`;
      const history = this.getApiKeyHistory(provider);
      
      // Evitar duplicados
      if (!history.includes(apiKey)) {
        history.unshift(apiKey); // Añadir al principio
        
        // Limitar a 5 claves en el historial
        const limitedHistory = history.slice(0, 5);
        
        // Guardar en localStorage
        localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
      }
    } catch (e) {
      console.error(`Error al guardar el historial de API keys para ${provider}:`, e);
    }
  }
  
  // Obtener historial de claves API
  static getApiKeyHistory(provider: AIProvider): string[] {
    try {
      const historyKey = `${this.HISTORY_PREFIX}${provider}`;
      const history = localStorage.getItem(historyKey);
      return history ? JSON.parse(history) : [];
    } catch (e) {
      console.error(`Error al obtener el historial de API keys para ${provider}:`, e);
      return [];
    }
  }
  
  // Eliminar una clave del historial
  static removeApiKeyFromHistory(provider: AIProvider, apiKey: string): void {
    try {
      const historyKey = `${this.HISTORY_PREFIX}${provider}`;
      const history = this.getApiKeyHistory(provider);
      const filteredHistory = history.filter(key => key !== apiKey);
      localStorage.setItem(historyKey, JSON.stringify(filteredHistory));
    } catch (e) {
      console.error(`Error al eliminar clave API del historial para ${provider}:`, e);
    }
  }
  
  // Obtener el proveedor seleccionado
  static getSelectedProvider(): AIProvider {
    return (localStorage.getItem(this.SELECTED_PROVIDER_KEY) as AIProvider) || 'openai';
  }
  
  // Establecer el proveedor seleccionado
  static setSelectedProvider(provider: AIProvider): void {
    localStorage.setItem(this.SELECTED_PROVIDER_KEY, provider);
  }
}

// Función para validar una clave API con el proveedor correspondiente
export async function validateApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  try {
    if (!apiKey.trim()) return false;
    
    switch (provider) {
      case 'openai':
        return await validateOpenAIKey(apiKey);
      case 'edenai':
        return await validateEdenAIKey(apiKey);
      case 'aimlapi':
        return await validateAIMLAPIKey(apiKey);
      default:
        console.error('Proveedor de IA no compatible:', provider);
        return false;
    }
  } catch (error) {
    console.error(`Error validando API key para ${provider}:`, error);
    return false;
  }
}

// Validar clave de OpenAI
async function validateOpenAIKey(apiKey: string): Promise<boolean> {
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
    console.error("Error validando API key de OpenAI:", error);
    return false;
  }
}

// Validar clave de Eden AI
async function validateEdenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.edenai.run/v2/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Error validando API key de Eden AI:", error);
    return false;
  }
}

// Validar clave de AIMLAPI
async function validateAIMLAPIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.aimlapi.com/models', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Error validando API key de AIMLAPI:", error);
    return false;
  }
}

// Generar respuesta utilizando el proveedor especificado
export async function generateAIResponse(
  userInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void,
  provider?: AIProvider
): Promise<string> {
  // Obtener el proveedor actual o usar el especificado
  const currentProvider = provider || AIKeyManager.getSelectedProvider();
  const apiKey = AIKeyManager.getApiKey(currentProvider);
  
  if (!apiKey) {
    console.error(`API key no encontrada para ${currentProvider}. Usando respuesta de respaldo.`);
    return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
  }

  try {
    // Obtener el prompt del sistema mejorado
    const systemPrompt = generateEnhancedSystemPrompt();
    
    // Obtener la entrada de usuario mejorada con contexto
    const enhancedInput = enhanceAIInput(
      userInput,
      tasks,
      document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
    );

    // Mostrar al usuario que estamos procesando su consulta
    console.log(`Enviando consulta a ${AI_PROVIDERS[currentProvider].name}...`);

    // Usar la función específica para el proveedor
    switch (currentProvider) {
      case 'openai':
        return await generateOpenAIResponse(apiKey, systemPrompt, enhancedInput, tasks, onAddTask, onDeleteTask);
      case 'edenai':
        return await generateEdenAIResponse(apiKey, systemPrompt, enhancedInput, tasks, onAddTask, onDeleteTask);
      case 'aimlapi':
        return await generateAIMLAPIResponse(apiKey, systemPrompt, enhancedInput, tasks, onAddTask, onDeleteTask);
      default:
        return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
    }
  } catch (error) {
    console.error(`Error al generar respuesta de IA con ${currentProvider}:`, error);
    return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
  }
}

// Generar respuesta usando OpenAI
async function generateOpenAIResponse(
  apiKey: string,
  systemPrompt: string,
  enhancedInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: AI_PROVIDERS.openai.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: enhancedInput }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error en la API de OpenAI (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const aiMessage = data.choices[0].message.content;
  
  // Procesar la respuesta para detectar comandos
  processAICommandsFromMessage(aiMessage, enhancedInput, tasks, onAddTask, onDeleteTask);
  
  return aiMessage;
}

// Generar respuesta usando Eden AI
async function generateEdenAIResponse(
  apiKey: string,
  systemPrompt: string,
  enhancedInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): Promise<string> {
  const response = await fetch('https://api.edenai.run/v2/text/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      providers: "openai",
      text: enhancedInput,
      settings: {
        openai: {
          model: AI_PROVIDERS.edenai.defaultModel.split('/')[1],
          temperature: 0.7,
          max_tokens: 500,
        }
      },
      conversation: [
        { role: "system", message: systemPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error en la API de Eden AI (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const aiMessage = data.openai.generated_text || data.openai.message || "Lo siento, no pude procesar tu consulta.";
  
  // Procesar la respuesta para detectar comandos
  processAICommandsFromMessage(aiMessage, enhancedInput, tasks, onAddTask, onDeleteTask);
  
  return aiMessage;
}

// Generar respuesta usando AIMLAPI
async function generateAIMLAPIResponse(
  apiKey: string,
  systemPrompt: string,
  enhancedInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): Promise<string> {
  const response = await fetch('https://api.aimlapi.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      model: AI_PROVIDERS.aimlapi.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: enhancedInput }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error en la API de AIMLAPI (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const aiMessage = data.choices[0].message.content;
  
  // Procesar la respuesta para detectar comandos
  processAICommandsFromMessage(aiMessage, enhancedInput, tasks, onAddTask, onDeleteTask);
  
  return aiMessage;
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

export default {
  generateAIResponse,
  validateApiKey,
  AIKeyManager,
  AI_PROVIDERS
};
