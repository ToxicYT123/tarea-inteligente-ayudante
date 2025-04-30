
import { Task } from '@/types';
import { generateId } from './taskUtils';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateAIResponse(
  userInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not found. Using fallback response.");
      return generateFallbackResponse(userInput, tasks, onAddTask, onDeleteTask);
    }

    // Crear el sistema y el contexto para el mensaje
    const systemPrompt = `
      Eres un asistente de tareas escolares llamado HABY TareaAssist. Ayudas a estudiantes a gestionar sus tareas académicas.
      Puedes crear nuevas tareas y eliminar tareas existentes cuando el usuario te lo pida.
      
      Si el usuario pide crear una tarea, extrae los detalles (materia, título, fecha de entrega, prioridad) y responde confirmando.
      Si el usuario pide eliminar una tarea, busca por título o materia entre las tareas existentes.
      
      Tu tono debe ser amigable, profesional y útil. Limita tus respuestas a 3-4 oraciones máximo.
    `;

    // Obtener contexto de las tareas actuales
    const taskContext = tasks.map(task => 
      `Tarea: ${task.title} (ID: ${task.id}, Materia: ${task.subject}, Fecha: ${new Date(task.due_date).toLocaleDateString()}, Completada: ${task.completed ? 'Sí' : 'No'})`
    ).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Contexto de tareas actuales:\n${taskContext}\n\nConsulta del usuario: ${userInput}` }
        ],
        max_tokens: 250,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Error en la API de OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    // Procesar la respuesta para detectar comandos de creación/eliminación de tareas
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
  
  // Respuestas genéricas para otras consultas
  else if (input.includes('hola') || input.includes('saludos')) {
    return '¡Hola! Soy tu asistente de tareas. Puedo ayudarte a crear o eliminar tareas, o responder preguntas sobre tus tareas existentes.';
  } 
  else if (input.includes('gracias')) {
    return '¡De nada! Estoy aquí para ayudarte con tus tareas escolares. Si necesitas algo más, solo dímelo.';
  }
  else if (input.includes('qué puedes hacer') || input.includes('que puedes hacer')) {
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
