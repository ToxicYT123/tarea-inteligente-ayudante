
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

interface CodeAccessFormProps {
  onSuccess: () => void;
  attempts: number;
  maxAttempts: number;
  onAttemptChange: (newAttempts: number) => void;
}

const CORRECT_CODE = "B4$w7K&1zP!X";

const CodeAccessForm: React.FC<CodeAccessFormProps> = ({
  onSuccess,
  attempts,
  maxAttempts,
  onAttemptChange
}) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === CORRECT_CODE) {
      toast.success("Código correcto. Acceso concedido.");
      localStorage.removeItem("accessAttempts");
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      onAttemptChange(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        const blockUntilTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem("blockUntil", blockUntilTime.toString());
        toast.error(`Se ha excedido el número máximo de intentos. Acceso bloqueado por 24 horas.`);
      } else {
        toast.error(`Código incorrecto. Intento ${newAttempts} de ${maxAttempts}`);
      }
    }
    
    setCode("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          Intento {attempts} de {maxAttempts}
        </p>
      </div>
      
      <Button type="submit" className="w-full">
        Acceder
      </Button>
    </form>
  );
};

export default CodeAccessForm;
