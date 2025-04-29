
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Convierte asteriscos dobles a negritas y asteriscos simples a cursiva
  const formatMarkdown = (text: string) => {
    // Primero, dividimos el texto en líneas para preservar saltos de línea
    const lines = text.split('\n');
    
    const formattedLines = lines.map(line => {
      // Reemplazar **text** con <strong>text</strong>
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Reemplazar *text* con <em>text</em>
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return formatted;
    });
    
    // Unir las líneas de nuevo con <br> para HTML
    return formattedLines.join('<br>');
  };
  
  return (
    <div
      className={`flex ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          message.sender === 'user'
            ? 'bg-tareaassist-primary text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div 
          className="whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
        />
        <div className={`text-[10px] mt-1 ${
          message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
