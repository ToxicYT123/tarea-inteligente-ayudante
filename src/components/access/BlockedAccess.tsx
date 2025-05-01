
import React from 'react';

interface BlockedAccessProps {
  blockTimeLeft: number | null;
}

const BlockedAccess: React.FC<BlockedAccessProps> = ({ blockTimeLeft }) => {
  // Función para formatear el tiempo restante
  const formatTimeLeft = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="text-center space-y-2">
      <p className="text-destructive font-semibold">Acceso bloqueado</p>
      {blockTimeLeft && (
        <p className="text-muted-foreground">
          Inténtalo de nuevo en: {formatTimeLeft(blockTimeLeft)}
        </p>
      )}
    </div>
  );
};

export default BlockedAccess;
