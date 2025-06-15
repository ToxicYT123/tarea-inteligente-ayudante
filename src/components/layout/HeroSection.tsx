
import React from 'react';
import { useTheme } from "@/hooks/use-theme";
import { Sparkles, Target, Brain } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { theme } = useTheme();

  return (
    <section className="text-center py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            theme === 'dark' 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
              : 'bg-purple-100 text-purple-700 border border-purple-200'
          }`}>
            <Sparkles className="w-4 h-4 mr-2" />
            Potenciado por IA Avanzada
          </div>
        </div>
        
        <h1 className={`text-4xl md:text-6xl font-bold leading-tight ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent' 
            : 'bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 bg-clip-text text-transparent'
        }`}>
          Organiza tu vida académica con
          <span className="block">inteligencia artificial</span>
        </h1>
        
        <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          HABY TareaAssist te ayuda a gestionar tus tareas, proyectos y objetivos académicos
          de manera inteligente y eficiente.
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          <div className="flex items-center space-x-3">
            <Target className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className="text-sm font-medium">Gestión Inteligente</span>
          </div>
          <div className="flex items-center space-x-3">
            <Brain className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className="text-sm font-medium">Asistente IA</span>
          </div>
          <div className="flex items-center space-x-3">
            <Sparkles className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className="text-sm font-medium">Análisis Avanzado</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
