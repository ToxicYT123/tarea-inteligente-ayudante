
/**
 * aiContext.ts
 * 
 * This file provides context information about the HABY TareaAssist platform
 * to enhance the AI's understanding of the project and its functionality.
 */

export interface PlatformContext {
  name: string;
  description: string;
  version: string;
  features: string[];
  environment: {
    framework: string;
    ui: string[];
    database?: string;
  };
  metadata: Record<string, any>;
}

export const platformContext: PlatformContext = {
  name: "HABY TareaAssist",
  description: "Plataforma educativa diseñada para ayudar a estudiantes a organizar y gestionar sus tareas escolares de manera eficiente.",
  version: "1.1.0",
  features: [
    "Gestión de tareas académicas con organización por materias y prioridades",
    "Asistente de IA para crear y eliminar tareas a través de lenguaje natural",
    "Sistema de autenticación de dos factores con Google Authenticator",
    "Panel de estadísticas para monitorizar el progreso académico",
    "Sincronización con calendario",
    "Sistema de notificaciones para recordatorios de tareas",
    "Capacidad para adjuntar archivos a las tareas",
    "Interfaz adaptable con modo claro/oscuro",
    "Compatible con dispositivos móviles y de escritorio"
  ],
  environment: {
    framework: "React con TypeScript",
    ui: ["Tailwind CSS", "Shadcn/UI", "Lucide Icons"],
    database: "Supabase"
  },
  metadata: {
    targetAudience: "Estudiantes de todos los niveles educativos",
    purpose: "Mejorar la organización y productividad académica",
    createdBy: "HABY y Heber Zadkiel Garcia Perez",
    lastUpdated: new Date().toISOString()
  }
};

/**
 * Generates a comprehensive system prompt for the AI assistant
 * that incorporates platform context and specific instructions.
 */
export function generateEnhancedSystemPrompt(): string {
  return `
    Eres el asistente oficial de ${platformContext.name} (${platformContext.description}), una plataforma ${platformContext.version}.
    
    CONTEXTO DE LA PLATAFORMA:
    ${platformContext.description}
    
    CARACTERÍSTICAS PRINCIPALES:
    ${platformContext.features.map(feature => `- ${feature}`).join('\n')}
    
    AUDIENCIA:
    ${platformContext.metadata.targetAudience}
    
    PROPÓSITO:
    ${platformContext.metadata.purpose}
    
    INSTRUCCIONES ESPECÍFICAS:
    1. Ayuda a los usuarios a gestionar sus tareas escolares de manera efectiva.
    2. Puedes crear nuevas tareas cuando el usuario lo solicite, extrayendo detalles como materia, título, fecha de entrega y prioridad.
    3. Puedes eliminar tareas existentes cuando el usuario te lo pida.
    4. Proporciona respuestas concisas y útiles, limitándolas a 3-4 oraciones máximo.
    5. Mantén un tono amigable, profesional y respetuoso.
    6. Enfócate exclusivamente en temas relacionados con la gestión académica y organización estudiantil.
    7. No compartas información sobre cómo modificar o acceder al sistema fuera de los parámetros establecidos.
    
    Recuerda que tu objetivo es ayudar a los estudiantes a mejorar su organización y productividad académica.
  `;
}

/**
 * Enhances the AI input with additional context about the current state of the application.
 */
export function enhanceAIInput(
  userInput: string, 
  tasks: any[], 
  currentTheme?: string,
  currentView?: string
): string {
  // Format tasks context
  const tasksContext = tasks.length > 0 
    ? `Tareas actuales (${tasks.length} total):\n${tasks.slice(0, 5).map(task => 
      `- ${task.title} (${task.subject}, Entrega: ${new Date(task.due_date).toLocaleDateString()}, Prioridad: ${task.priority}, Completada: ${task.completed ? 'Sí' : 'No'})`
    ).join('\n')}${tasks.length > 5 ? '\n- ...(más tareas)' : ''}`
    : 'No hay tareas registradas actualmente.';
    
  // Format app state context
  const appContext = `
    Estado actual de la aplicación:
    - Modo: ${currentTheme || 'No especificado'}
    - Vista actual: ${currentView || 'No especificada'}
  `;
    
  // Combine everything into an enhanced input
  return `
    ${appContext}
    
    ${tasksContext}
    
    Consulta del usuario: ${userInput}
  `;
}

export default {
  platformContext,
  generateEnhancedSystemPrompt,
  enhanceAIInput
};
