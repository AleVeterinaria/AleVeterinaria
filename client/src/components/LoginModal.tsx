import { useState } from 'react';
import { useLocation } from 'wouter';
import { signInUser } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CreateAccount from './CreateAccount';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tutor' | 'profesional';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase authentication
      const result = await signInUser(email, password);
      
      // Reset form
      setEmail('');
      setPassword('');
      
      toast({
        title: "Acceso exitoso",
        description: `Bienvenido al portal ${type === 'tutor' ? 'del tutor' : 'profesional'}`,
      });
      
      // Close modal first
      onClose();
      
      // Wait a bit for auth state to propagate, then redirect
      setTimeout(() => {
        setLocation(type === 'tutor' ? '/portal/tutor' : '/portal/profesional');
      }, 300);
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error de acceso",
        description: error.message || "Error de conexión. Verifica tus credenciales e intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center mb-4">
            <i className="fas fa-user-circle text-4xl text-mint mb-4"></i>
            <DialogTitle className="text-2xl font-poppins font-bold text-darkgray">
              {type === 'tutor' ? 'Portal del tutor' : 'Portal profesional'}
            </DialogTitle>
            <p className="text-gray-600 font-lato mt-2">
              {type === 'tutor' ? 'Accede al historial de tus mascotas' : 'Gestiona fichas clínicas y certificados'}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-darkgray font-poppins font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-2 p-4 rounded-xl border-2 border-gray-200 focus:border-mint"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-darkgray font-poppins font-medium">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 p-4 rounded-xl border-2 border-gray-200 focus:border-lavender"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-mint text-darkgray py-4 px-8 rounded-xl font-poppins font-semibold hover:shadow-lg transition-all"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Iniciando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Iniciar Sesión
              </>
            )}
          </Button>
        </form>
        
        {type !== 'profesional' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">¿No tienes cuenta?</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateAccount(true)}
              className="w-full border-mint text-mint hover:bg-mint/10"
            >
              Crear cuenta {type === 'tutor' ? 'de tutor' : 'profesional'}
            </Button>
          </div>
        )}
      </DialogContent>
      
      <CreateAccount
        isOpen={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
        type={type}
      />
    </Dialog>
  );
};

export default LoginModal;
