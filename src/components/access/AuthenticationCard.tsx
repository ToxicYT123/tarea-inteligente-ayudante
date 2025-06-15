
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from 'lucide-react';

interface AuthenticationCardProps {
  children: React.ReactNode;
}

const AuthenticationCard: React.FC<AuthenticationCardProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-2">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">HABY TareaAssist</CardTitle>
          <p className="text-muted-foreground text-sm">
            Autenticación requerida para continuar
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationCard;
