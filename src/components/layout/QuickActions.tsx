
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { Plus, Calendar, BarChart3, Settings } from 'lucide-react';
import { Task } from '@/types';
import TaskForm from '@/components/TaskForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QuickActionsProps {
  onAddTask: (task: Task) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAddTask }) => {
  const { theme } = useTheme();
  const [showTaskForm, setShowTaskForm] = useState(false);

  const actions = [
    {
      title: 'Nueva Tarea',
      description: 'Crea una nueva tarea académica',
      icon: Plus,
      color: theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600',
      action: () => setShowTaskForm(true)
    },
    {
      title: 'Calendario',
      description: 'Ver tareas por fecha',
      icon: Calendar,
      color: theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
      action: () => console.log('Calendar view')
    },
    {
      title: 'Estadísticas',
      description: 'Analizar tu progreso',
      icon: BarChart3,
      color: theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
      action: () => console.log('Stats view')
    },
    {
      title: 'Configuración',
      description: 'Ajustar preferencias',
      icon: Settings,
      color: theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600',
      action: () => console.log('Settings')
    }
  ];

  return (
    <>
      <Card className={`${
        theme === 'dark' 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-24 flex-col space-y-2 ${action.color} text-white border-0 transition-all duration-300 hover:scale-105`}
                onClick={action.action}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Tarea</DialogTitle>
            <DialogDescription>
              Completa la información para crear una nueva tarea académica
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            onAddTask={(task) => {
              onAddTask(task);
              setShowTaskForm(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;
