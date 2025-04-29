
import React from 'react';
import { ChatMessage } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessageComponent from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ChatInputForm from './ChatInputForm';
import { useTheme } from "@/hooks/use-theme";

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
  const { theme } = useTheme();
  
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
      
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : ''}`}>
        <ChatInputForm onSubmit={onNewMessage} isTyping={isTyping} />
      </div>
    </>
  );
};

export default ChatContainer;
