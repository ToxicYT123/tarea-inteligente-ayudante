
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, ShieldCheck } from 'lucide-react';
import TwoFactorAuth from './TwoFactorAuth';
import CodeAccessForm from './access/CodeAccessForm';
import TwoFactorForm from './access/TwoFactorForm';
import BlockedAccess from './access/BlockedAccess';
import { checkIfBlocked, loadAttempts, saveAttempts, get2FAStatus, MAX_ATTEMPTS } from '@/utils/accessUtils';

interface AccessCodeProps {
  onAccess: () => void;
}

const AccessCode: React.FC<AccessCodeProps> = ({ onAccess }) => {
  const [attempts, setAttempts] = useState(() => loadAttempts());
  const [blocked, setBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState<number | null>(null);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  
  // Get 2FA status
  const { enabled: is2FAEnabled, verified: is2FAVerified } = get2FAStatus();
  
  const [authMethod, setAuthMethod] = useState<'code' | '2fa'>(
    is2FAEnabled && is2FAVerified ? '2fa' : 'code'
  );
  
  useEffect(() => {
    const { blocked, blockTimeLeft } = checkIfBlocked();
    
    if (blocked) {
      setBlocked(true);
      setBlockTimeLeft(blockTimeLeft);
      
      // Set up an interval to update the counter
      const interval = setInterval(() => {
        const { blocked: stillBlocked, blockTimeLeft: timeLeft } = checkIfBlocked();
        
        if (!stillBlocked) {
          clearInterval(interval);
          setBlocked(false);
          setAttempts(0);
        } else {
          setBlockTimeLeft(timeLeft);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  const handleCodeSuccess = () => {
    if (!is2FAEnabled || !is2FAVerified) {
      // If 2FA is not set up yet, show the setup screen
      setShowTwoFactorSetup(true);
    } else {
      onAccess();
    }
  };

  const handleAttemptChange = (newAttempts: number) => {
    setAttempts(newAttempts);
    saveAttempts(newAttempts);
    
    if (newAttempts >= MAX_ATTEMPTS) {
      setBlocked(true);
      setBlockTimeLeft(24 * 60 * 60 * 1000);
    }
  };

  const handleTwoFactorVerified = () => {
    setShowTwoFactorSetup(false);
    onAccess();
  };
  
  if (showTwoFactorSetup) {
    return (
      <TwoFactorAuth 
        onVerify={handleTwoFactorVerified} 
        onCancel={() => {
          // If the user cancels 2FA setup, still allow access
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
          <BlockedAccess blockTimeLeft={blockTimeLeft} />
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
              <CodeAccessForm 
                onSuccess={handleCodeSuccess}
                attempts={attempts}
                maxAttempts={MAX_ATTEMPTS}
                onAttemptChange={handleAttemptChange}
              />
              
              {is2FAEnabled && is2FAVerified && (
                <p className="text-xs text-muted-foreground text-center">
                  Si prefieres, puedes usar la aplicación Google Authenticator
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="2fa" className="space-y-4">
              <TwoFactorForm 
                onVerify={onAccess}
                showSetup={() => setShowTwoFactorSetup(true)}
                is2FAEnabled={is2FAEnabled}
                is2FAVerified={is2FAVerified}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AccessCode;
