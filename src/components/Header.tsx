
import { MoonIcon, SunIcon, Settings, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "@/components/ui/sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AI_PROVIDERS, AIProvider, AIKeyManager, validateApiKey } from '@/services/aiService';
import AIProviderSelector from './ai/AIProviderSelector';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("openai");

  const hasAnyApiKey = Object.keys(AI_PROVIDERS).some(
    provider => AIKeyManager.hasApiKey(provider as AIProvider)
  );

  return (
    <header className={`${theme === 'dark' ? 'bg-gradient-app-dark' : 'bg-gradient-app'} text-white p-4 sm:p-6 transition-all duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 relative overflow-hidden rounded-full border-2 border-white/40 shadow-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <img 
              src="/lovable-uploads/d275e889-b2ce-4a01-a319-169c5b36b43e.png" 
              alt="HABY" 
              className="h-10 w-10 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
                console.error('Error cargando el logo, usando placeholder');
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-shadow">
              HABY TareaAssist
            </h1>
            <p className="text-gray-100 mt-1 text-sm sm:text-base leading-tight">
              Organiza tus tareas escolares de forma fácil y eficiente
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/80 relative"
              >
                <Settings className="h-5 w-5" />
                {hasAnyApiKey && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Configuración</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <div className="flex items-center">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Configurar proveedores de IA
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700 max-w-lg' : 'max-w-lg'}>
          <DialogHeader>
            <DialogTitle>Configuración de Proveedores IA</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="openai" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className={`grid w-full grid-cols-${Object.keys(AI_PROVIDERS).length}`}>
              {Object.entries(AI_PROVIDERS).map(([key, value]) => (
                <TabsTrigger key={key} value={key} className="relative">
                  {value.name}
                  {AIKeyManager.hasApiKey(key as AIProvider) && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"></span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(AI_PROVIDERS).map(([key, value]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <AIProviderSelector />
              </TabsContent>
            ))}
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
