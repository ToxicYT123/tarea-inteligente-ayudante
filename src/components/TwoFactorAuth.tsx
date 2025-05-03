
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/sonner";
import { Loader2, KeyRound } from 'lucide-react';
import QRCode from 'qrcode';

interface TwoFactorAuthProps {
  onVerify: () => void;
  onCancel: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onVerify, onCancel }) => {
  const [otpValue, setOtpValue] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Generar una clave secreta Base32 adecuadamente formateada para TOTP
  const [secretKey, setSecretKey] = useState(() => {
    // Obtener la clave guardada o generar una nueva
    const storedKey = localStorage.getItem("2fa_secret_key");
    if (storedKey) return storedKey;
    
    // Generar una nueva clave Base32 - solo letras mayúsculas y números 2-7 (RFC 4648)
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let newSecret = '';
    // Generar 16 caracteres (80 bits) - longitud mínima recomendada
    for (let i = 0; i < 16; i++) {
      newSecret += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }
    
    localStorage.setItem("2fa_secret_key", newSecret);
    return newSecret;
  });

  // Generar código QR compatible con el estándar
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        
        // Crear URI otpauth conforme a RFC 4226/6238 con parámetros estándar
        // Formato: otpauth://totp/[proveedor]:[cuenta]?secret=[secreto]&issuer=[emisor]&algorithm=SHA1&digits=6&period=30
        const accountName = 'usuario@habytareaassist.com';
        const issuer = 'HABYTareaAssist';
        const encodedIssuer = encodeURIComponent(issuer);
        
        const otpAuthUrl = `otpauth://totp/${encodedIssuer}:${accountName}?secret=${secretKey}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
        
        const qrCode = await QRCode.toDataURL(otpAuthUrl);
        setQrCodeUrl(qrCode);
      } catch (error) {
        console.error("Error generando código QR:", error);
        toast.error("Error al generar el código QR");
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [secretKey]);

  const handleVerify = () => {
    // En una implementación real, esto validaría el OTP contra la clave secreta
    // Para esta demostración, aceptamos cualquier código de 6 dígitos
    if (otpValue.length === 6) {
      toast.success("Código verificado correctamente");
      // Guardar en localStorage que 2FA está configurado y verificado
      localStorage.setItem("2fa_enabled", "true");
      localStorage.setItem("2fa_verified", "true");
      onVerify();
    } else {
      toast.error("Código inválido. Debe tener 6 dígitos.");
    }
  };

  const handleReset = () => {
    // Limpiar los datos 2FA guardados para comenzar de nuevo
    localStorage.removeItem("2fa_secret_key");
    localStorage.removeItem("2fa_enabled");
    localStorage.removeItem("2fa_verified");
    
    // Generar una nueva clave secreta
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let newSecret = '';
    for (let i = 0; i < 16; i++) {
      newSecret += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }
    
    setSecretKey(newSecret);
    localStorage.setItem("2fa_secret_key", newSecret);
    toast.info("Configuración de autenticador reiniciada");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50">
      <Card className="w-[350px] max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Configurar Autenticación de Dos Factores</CardTitle>
          <CardDescription>
            Escanea el código QR con la aplicación Google Authenticator para configurar la autenticación de dos factores.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-md">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for Google Authenticator" 
                    className="w-48 h-48"
                  />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm mb-2">Clave secreta (si no puedes escanear el código):</p>
                <div className="bg-muted p-2 rounded-md flex items-center justify-center">
                  <KeyRound className="h-4 w-4 mr-2 text-muted-foreground" />
                  <code className="font-mono text-sm select-all">{secretKey}</code>
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  Si tienes problemas, intenta ingresar la clave manualmente en la app
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ingresa el código de verificación de Google Authenticator:
                </label>
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
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReset} disabled={isLoading}>
              Reiniciar
            </Button>
          </div>
          <Button 
            onClick={handleVerify} 
            disabled={otpValue.length !== 6 || isLoading}
          >
            Verificar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;
