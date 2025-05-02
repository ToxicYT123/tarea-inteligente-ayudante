
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
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { validateApiKey } from "@/utils/aiUtils";
import { toast } from "@/components/ui/sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'none' | 'valid' | 'invalid' | 'checking'>('none');

  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Por favor, ingresa una API Key');
      return;
    }
    
    setIsValidatingKey(true);
    setKeyValidationStatus('checking');
    
    try {
      const isValid = await validateApiKey(apiKey.trim());
      
      if (isValid) {
        setKeyValidationStatus('valid');
        toast.success('API Key válida');
      } else {
        setKeyValidationStatus('invalid');
        toast.error('API Key inválida o error de conexión');
      }
    } catch (error) {
      console.error('Error validando la API Key:', error);
      setKeyValidationStatus('invalid');
      toast.error('Error al validar la API Key');
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim() && keyValidationStatus !== 'invalid') {
      localStorage.setItem('openai_api_key', apiKey);
      // Set the env variable at runtime
      (window as any).VITE_OPENAI_API_KEY = apiKey;
      setSettingsOpen(false);
      toast.success('API Key guardada correctamente');
    } else if (keyValidationStatus === 'invalid') {
      toast.error('No se puede guardar una API Key inválida');
    }
  };

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
                {localStorage.getItem('openai_api_key') && (
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
                  Configurar API de OpenAI
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
        <DialogContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle>Configuración de API de OpenAI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Ingresa tu API Key de OpenAI para activar la funcionalidad avanzada de IA.
            </p>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setKeyValidationStatus('none');
                  }}
                  className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''} ${
                    keyValidationStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
                    keyValidationStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {keyValidationStatus === 'valid' && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {keyValidationStatus === 'invalid' && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleValidateApiKey}
                disabled={!apiKey.trim() || isValidatingKey}
                className="w-full"
              >
                {isValidatingKey ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : "Verificar API Key"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tu API Key se guarda localmente en tu navegador y no se comparte con terceros.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveApiKey} 
              disabled={!apiKey.trim() || keyValidationStatus === 'invalid' || isValidatingKey}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
