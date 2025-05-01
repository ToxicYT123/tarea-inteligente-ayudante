
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TwoFactorAuth from './TwoFactorAuth';
import { QrCode, KeyRound, ShieldCheck } from 'lucide-react';

const CORRECT_CODE = "B4$w7K&1zP!X";
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

interface AccessCodeProps {
  onAccess: () => void;
}

const AccessCode: React.FC<AccessCodeProps> = ({ onAccess }) => {
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem("accessAttempts");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [blocked, setBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState<number | null>(null);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => {
    return localStorage.getItem("2fa_enabled") === "true";
  });
  const [is2FAVerified, setIs2FAVerified] = useState(() => {
    return localStorage.getItem("2fa_verified") === "true";
  });
  const [authMethod, setAuthMethod] = useState<'code' | '2fa'>(
    is2FAEnabled && is2FAVerified ? '2fa' : 'code'
  );
  const [otpValue, setOtpValue] = useState("");
  
  useEffect(() => {
    // Verificar si hay un bloqueo en localStorage
    const blockUntil = localStorage.getItem("blockUntil");
    if (blockUntil) {
      const blockTime = parseInt(blockUntil, 10);
      const now = Date.now();
      
      if (blockTime > now) {
        // Todavía estamos bloqueados
        setBlocked(true);
        setBlockTimeLeft(blockTime - now);
        
        // Establecer un intervalo para actualizar el contador
        const interval = setInterval(() => {
          const currentBlockUntil = localStorage.getItem("blockUntil");
          if (!currentBlockUntil) {
            clearInterval(interval);
            setBlocked(false);
            return;
          }
          
          const blockTimeValue = parseInt(currentBlockUntil, 10);
          const currentTime = Date.now();
          const timeLeft = blockTimeValue - currentTime;
          
          if (timeLeft <= 0) {
            clearInterval(interval);
            localStorage.removeItem("blockUntil");
            localStorage.removeItem("accessAttempts");
            setBlocked(false);
            setAttempts(0);
          } else {
            setBlockTimeLeft(timeLeft);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        // El bloqueo ha expirado
        localStorage.removeItem("blockUntil");
        localStorage.removeItem("accessAttempts");
        setAttempts(0);
      }
    }
  }, []);
  
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (blocked) return;
    
    if (code === CORRECT_CODE) {
      toast.success("Código correcto. Acceso concedido.");
      localStorage.removeItem("accessAttempts");
      
      if (!is2FAEnabled || !is2FAVerified) {
        // Si 2FA no está configurado todavía, mostrar la pantalla de configuración
        setShowTwoFactorSetup(true);
      } else {
        onAccess();
      }
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("accessAttempts", newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const blockUntilTime = Date.now() + BLOCK_TIME;
        localStorage.setItem("blockUntil", blockUntilTime.toString());
        setBlocked(true);
        setBlockTimeLeft(BLOCK_TIME);
        toast.error(`Se ha excedido el número máximo de intentos. Acceso bloqueado por 24 horas.`);
      } else {
        toast.error(`Código incorrecto. Intento ${newAttempts} de ${MAX_ATTEMPTS}`);
      }
    }
    
    setCode("");
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // En una implementación real, esto validaría el OTP contra la clave secreta
    // Para esta demo, aceptamos cualquier código de 6 dígitos
    if (otpValue.length === 6) {
      toast.success("Código de verificación válido. Acceso concedido.");
      onAccess();
    } else {
      toast.error("Código inválido. Debe tener 6 dígitos.");
    }
    
    setOtpValue("");
  };

  const handleTwoFactorVerified = () => {
    setShowTwoFactorSetup(false);
    setIs2FAEnabled(true);
    setIs2FAVerified(true);
    onAccess();
  };
  
  // Función para formatear el tiempo restante
  const formatTimeLeft = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (showTwoFactorSetup) {
    return (
      <TwoFactorAuth 
        onVerify={handleTwoFactorVerified} 
        onCancel={() => {
          // Si el usuario cancela la configuración de 2FA, aún así le permitimos acceder
          setShowTwoFactorSetup(false);
          onAccess();
        }} 
      />
    );
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border">
        <div className="text-center">
          <h2 className="text-2xl font-bold">HABY TareaAssist</h2>
          <p className="text-muted-foreground">
            Por favor, autentícate para continuar.
          </p>
        </div>
        
        {blocked ? (
          <div className="text-center space-y-2">
            <p className="text-destructive font-semibold">Acceso bloqueado</p>
            {blockTimeLeft && (
              <p className="text-muted-foreground">
                Inténtalo de nuevo en: {formatTimeLeft(blockTimeLeft)}
              </p>
            )}
          </div>
        ) : (
          <Tabs 
            value={authMethod} 
            onValueChange={(val: string) => setAuthMethod(val as 'code' | '2fa')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="code" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span>Código de Acceso</span>
              </TabsTrigger>
              <TabsTrigger value="2fa" className="flex items-center gap-2" disabled={!is2FAEnabled || !is2FAVerified}>
                <ShieldCheck className="h-4 w-4" />
                <span>Autenticador</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="space-y-4">
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Ingresa el código de acceso"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoFocus
                    className="text-center"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Intento {attempts} de {MAX_ATTEMPTS}
                  </p>
                </div>
                
                <Button type="submit" className="w-full">
                  Acceder
                </Button>
              </form>
              
              {is2FAEnabled && is2FAVerified && (
                <p className="text-xs text-muted-foreground text-center">
                  Si prefieres, puedes usar la aplicación Google Authenticator
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="2fa" className="space-y-4">
              {is2FAEnabled && is2FAVerified ? (
                <form onSubmit={handle2FASubmit} className="space-y-4">
                  <div className="text-center space-y-4">
                    <p className="text-sm">
                      Abre la aplicación Google Authenticator y introduce el código de verificación.
                    </p>
                    <InputOTP 
                      maxLength={6} 
                      value={otpValue} 
                      onChange={setOtpValue}
                      className="w-full flex justify-center"
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    <Button type="submit" className="w-full" disabled={otpValue.length !== 6}>
                      Verificar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center p-4 space-y-4">
                  <QrCode className="mx-auto h-16 w-16 text-primary" />
                  <p className="text-sm">
                    Para utilizar la autenticación de dos factores, primero debes configurarla con Google Authenticator.
                  </p>
                  <Button 
                    onClick={() => setShowTwoFactorSetup(true)} 
                    className="w-full"
                  >
                    Configurar Autenticador
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AccessCode;
