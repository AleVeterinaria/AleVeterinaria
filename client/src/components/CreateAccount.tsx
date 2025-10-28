import { useState } from 'react';
import { createUser as createFirebaseUser } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateAccountProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tutor' | 'profesional';
}

const CreateAccount: React.FC<CreateAccountProps> = ({ isOpen, onClose, type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Firebase user first
      const userCredential = await createFirebaseUser(email, password);
      
      // Create user in PostgreSQL database
      try {
        await apiRequest('/api/users', {
          method: 'POST',
          body: JSON.stringify({
            id: userCredential.user.uid,
            email,
            name,
            phone: phone || null,
            role: type === 'tutor' ? 'owner' : 'veterinarian',
            password: 'firebase_auth' // We use Firebase for actual password auth
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.log('User might already exist in PostgreSQL, continuing...');
      }

      toast({
        title: "Cuenta creada exitosamente",
        description: `Tu cuenta ${type === 'tutor' ? 'de tutor' : 'profesional'} ha sido creada correctamente`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Error al crear cuenta",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center mb-4">
            <i className="fas fa-user-plus text-4xl text-mint mb-4"></i>
            <DialogTitle className="text-2xl font-poppins font-bold text-darkgray">
              Crear Cuenta {type === 'tutor' ? 'de Tutor' : 'Profesional'}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-mint/50 focus:border-mint"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-mint/50 focus:border-mint"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="border-mint/50 focus:border-mint"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
              className="border-mint/50 focus:border-mint"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-mint to-turquoise text-darkgray hover:shadow-lg"
            >
              {loading ? 'Creando...' : 'Crear Cuenta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccount;