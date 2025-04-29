
import React, { useState, useRef, useEffect } from 'react';
import { Task, ChatMessage } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateId } from '@/utils/taskUtils';
import { generateAIResponse } from '@/utils/aiUtils';
import ChatMessageComponent from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ChatInputForm from './ChatInputForm';

interface ChatContainerProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onNewMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isTyping,
  onNewMessage,
  messagesEndRef
}) => {
  return (
    <>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <ChatMessageComponent key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <ChatInputForm onSubmit={onNewMessage} isTyping={isTyping} />
      </div>
    </>
  );
};

export default ChatContainer;
