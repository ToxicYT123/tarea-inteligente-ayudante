
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { QrCode } from 'lucide-react';

interface TwoFactorFormProps {
  onVerify: () => void;
  showSetup: () => void;
  is2FAEnabled: boolean;
  is2FAVerified: boolean;
}

const TwoFactorForm: React.FC<TwoFactorFormProps> = ({
  onVerify,
  showSetup,
  is2FAEnabled,
  is2FAVerified
}) => {
  const [otpValue, setOtpValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // En una implementación real, validaría el OTP contra la clave secreta almacenada
    // Para esta demostración, aceptamos cualquier código de 6 dígitos
    if (otpValue.length === 6) {
      toast.success("Código de verificación válido. Acceso concedido.");
      onVerify();
    } else {
      toast.error("Código inválido. Debe tener 6 dígitos.");
    }
    
    setOtpValue("");
  };

  const handleResetConfig = () => {
    // Limpiar la configuración 2FA para permitir configuración nuevamente
    localStorage.removeItem("2fa_secret_key");
    localStorage.removeItem("2fa_enabled");
    localStorage.removeItem("2fa_verified");
    
    // Mostrar la pantalla de configuración
    showSetup();
    toast.info("Configuración de autenticador reiniciada");
  };

  if (is2FAEnabled && is2FAVerified) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button 
            type="button"
            variant="outline" 
            className="w-full text-xs" 
            onClick={handleResetConfig}
          >
            Reiniciar configuración
          </Button>
        </div>
      </form>
    );
  } 
  
  return (
    <div className="text-center p-4 space-y-4">
      <QrCode className="mx-auto h-16 w-16 text-primary" />
      <p className="text-sm">
        Para utilizar la autenticación de dos factores, primero debes configurarla con Google Authenticator.
      </p>
      <Button 
        onClick={showSetup} 
        className="w-full"
      >
        Configurar Autenticador
      </Button>
    </div>
  );
};

export default TwoFactorForm;
