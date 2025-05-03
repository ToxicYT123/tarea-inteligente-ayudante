
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface BlockedAccessProps {
  blockTimeLeft: number | null;
}

const BlockedAccess: React.FC<BlockedAccessProps> = ({ blockTimeLeft }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  useEffect(() => {
    if (!blockTimeLeft) return;
    
    const formatTime = (ms: number) => {
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((ms % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    setTimeLeft(formatTime(blockTimeLeft));
    
    const interval = setInterval(() => {
      const newTimeLeft = blockTimeLeft - (1000 * interval);
      if (newTimeLeft <= 0) {
        clearInterval(interval);
        window.location.reload();
      } else {
        setTimeLeft(formatTime(newTimeLeft));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [blockTimeLeft]);
  
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acceso bloqueado</AlertTitle>
        <AlertDescription>
          Se ha excedido el número máximo de intentos. Por favor, intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
      
      {timeLeft && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Tiempo restante de bloqueo:</p>
          <p className="text-lg font-mono">{timeLeft}</p>
        </div>
      )}
    </div>
  );
};

export default BlockedAccess;
