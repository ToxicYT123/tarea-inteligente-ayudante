
import { MoonIcon, SunIcon, Settings } from "lucide-react";
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
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');

  const handleSaveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    // Set the env variable at runtime
    (window as any).VITE_OPENAI_API_KEY = apiKey;
    setSettingsOpen(false);
  };

  return (
    <header className={`${theme === 'dark' ? 'bg-gradient-app-dark' : 'bg-gradient-app'} text-white p-4 sm:p-6 transition-all duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 relative overflow-hidden rounded-full border-2 border-white/40">
            <img 
              src="/haby-logo.png" 
              alt="HABY" 
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">HABY TareaAssist</h1>
            <p className="text-gray-100 mt-1 text-sm sm:text-base">Organiza tus tareas escolares de forma fácil y eficiente</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/80"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Configuración</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                Configurar API de OpenAI
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de API de OpenAI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Ingresa tu API Key de OpenAI para activar la funcionalidad avanzada de IA.
            </p>
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Tu API Key se guarda localmente en tu navegador y no se comparte con terceros.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveApiKey}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
