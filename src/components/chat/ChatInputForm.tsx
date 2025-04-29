
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputFormProps {
  onSubmit: (message: string) => void;
  isTyping: boolean;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({ onSubmit, isTyping }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSubmit(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe tu pregunta..."
        className="flex-grow"
      />
      <Button type="submit" size="sm" disabled={isTyping}>
        Enviar
      </Button>
    </form>
  );
};

export default ChatInputForm;
