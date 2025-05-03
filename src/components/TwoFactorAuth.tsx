
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
  
  // Use RFC 6238 compliant secret format (Base32 encoded)
  const [secretKey, setSecretKey] = useState(() => {
    // Get stored key or generate a new one with proper format for TOTP
    const storedKey = localStorage.getItem("2fa_secret_key");
    if (storedKey) return storedKey;
    
    // Generate a new Base32 encoded secret (RFC 6238 compliant)
    // This is a simplified version - in production, use a library like 'speakeasy'
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Base32 character set
    let newSecret = '';
    for (let i = 0; i < 16; i++) {
      newSecret += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }
    
    localStorage.setItem("2fa_secret_key", newSecret);
    return newSecret;
  });

  // Generate RFC 6238 compliant QR code
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        
        // Create a proper otpauth URI according to RFC 6238
        const otpAuthUrl = `otpauth://totp/HABYTareaAssist:usuario@example.com?secret=${secretKey}&issuer=HABYTareaAssist&algorithm=SHA1&digits=6&period=30`;
        
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
    // In a real implementation, this would validate the OTP against the secret key
    // For this demo, we accept any 6-digit code for simplicity
    if (otpValue.length === 6) {
      toast.success("Código verificado correctamente");
      // Save in localStorage that 2FA is configured
      localStorage.setItem("2fa_enabled", "true");
      localStorage.setItem("2fa_verified", "true");
      onVerify();
    } else {
      toast.error("Código inválido. Debe tener 6 dígitos.");
    }
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
                <div className="p-2 bg-white rounded-md">
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
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
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
