import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Declarar tipos de Turnstile
declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact';
      }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consentWhatsapp: false,
    consentEmail: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string>('');
  const { toast } = useToast();

  // Manejar respuesta de Turnstile
  const handleTurnstile = (token: string) => {
    setTurnstileToken(token);
  };

  // Cargar script de Turnstile
  React.useEffect(() => {
    // Solo cargar Turnstile en producción o si específicamente se requiere
    const isDev = typeof window !== 'undefined' && 
      (window.location.hostname.includes('replit.dev') || 
       window.location.hostname === 'localhost' ||
       process.env.NODE_ENV === 'development');
    
    if (isDev) {
      // En desarrollo, simular token válido después de 2 segundos
      console.log('🔧 Modo desarrollo: simulando verificación Turnstile');
      setTimeout(() => {
        setTurnstileToken('dev-token-simulation');
      }, 2000);
      return;
    }

    // Verificar si ya está cargado
    if (window.turnstile) {
      console.log('Turnstile ya está cargado');
      if (turnstileRef.current) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAABuFJd3CiyJcNpi7',
          callback: handleTurnstile,
          'error-callback': () => {
            console.warn('Error en Turnstile, usando modo fallback');
            setTurnstileToken('fallback-token');
          },
          theme: 'light',
          size: 'normal'
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
    script.async = true;
    script.defer = true;
    
    // Función callback global para Turnstile
    (window as any).onloadTurnstileCallback = () => {
      (window as any).handleTurnstile = handleTurnstile;
      
      if (turnstileRef.current && window.turnstile) {
        try {
          turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAABuFJd3CiyJcNpi7',
            callback: handleTurnstile,
            'error-callback': () => {
              console.warn('Error en Turnstile, usando modo fallback');
              setTurnstileToken('fallback-token');
            },
            theme: 'light',
            size: 'normal'
          });
        } catch (error) {
          console.warn('Error renderizando Turnstile, usando modo fallback:', error);
          setTurnstileToken('fallback-token');
        }
      }
    };
    
    script.onerror = () => {
      console.warn('Error cargando Turnstile, usando modo fallback');
      setTurnstileToken('fallback-token');
    };
    
    document.head.appendChild(script);
    
    return () => {
      try {
        document.head.removeChild(script);
        delete (window as any).onloadTurnstileCallback;
        delete (window as any).handleTurnstile;
      } catch (error) {
        // Ignorar errores de limpieza
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    // Verificar token de Turnstile
    if (!turnstileToken) {
      toast({
        title: "Error",
        description: "Por favor completa la verificación de seguridad",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Send form data to backend email service
    try {
      const response = await fetch('/api/contact/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          turnstileToken
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Mensaje enviado",
          description: "Tu mensaje ha sido enviado a contacto@aleveterinaria.cl. Nos pondremos en contacto contigo pronto.",
        });
        
        // Reset form
        setFormData({ name: '', email: '', phone: '', message: '', consentWhatsapp: false, consentEmail: false });
        setTurnstileToken('');
        
        // Reset Turnstile
        if (turnstileWidgetId.current && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
      } else {
        throw new Error(result.error || 'Error al enviar el mensaje');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: "Error al enviar",
        description: error.message || "No se pudo enviar el mensaje. Verifica que la configuración SMTP esté configurada.",
        variant: "destructive"
      });
      
      // Reset Turnstile en caso de error
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
      setTurnstileToken('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleWhatsAppClick = () => {
    const message = `Hola! Me gustaría obtener más información sobre los servicios veterinarios a domicilio de Ale Veterinaria.

¿Podrían ayudarme con:
- Información sobre servicios disponibles
- Precios y horarios
- Agendar una consulta

Muchas gracias!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/56976040797?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const contactInfo = [
    {
      icon: "fab fa-whatsapp",
      title: "WhatsApp",
      value: "+56 9 7604 0797",
      color: "bg-green-500",
      action: handleWhatsAppClick
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      value: "contacto@aleveterinaria.cl",
      color: "bg-elegant-secondary",
      action: () => window.open("mailto:contacto@aleveterinaria.cl")
    },
    {
      icon: "fab fa-instagram",
      title: "Instagram",
      value: "@aleveterinaria",
      color: "bg-elegant-highlight",
      action: () => window.open("https://instagram.com/aleveterinaria")
    }
  ];

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-poppins font-bold text-darkgray mb-4">Contacto</h2>
          <p className="text-xl text-gray-600">Estamos aquí para ayudarte y resolver tus dudas</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {contactInfo.map((info, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-4 ${info.action ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                onClick={info.action || undefined}
              >
                <div className={`${info.color} p-4 rounded-full ${info.action ? 'hover:shadow-lg' : ''}`}>
                  <i className={`${info.icon} text-white text-2xl`}></i>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-darkgray text-xl">{info.title}</h3>
                  <p className="text-gray-600 font-lato">{info.value}</p>
                  {info.title === "WhatsApp" && (
                    <p className="text-sm text-green-600 font-lato mt-1">¡Haz clic para chatear!</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-warmbeige to-white p-8 rounded-3xl shadow-lg">
            <h3 className="text-2xl font-poppins font-semibold text-darkgray mb-6">Envíanos un Mensaje</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-darkgray font-poppins font-medium mb-2">Nombre completo *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-mint focus:outline-none font-lato" 
                  placeholder="Tu nombre" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-darkgray font-poppins font-medium mb-2">Email *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-lavender focus:outline-none font-lato" 
                  placeholder="tu@email.com" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-darkgray font-poppins font-medium mb-2">Teléfono</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-turquoise focus:outline-none font-lato" 
                  placeholder="+56 9 1234 5678" 
                />
              </div>
              
              <div>
                <label className="block text-darkgray font-poppins font-medium mb-2">Mensaje *</label>
                <textarea 
                  rows={4} 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-palerose focus:outline-none font-lato" 
                  placeholder="Cuéntanos sobre tu mascota y cómo podemos ayudarte"
                  required
                />
              </div>
              
              {/* Consentimiento para comunicaciones */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="font-poppins font-semibold text-darkgray mb-4">Consentimiento para Comunicaciones</h4>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentEmail"
                      checked={formData.consentEmail}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-mint border-gray-300 rounded focus:ring-mint"
                      data-testid="checkbox-consent-email"
                    />
                    <span className="text-sm text-gray-700 font-lato leading-relaxed">
                      Acepto recibir respuestas y comunicaciones relacionadas con mi consulta a través de correo electrónico.
                    </span>
                  </label>
                  
                  {formData.phone && (
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="consentWhatsapp"
                        checked={formData.consentWhatsapp}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-mint border-gray-300 rounded focus:ring-mint"
                        data-testid="checkbox-consent-whatsapp"
                      />
                      <span className="text-sm text-gray-700 font-lato leading-relaxed">
                        Acepto recibir respuestas y comunicaciones relacionadas con mi consulta a través de WhatsApp.
                      </span>
                    </label>
                  )}
                  
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex justify-center">
                {(() => {
                  const isDev = typeof window !== 'undefined' && 
                    (window.location.hostname.includes('replit.dev') || 
                     window.location.hostname === 'localhost' ||
                     process.env.NODE_ENV === 'development');
                  
                  if (isDev) {
                    return (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <i className="fas fa-shield-alt text-blue-500 mr-2"></i>
                        <span className="text-blue-700 text-sm">Modo desarrollo - Verificación simulada</span>
                        {turnstileToken && <i className="fas fa-check text-green-500 ml-2"></i>}
                      </div>
                    );
                  } else {
                    return (
                      <div 
                        ref={turnstileRef}
                        className="cf-turnstile" 
                        data-sitekey="0x4AAAAAABuFJd3CiyJcNpi7"
                        data-callback="handleTurnstile"
                        data-theme="light"
                      ></div>
                    );
                  }
                })()}
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !turnstileToken}
                className="w-full bg-mint text-darkgray py-4 px-8 rounded-xl font-poppins font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
