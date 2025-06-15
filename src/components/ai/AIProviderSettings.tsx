
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AIKeyManager, AI_PROVIDERS, AIProvider } from "@/services/ai";
import AIProviderSelector from './AIProviderSelector';

interface AIProviderSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  setShowApiConfig: (show: boolean) => void;
  setAiKeyVersion: React.Dispatch<React.SetStateAction<number>>;
}

const AIProviderSettings: React.FC<AIProviderSettingsProps> = ({
  open,
  onOpenChange,
  selectedProvider,
  onProviderChange,
  setShowApiConfig,
  setAiKeyVersion,
}) => {
  const handleRemoveApiKey = (provider: AIProvider, e: React.MouseEvent) => {
    e.stopPropagation();
    AIKeyManager.setApiKey(provider, '');
    if (provider === selectedProvider) {
      setShowApiConfig(true);
      setAiKeyVersion((v) => v + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* disparador lo pone el padre */}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración de la IA</DialogTitle>
          <DialogDescription>
            Configura y selecciona el proveedor de IA para el asistente.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="providers">Proveedores</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>
          <TabsContent value="providers" className="space-y-4 py-4">
            <div className="grid gap-4">
              {Object.entries(AI_PROVIDERS).map(([key, value]) => {
                const provider = key as AIProvider;
                const hasApiKey = AIKeyManager.hasApiKey(provider);
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border cursor-pointer ${
                      selectedProvider === provider
                        ? 'bg-purple-50 border-purple-500'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => onProviderChange(provider)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-medium">{value.name}</h3>
                        <p className="text-xs text-muted-foreground">{value.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasApiKey && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={e => handleRemoveApiKey(provider, e)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                        {hasApiKey && <div className="h-2 w-2 bg-green-500 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="config">
            <AIProviderSelector onClose={() => {
              setShowApiConfig(false);
              setAiKeyVersion((v) => v + 1);
            }} />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIProviderSettings;
