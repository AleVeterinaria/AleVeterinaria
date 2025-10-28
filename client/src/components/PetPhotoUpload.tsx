import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ObjectUploader } from '@/components/ObjectUploader';
import { Camera, Upload, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface PetPhotoUploadProps {
  petId: string;
  petName: string;
  currentPhoto?: string | null;
  onPhotoUpdate?: (newPhotoURL: string) => void;
}

export function PetPhotoUpload({ petId, petName, currentPhoto, onPhotoUpdate }: PetPhotoUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/pets/photo/upload', {
      method: 'POST',
    });
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: any) => {
    try {
      setIsUploading(true);
      
      // Get the uploaded file URL
      const uploadedFile = result.successful?.[0];
      if (!uploadedFile) {
        throw new Error('No file was uploaded successfully');
      }

      const photoURL: string = uploadedFile.response?.uploadURL || uploadedFile.meta?.url;
      if (!photoURL) {
        throw new Error('Could not get photo URL from upload result');
      }

      // Update pet photo in database
      const response: Response = await fetch(`/api/pets/${petId}/photo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoURL }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pet photo in database');
      }

      const result: any = await response.json();

      // Invalidate queries to refresh pet data
      await queryClient.invalidateQueries({ queryKey: [`/api/pets/rut`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/search/pets`] });

      // Call optional callback
      onPhotoUpdate?.(photoURL);

      toast({
        title: 'Foto actualizada',
        description: `La foto de ${petName} se actualizó correctamente`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating pet photo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la foto de la mascota',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button
          className="relative group"
          data-testid={`photo-upload-${petId}`}
        >
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={`Foto de ${petName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-full flex items-center justify-center">
            <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Actualizar foto de {petName}
          </DialogTitle>
          <DialogDescription>
            Selecciona una nueva foto para {petName}. Se recomienda usar una imagen cuadrada para mejor visualización.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentPhoto && (
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-blue-200">
                <img
                  src={currentPhoto}
                  alt={`Foto actual de ${petName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={5242880} // 5MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="w-full"
          >
            {isUploading ? 'Subiendo foto...' : 'Seleccionar nueva foto'}
          </ObjectUploader>
        </div>
      </DialogContent>
    </Dialog>
  );
}