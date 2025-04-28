
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
  dueDate: string;
  createdAt: string;
  completed: boolean;
  attachments: Attachment[];
  priority: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}
