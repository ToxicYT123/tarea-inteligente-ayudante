
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
  const [secretKey, setSecretKey] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Generate secret key for 2FA
  useEffect(() => {
    const generateSecret = async () => {
      try {
        setIsLoading(true);
        // In a real app, this should be generated on the server
        // For this demo, we'll generate a random string
        const randomSecret = Array(16)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('');
        
        setSecretKey(randomSecret);
        
        // Generate QR code
        const otpAuthUrl = `otpauth://totp/HABYTareaAssist:user@example.com?secret=${randomSecret}&issuer=HABYTareaAssist`;
        const qrCode = await QRCode.toDataURL(otpAuthUrl);
        setQrCodeUrl(qrCode);
      } catch (error) {
        console.error("Error generating QR code:", error);
        toast.error("Error al generar el código QR");
      } finally {
        setIsLoading(false);
      }
    };

    generateSecret();
  }, []);

  const handleVerify = () => {
    // In a real application, this should validate the OTP against the secret
    // For this demo, we'll accept any 6-digit code
    if (otpValue.length === 6) {
      toast.success("Código verificado correctamente");
      onVerify();
      // Store in localStorage that 2FA is set up
      localStorage.setItem("2fa_enabled", "true");
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
                  <code className="font-mono text-sm">{secretKey}</code>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ingresa el código de verificación:
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
