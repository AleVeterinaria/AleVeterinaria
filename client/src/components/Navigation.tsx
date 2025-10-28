import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from './LoginModal';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<'tutor' | 'profesional'>('tutor');
  const { user, signOut } = useAuth();

  const showLoginModal = (type: 'tutor' | 'profesional') => {
    setLoginType(type);
    setLoginModalOpen(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo en esquina izquierda */}
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/assets/logo.png" 
                alt="Ale Veterinaria Logo" 
                className="w-10 h-10"
              />
              <h1 className="text-2xl font-poppins font-bold text-darkgray">
                <span className="text-mint">Ale</span> Veterinaria
              </h1>
            </Link>
            
            {/* Desktop Navigation - distribuidos equilibradamente */}
            <div className="hidden lg:flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('inicio')}
                className="text-darkgray hover:text-mint font-medium transition-colors"
              >
                Inicio
              </button>
              <button 
                onClick={() => scrollToSection('quien-soy')}
                className="text-darkgray hover:text-mint font-medium transition-colors"
              >
                Quién soy
              </button>
              <button 
                onClick={() => scrollToSection('servicios')}
                className="text-darkgray hover:text-mint font-medium transition-colors"
              >
                Servicios
              </button>
              <button 
                onClick={() => scrollToSection('agendar')}
                className="text-darkgray hover:text-mint font-medium transition-colors"
              >
                Agendar cita
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-darkgray hover:text-mint font-medium transition-colors"
              >
                FAQ
              </button>
              <button 
                onClick={() => scrollToSection('recursos')}
                className="text-darkgray hover:text-mint font-medium transition-colors"
              >
                Recursos
              </button>
              <button 
                onClick={() => scrollToSection('contacto')}
                className="text-darkgray hover:text-mint font-medium transition-colors"
              >
                Contacto
              </button>
              
            </div>
            
            {/* Usuario/Auth removido del homepage */}
            <div className="hidden lg:flex items-center">
              {/* Botón de cerrar sesión removido según solicitud del usuario */}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-darkgray"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden">
              <div className="py-4 space-y-4">
                <button 
                  onClick={() => scrollToSection('inicio')}
                  className="block text-darkgray hover:text-mint font-medium w-full text-left"
                >
                  Inicio
                </button>
                <button 
                  onClick={() => scrollToSection('quien-soy')}
                  className="block text-darkgray hover:text-mint font-medium w-full text-left"
                >
                  Quién soy
                </button>
                <button 
                  onClick={() => scrollToSection('servicios')}
                  className="block text-darkgray hover:text-mint font-medium w-full text-left"
                >
                  Servicios
                </button>
                <button 
                  onClick={() => scrollToSection('agendar')}
                  className="block text-darkgray hover:text-mint font-medium w-full text-left"
                >
                  Agendar cita
                </button>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="block text-darkgray hover:text-mint font-medium w-full text-left"
                >
                  FAQ
                </button>
                <button 
                  onClick={() => scrollToSection('recursos')}
                  className="block text-darkgray hover:text-mint font-medium w-full text-left"
                >
                  Recursos
                </button>
                <button 
                  onClick={() => scrollToSection('contacto')}
                  className="block text-darkgray hover:text-mint font-medium w-full text-left"
                >
                  Contacto
                </button>
                
                {user ? (
                  <div className="pt-4 space-y-3">
                    <p className="text-darkgray">Hola, {user.email}</p>
                    <button 
                      onClick={signOut}
                      className="w-full bg-destructive text-white px-4 py-2 rounded-lg"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        type={loginType}
      />
    </>
  );
};

export default Navigation;
