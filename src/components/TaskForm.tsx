import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateId } from '@/utils/taskUtils';
import { Task } from '@/types';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/components/ui/sonner";

interface TaskFormProps {
  onAddTask: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !title.trim() || !dueDate) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }
    
    const newTask: Task = {
      id: generateId(),
      subject: subject.trim(),
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate.toISOString(),
      created_at: new Date().toISOString(),
      completed: false,
      attachments: [],
      priority
    };
    
    onAddTask(newTask);
    
    // Resetear el formulario
    setSubject('');
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setPriority('medium');
    
    toast.success("Tarea agregada correctamente");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-white rounded-lg border shadow-sm">
      <h2 className="text-lg font-medium mb-4">Agregar nueva tarea</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">
            Materia <span className="text-red-500">*</span>
          </label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Nombre de la materia"
            required
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-1">
            Prioridad
          </label>
          <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona la prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Título de la tarea <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué tarea es?"
          required
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripción
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles de la tarea, instrucciones, etc."
          className="w-full min-h-[100px]"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha de entrega <span className="text-red-500">*</span>
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Button type="submit" className="w-full bg-tareaassist-primary hover:bg-tareaassist-secondary">
        Agregar tarea
      </Button>
    </form>
  );
};

export default TaskForm;
