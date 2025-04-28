
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Attachment } from "@/types";
import { generateId } from "@/utils/taskUtils";
import { Image, AudioLines, FileText } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface FileUploadProps {
  onFileUpload: (attachment: Attachment) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    // Creamos un objeto URL para el archivo
    const fileUrl = URL.createObjectURL(file);
    
    // Determinamos el tipo de archivo
    let fileType: 'image' | 'audio' | 'video' | 'document' = 'document';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    else if (file.type.startsWith('video/')) fileType = 'video';
    
    // En un entorno real, aquí se haría el upload a un servidor
    // y se procesaría la transcripción si fuera audio o video
    
    // Simulamos una carga breve
    setTimeout(() => {
      const newAttachment: Attachment = {
        id: generateId(),
        type: fileType,
        url: fileUrl,
        name: file.name,
        // En una app real, esto vendría del servidor tras procesar el archivo
        transcription: fileType === 'audio' ? 'Transcripción simulada del audio...' : undefined
      };
      
      onFileUpload(newAttachment);
      setIsUploading(false);
      toast.success("Archivo adjuntado correctamente");
      
      // Reseteamos el input file
      e.target.value = '';
    }, 1500);
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center" 
          disabled={isUploading}
          onClick={() => document.getElementById('imageUpload')?.click()}
        >
          <Image className="h-4 w-4 mr-2" />
          Imagen
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center" 
          disabled={isUploading}
          onClick={() => document.getElementById('audioUpload')?.click()}
        >
          <AudioLines className="h-4 w-4 mr-2" />
          Audio
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center" 
          disabled={isUploading}
          onClick={() => document.getElementById('fileUpload')?.click()}
        >
          <FileText className="h-4 w-4 mr-2" />
          Documento
        </Button>
      </div>
      
      {/* Inputs ocultos para cada tipo de archivo */}
      <input 
        id="imageUpload" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />
      
      <input 
        id="audioUpload" 
        type="file" 
        accept="audio/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />
      
      <input 
        id="fileUpload" 
        type="file" 
        accept=".pdf,.doc,.docx,.txt" 
        className="hidden" 
        onChange={handleFileChange} 
      />
      
      {isUploading && (
        <div className="text-sm text-tareaassist-secondary animate-pulse">
          Subiendo archivo...
        </div>
      )}
    </div>
  );
};

export default FileUpload;
