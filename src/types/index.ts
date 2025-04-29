
export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  name: string;
  transcription?: string;
}

export interface Task {
  id: string;
  subject: string;
  title: string;
  description: string;
  due_date: string;  // Changed from dueDate to due_date
  created_at: string;  // Changed from createdAt to created_at
  completed: boolean;
  attachments: Attachment[];
  priority: 'low' | 'medium' | 'high';
  academic_context_id?: string;
  assignment_type?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}
