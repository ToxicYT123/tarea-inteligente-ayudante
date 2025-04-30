
import React, { useState } from 'react';
import { Task } from '@/types';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/utils/taskUtils';
import { toast } from "@/components/ui/sonner";

interface CalendarSyncProps {
  tasks: Task[];
}

const CalendarSync: React.FC<CalendarSyncProps> = ({ tasks }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Función para generar un archivo iCal (.ics)
  const generateICalFile = () => {
    // Encabezado estándar de iCal
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HABY//TareaAssist//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    // Agregar cada tarea como un evento
    tasks.forEach(task => {
      // Convertir fecha de vencimiento a formato UTC para iCal
      const dueDate = new Date(task.due_date);
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}${month}${day}`;
      
      // Crear evento
      icalContent = [
        ...icalContent,
        'BEGIN:VEVENT',
        `UID:${task.id}@tareaassist.haby.com`,
        `SUMMARY:${task.title} - ${task.subject}`,
        `DESCRIPTION:${task.description || 'Sin descripción'}\\n\\nPrioridad: ${task.priority}`,
        `DTSTART;VALUE=DATE:${formattedDate}`,
        `DTEND;VALUE=DATE:${formattedDate}`,
        'END:VEVENT',
      ];
    });

    // Cerrar el calendario
    icalContent.push('END:VCALENDAR');
    
    // Generar el archivo
    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    // Crear un enlace para descarga y activarlo
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tareas_haby.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Archivo de calendario generado", {
      description: "Puedes importarlo en Google Calendar, Outlook o Apple Calendar"
    });
    
    setIsOpen(false);
  };

  // Función para generar un enlace de Google Calendar
  const generateGoogleCalendarLink = (task: Task) => {
    const dueDate = new Date(task.due_date);
    const nextDay = new Date(dueDate);
    nextDay.setDate(dueDate.getDate() + 1);
    
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const details = `${task.description || 'Sin descripción'}\n\nPrioridad: ${task.priority}`;
    
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const query = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${task.title} - ${task.subject}`,
      details,
      dates: `${formatGoogleDate(dueDate)}/${formatGoogleDate(nextDay)}`,
    }).toString();
    
    return `${baseUrl}?${query}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <CalendarIcon size={16} />
          <span className="hidden sm:inline">Calendario</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={`w-80 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}
      >
        <Card className={`border-0 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Sincronizar con Calendario</CardTitle>
            <CardDescription>Exporta tus tareas a tu aplicación de calendario favorita</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Button 
                onClick={generateICalFile}
                className={`w-full ${theme === 'dark' ? 'bg-tareaassist-dark-primary hover:bg-tareaassist-dark-secondary' : ''}`}
              >
                Exportar todas las tareas (.ics)
              </Button>
              
              <p className="text-xs text-muted-foreground mt-2">
                Este archivo es compatible con Google Calendar, Apple Calendar, Outlook y más.
              </p>
              
              {tasks.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Exportar tareas individuales:</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {tasks.filter(task => !task.completed).slice(0, 5).map(task => (
                      <div key={task.id} className="text-xs">
                        <a 
                          href={generateGoogleCalendarLink(task)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`block p-2 rounded border hover:bg-gray-100 ${
                            theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : ''
                          }`}
                        >
                          <div className="font-medium">{task.title}</div>
                          <div className="text-muted-foreground mt-0.5">{formatDate(task.due_date)} - {task.subject}</div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Esta característica exporta tus tareas como eventos de calendario.
            </p>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default CalendarSync;
