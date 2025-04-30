
import React, { useState, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInputForm from './ChatInputForm';
import TypingIndicator from './TypingIndicator';
import { useTheme } from "@/hooks/use-theme";
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatContainerProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  onNewMessage: (message: string) => void;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  isTyping, 
  onNewMessage,
  messagesEndRef 
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-grow overflow-y-auto p-4 space-y-4 ${
        theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
      }`}>
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id || index} 
            content={message.content} 
            sender={message.sender} 
            timestamp={message.timestamp}
            animate={index === messages.length - 1}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <ChatInputForm onSubmit={onNewMessage} isTyping={isTyping} />
      </div>
      
      <style jsx global>{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-dark::-webkit-scrollbar-track {
          background: rgba(30, 30, 30, 0.2);
          border-radius: 4px;
        }
        
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(155, 135, 245, 0.5);
          border-radius: 4px;
        }
        
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 135, 245, 0.7);
        }
        
        .scrollbar-light::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-light::-webkit-scrollbar-track {
          background: rgba(240, 240, 240, 0.5);
          border-radius: 4px;
        }
        
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }
        
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ChatContainer;
