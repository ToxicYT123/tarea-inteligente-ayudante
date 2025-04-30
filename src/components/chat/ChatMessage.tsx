
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from "@/hooks/use-theme";
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'assistant';
  timestamp?: string;
  animate?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, sender, timestamp, animate = false }) => {
  const { theme } = useTheme();
  
  const isUser = sender === 'user';
  
  const formattedTime = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es })
    : '';
  
  const messageClasses = isUser
    ? `flex items-start justify-end mb-4 ${animate ? 'animate-slide-up' : ''}`
    : `flex items-start mb-4 ${animate ? 'animate-slide-up' : ''}`;
    
  const avatarClasses = isUser
    ? 'order-2 ml-2'
    : 'mr-2';
    
  const contentClasses = isUser
    ? `px-4 py-3 rounded-xl max-w-[80%] ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-tareaassist-dark-primary to-tareaassist-dark-secondary text-white'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
      } shadow-md`
    : `px-4 py-3 rounded-xl max-w-[80%] ${
        theme === 'dark' 
          ? 'bg-gray-700 text-gray-100'
          : 'bg-gray-100 text-gray-800'
      } shadow-sm`;

  return (
    <div className={messageClasses}>
      <div className={avatarClasses}>
        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
          isUser 
            ? theme === 'dark' ? 'bg-tareaassist-dark-primary' : 'bg-purple-600' 
            : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>
      </div>
      
      <div className={contentClasses}>
        <div className="whitespace-pre-wrap break-words">{content}</div>
        {timestamp && (
          <div className={`text-xs mt-1 ${
            isUser 
              ? 'text-gray-200/70' 
              : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
