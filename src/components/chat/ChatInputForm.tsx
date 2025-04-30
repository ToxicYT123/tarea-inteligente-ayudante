
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputFormProps {
  onSubmit: (message: string) => void;
  isTyping: boolean;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({ onSubmit, isTyping }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // Speech recognition setup
  useEffect(() => {
    let recognition: SpeechRecognition | null = null;
    
    // Check if browser supports speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    }
    
    // Clean up
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!isListening) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.start();
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => (prev + ' ' + transcript).trim());
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        setIsListening(true);
      } catch (error) {
        console.error('Error al iniciar el reconocimiento de voz:', error);
      }
    } else {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error al detener el reconocimiento de voz:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSubmit(input);
    setInput('');
    
    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle Ctrl+Enter or Cmd+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (input.trim()) {
        handleSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <div className="relative flex-grow">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Escuchando..." : "Escribe tu pregunta..."}
          className={`flex-grow pr-10 ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 focus:border-tareaassist-dark-primary focus:ring-tareaassist-dark-primary' 
              : 'focus:ring-purple-500 focus:border-purple-500'
          } ${isListening ? 'animate-pulse' : ''}`}
          disabled={isTyping}
          autoComplete="off"
        />
        {'SpeechRecognition' in window || 'webkitSpeechRecognition' in window ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={toggleListening}
            disabled={isTyping}
          >
            {isListening ? <MicOff size={16} className="text-red-500" /> : <Mic size={16} />}
          </Button>
        ) : null}
      </div>
      
      <Button 
        type="submit" 
        size="sm" 
        disabled={isTyping || !input.trim()}
        className={`${
          theme === 'dark' 
            ? 'bg-tareaassist-dark-primary hover:bg-tareaassist-dark-secondary' 
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white`}
      >
        <Send size={16} className="sm:mr-1" />
        <span className="hidden sm:inline">Enviar</span>
      </Button>
    </form>
  );
};

export default ChatInputForm;
