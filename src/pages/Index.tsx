
import React, { useState, useEffect } from 'react';
import { Task, Attachment } from '@/types';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import AIChat from '@/components/AIChat';
import { 
  addTask, 
  getTasks, 
  toggleTaskCompletion, 
  addAttachmentToTask,
  deleteTask
} from '@/utils/taskUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Cargar tareas al inicio
  useEffect(() => {
    const savedTasks = getTasks();
    setTasks(savedTasks);
  }, []);

  // Manejadores de eventos para tareas
  const handleAddTask = (task: Task) => {
    const updatedTasks = addTask(task);
    setTasks(updatedTasks);
  };

  const handleToggleComplete = (taskId: string) => {
    const updatedTasks = toggleTaskCompletion(taskId);
    setTasks(updatedTasks);
  };

  const handleAddAttachment = (taskId: string, attachment: Attachment) => {
    const updatedTasks = addAttachmentToTask(taskId, attachment);
    setTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = deleteTask(taskId);
    setTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-app text-white p-4 sm:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">TareaAssist</h1>
          <p className="text-gray-100 mt-1">Organiza tus tareas escolares de forma fácil y eficiente</p>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="tasks">Mis Tareas</TabsTrigger>
                <TabsTrigger value="add">Agregar Tarea</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks">
                <TaskList
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onAddAttachment={handleAddAttachment}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
              
              <TabsContent value="add">
                <TaskForm onAddTask={handleAddTask} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <AIChat tasks={tasks} />
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 TareaAssist - Tu asistente personal para tareas escolares
        </div>
      </footer>
    </div>
  );
};

export default Index;
