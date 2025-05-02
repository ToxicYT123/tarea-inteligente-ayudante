
import { Task } from '@/types';

// Function to process commands detected in AI response
export function processAICommandsFromMessage(
  aiMessage: string,
  userInput: string,
  tasks: Task[],
  onAddTask?: (task: Task) => void,
  onDeleteTask?: (taskId: string) => void
) {
  const message = aiMessage.toLowerCase();
  
  // Detect task creation in AI response
  if ((message.includes('he creado') || message.includes('he agregado') || message.includes('nueva tarea')) && 
      userInput.toLowerCase().includes('tarea') && onAddTask) {
    
    // AI has indicated it created a task, try to extract details
    let subject = 'General';
    let title = 'Tarea';
    let dueDate = new Date();
    let priority = 'medium';
    
    // Extract subject (after "de" or "para")
    const subjectMatches = userInput.match(/(?:de|para) ([^\s,\.]+)/i);
    if (subjectMatches && subjectMatches[1]) {
      subject = subjectMatches[1].trim();
      subject = subject.charAt(0).toUpperCase() + subject.slice(1);
    }
    
    // Extract title (after "sobre" or before "para")
    const titleMatches = userInput.match(/(?:sobre|de) ([^,\.]+?)(?:para|$)/i);
    if (titleMatches && titleMatches[1]) {
      title = titleMatches[1].trim();
    }
    
    // Create task if AI has decided to create one
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
  
  // Detect task deletion in AI response
  if ((message.includes('he eliminado') || message.includes('he borrado') || message.includes('tarea eliminada')) &&
      userInput.toLowerCase().includes('eliminar') && onDeleteTask) {
    
    // Search task by title in user message
    const taskToDelete = tasks.find(task => 
      userInput.toLowerCase().includes(task.title.toLowerCase()) ||
      userInput.toLowerCase().includes(task.subject.toLowerCase())
    );
    
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
    }
  }
}

// Import needed for generateId
import { generateId } from '@/utils/taskUtils';
