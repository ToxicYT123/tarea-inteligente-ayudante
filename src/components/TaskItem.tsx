
import React, { useState } from 'react';
import { Task, Attachment } from '@/types';
import { formatDate, isPastDue } from '@/utils/taskUtils';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AudioLines, Check, FileText, Image, VideoIcon, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import FileUpload from './FileUpload';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onAddAttachment: (taskId: string, attachment: Attachment) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onAddAttachment,
  onDeleteTask
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddAttachment = (attachment: Attachment) => {
    onAddAttachment(task.id, attachment);
  };

  const renderAttachmentIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'audio':
        return <AudioLines className="h-4 w-4" />;
      case 'video':
        return <VideoIcon className="h-4 w-4" />;
      case 'document':
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    return (
      <div key={attachment.id} className="mb-2 p-2 bg-gray-50 rounded-md border">
        <div className="flex items-center gap-2 text-sm">
          {renderAttachmentIcon(attachment.type)}
          <span className="font-medium truncate">{attachment.name}</span>
        </div>
        
        {attachment.type === 'image' && (
          <div className="mt-2">
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="max-h-40 rounded-md object-cover" 
            />
          </div>
        )}
        
        {attachment.type === 'audio' && (
          <div className="mt-2">
            <audio controls className="w-full">
              <source src={attachment.url} />
              Tu navegador no soporta el elemento de audio.
            </audio>
            
            {attachment.transcription && (
              <div className="mt-1 text-xs bg-white p-2 rounded border">
                <div className="font-semibold mb-1">Transcripción:</div>
                <p className="text-gray-700">{attachment.transcription}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPriorityBadge = () => {
    let color = '';
    switch (task.priority) {
      case 'high':
        color = 'bg-red-100 text-red-800 border-red-200';
        break;
      case 'medium':
        color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        break;
      case 'low':
        color = 'bg-green-100 text-green-800 border-green-200';
        break;
    }
    
    return (
      <Badge className={`${color} border`}>
        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className={`mb-3 overflow-hidden transition-all duration-200 ${
      task.completed ? 'opacity-75 bg-gray-50' : 
      isPastDue(task.dueDate) ? 'border-red-300 bg-red-50' : ''
    }`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1"
          />
          
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{task.subject}</span>
                  <span>•</span>
                  <span className={isPastDue(task.dueDate) && !task.completed ? 'text-red-500 font-semibold' : ''}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {renderPriorityBadge()}
                
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isOpen ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </div>
        </div>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {task.description && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">Descripción:</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{task.description}</p>
              </div>
            )}
            
            {task.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Adjuntos:</h4>
                <div className="space-y-2">
                  {task.attachments.map(renderAttachment)}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-2 border-t">
              <FileUpload onFileUpload={handleAddAttachment} />
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDeleteTask(task.id)}
              >
                Eliminar
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TaskItem;
