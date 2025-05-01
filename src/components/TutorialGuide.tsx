
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { ArrowRight, Book } from 'lucide-react';

const steps = [
  {
    title: "Bienvenido a HABY TareaAssist",
    description: "Tu asistente personal para organizar tareas escolares de forma eficiente.",
    content: "HABY TareaAssist te ayuda a mantener el control de tus tareas académicas y usar la inteligencia artificial para incrementar tu productividad."
  },
  {
    title: "Gestión de Tareas",
    description: "Organiza tus tareas por materia, fecha y prioridad.",
    content: "Agrega tareas manualmente desde la pestaña 'Agregar Tarea' o utiliza nuestro asistente de IA para crearlas a través del chat."
  },
  {
    title: "Asistente de IA",
    description: "La IA puede crear tareas por ti.",
    content: "Simplemente escribe en el chat algo como: 'Crear tarea para matemáticas sobre ecuaciones que vence el viernes' y la IA la añadirá automáticamente."
  },
  {
    title: "Filtros y Estadísticas",
    description: "Visualiza y organiza tu información.",
    content: "Utiliza los filtros avanzados para encontrar tareas específicas y consulta tus estadísticas para mejorar tu rendimiento académico."
  },
  {
    title: "Sincronización y Notificaciones",
    description: "Mantente al día con tus tareas.",
    content: "Sincroniza con tu calendario y recibe notificaciones importantes sobre tus próximas tareas."
  }
];

const TutorialGuide = () => {
  const [open, setOpen] = useState(() => {
    // Mostrar el tutorial automáticamente solo la primera vez que el usuario ingresa
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    return !hasSeenTutorial;
  });
  const [currentStep, setCurrentStep] = useState(0);
  const { theme } = useTheme();

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
        size="sm"
      >
        <Book size={16} />
        <span className="hidden sm:inline">Tutorial</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`sm:max-w-[500px] ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}>
          <DialogHeader>
            <DialogTitle className="text-lg">
              {steps[currentStep].title}
            </DialogTitle>
            <DialogDescription>
              {steps[currentStep].description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm">{steps[currentStep].content}</p>
            
            {/* Indicador de pasos */}
            <div className="flex items-center justify-center mt-4 gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    currentStep === index 
                      ? (theme === 'dark' ? 'bg-tareaassist-dark-primary' : 'bg-primary') 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            <Button onClick={nextStep} className={theme === 'dark' ? 'bg-tareaassist-dark-primary hover:bg-tareaassist-dark-secondary' : ''}>
              {currentStep < steps.length - 1 ? (
                <span className="flex items-center">
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              ) : (
                'Comenzar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TutorialGuide;
