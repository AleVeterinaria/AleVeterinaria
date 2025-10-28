import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Trash2, Shield, FileText } from 'lucide-react';

export function DataDeletion() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    petName: '',
    reason: '',
    requestDetails: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En una implementación real, esto enviaría la solicitud al backend
    console.log('Solicitud de eliminación de datos:', formData);
    setSubmitted(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="bg-warmbeige font-lato min-h-screen flex items-center justify-center">
        <Card className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-mint mx-auto mb-4" />
            <CardTitle className="text-2xl font-poppins text-mint">Solicitud recibida</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-darkgray mb-4 font-lato">
              Tu solicitud de eliminación de datos ha sido recibida exitosamente.
            </p>
            <p className="text-sm text-gray-500 mb-6 font-lato">
              Procesaremos tu solicitud dentro de 30 días hábiles y te contactaremos 
              por email con la confirmación.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-mint hover:bg-mint-dark font-poppins font-semibold px-8 py-3 rounded-xl"
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-warmbeige font-lato">
      {/* Header */}
      <div className="bg-gradient-to-r from-turquoise to-mint py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Trash2 className="h-12 w-12 text-white mr-4" />
            <h1 className="text-4xl font-poppins font-bold text-white">Eliminación de Datos</h1>
          </div>
          <p className="text-xl text-white font-lato">
            Ale Veterinaria - Controla tus datos personales y médicos
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto py-12 px-4">

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Información del proceso */}
          <div className="space-y-6">
            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center font-poppins text-white bg-gradient-to-r from-turquoise to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-turquoise">
                  <Shield className="h-6 w-6 text-white mr-3" />
                  Proceso de Eliminación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-mint/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-mint font-poppins">1</span>
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-darkgray text-lg">Solicitud</h4>
                    <p className="text-sm text-darkgray font-bold font-lato">Completa el formulario con tus datos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-lavender/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-lavender font-poppins">2</span>
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-darkgray text-lg">Verificación</h4>
                    <p className="text-sm text-darkgray font-bold font-lato">Verificamos tu identidad (2-5 días hábiles)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-turquoise/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-turquoise font-poppins">3</span>
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-darkgray text-lg">Eliminación</h4>
                    <p className="text-sm text-darkgray font-bold font-lato">Eliminamos todos tus datos (hasta 30 días)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-mint/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-mint" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-darkgray text-lg">Confirmación</h4>
                    <p className="text-sm text-darkgray font-bold font-lato">Te enviamos confirmación por email</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center font-poppins text-white bg-gradient-to-r from-palerose to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-palerose">
                  <FileText className="h-6 w-6 text-white mr-3" />
                  Datos que se Eliminarán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-darkgray font-bold font-lato">
                  <li>• Información personal del tutor (nombre, RUT, contacto)</li>
                  <li>• Datos de la mascota (nombre, raza, edad, peso)</li>
                  <li>• Historial médico y registros veterinarios</li>
                  <li>• Certificados y prescripciones generadas</li>
                  <li>• Comunicaciones por WhatsApp y email</li>
                  <li>• Registros de citas y consultas</li>
                  <li>• Fotos y documentos subidos</li>
                </ul>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <Shield className="h-4 w-4 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Importante:</strong> Una vez eliminados, los datos no podrán ser recuperados. 
                  Los registros médicos requeridos por ley se mantendrán de forma anónima por el 
                  período legal mínimo (5 años) sin información identificable.
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de solicitud */}
          <Card className="bg-white rounded-3xl shadow-xl border-0">
            <CardHeader>
              <CardTitle className="font-poppins text-xl text-white bg-gradient-to-r from-mint to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-mint">Solicitar Eliminación</CardTitle>
              <CardDescription className="font-lato text-darkgray font-bold text-lg">
                Completa este formulario para solicitar la eliminación completa de tus datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-poppins font-semibold text-darkgray mb-1">
                    Nombre completo *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-poppins font-semibold text-darkgray mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-poppins font-semibold text-darkgray mb-1">
                    Teléfono/WhatsApp *
                  </label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+56 9 XXXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-poppins font-semibold text-darkgray mb-1">
                    Nombre de la Mascota
                  </label>
                  <Input
                    value={formData.petName}
                    onChange={(e) => handleInputChange('petName', e.target.value)}
                    placeholder="Nombre de tu mascota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-poppins font-semibold text-darkgray mb-1">
                    Motivo de la Eliminación *
                  </label>
                  <select 
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5FA98D] focus:border-transparent"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                  >
                    <option value="">Selecciona un motivo</option>
                    <option value="privacy_concerns">Preocupaciones de privacidad</option>
                    <option value="no_longer_need">Ya no necesito el servicio</option>
                    <option value="data_accuracy">Problemas con la precisión de datos</option>
                    <option value="legal_request">Solicitud legal</option>
                    <option value="other">Otro motivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-poppins font-semibold text-darkgray mb-1">
                    Detalles Adicionales
                  </label>
                  <Textarea
                    value={formData.requestDetails}
                    onChange={(e) => handleInputChange('requestDetails', e.target.value)}
                    placeholder="Proporciona cualquier información adicional relevante..."
                    rows={3}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-turquoise hover:bg-turquoise-dark font-poppins font-semibold py-3 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Solicitar Eliminación de Datos
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Información de contacto alternativa */}
        <Card className="mt-8 bg-white rounded-3xl shadow-xl border-0">
          <CardHeader>
            <CardTitle className="font-poppins text-xl text-white bg-gradient-to-r from-mint to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-mint">Contacto alternativo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-darkgray mb-4 font-lato font-bold text-lg">
              También puedes solicitar la eliminación de datos contactándonos directamente:
            </p>
            <div className="bg-gradient-to-r from-mint/20 to-turquoise/20 p-6 rounded-xl border-2 border-mint shadow-lg">
              <p className="font-poppins font-bold text-xl text-mint">Ale Veterinaria</p>
              <p className="font-lato text-darkgray font-bold">Dra. Alejandra Cautín Bastías</p>
              <p className="font-lato text-darkgray font-bold text-lg"><i className="fas fa-envelope mr-3 text-mint text-xl"></i>Email: <a href="mailto:contacto@aleveterinaria.cl" className="text-mint hover:underline font-semibold">contacto@aleveterinaria.cl</a></p>
              <p className="font-lato text-darkgray font-bold text-lg"><i className="fab fa-whatsapp mr-3 text-mint text-xl"></i>WhatsApp: <a href="https://wa.me/56976040797" className="text-mint hover:underline font-semibold">+56 9 7604 0797</a></p>
              <p className="font-lato text-darkgray font-bold text-lg"><i className="fas fa-map-marker-alt mr-3 text-mint text-xl"></i>Santiago, Chile</p>
              <p className="text-sm text-darkgray font-bold mt-2 font-lato">
                Asunto: "Solicitud de Eliminación de Datos - [Tu Nombre]"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-darkgray text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/assets/logo.png" 
                  alt="Ale Veterinaria Logo" 
                  className="w-8 h-8"
                />
                <h3 className="text-xl font-poppins font-bold text-white">Ale Veterinaria</h3>
              </div>
              <p className="text-gray-100 font-lato leading-relaxed font-bold text-base">
                Atención veterinaria a domicilio. Cuido a tu mascota con amor y dedicación en Santiago, Chile.
              </p>
            </div>
            
            <div>
              <h4 className="font-poppins font-bold mb-4 text-white text-lg">Enlaces Rápidos</h4>
              <ul className="space-y-3 text-gray-100 font-lato font-bold">
                <li><a href="/" className="hover:text-mint transition-colors text-base">Inicio</a></li>
                <li><a href="/#servicios" className="hover:text-lavender transition-colors text-base">Servicios</a></li>
                <li><a href="/#agendar" className="hover:text-turquoise transition-colors text-base">Agendar Cita</a></li>
                <li><a href="/#faq" className="hover:text-palerose transition-colors text-base">FAQ</a></li>
                <li><a href="/#contacto" className="hover:text-mint transition-colors text-base">Contacto</a></li>
              </ul>
              
              <h4 className="font-poppins font-bold mb-4 mt-6 text-white text-lg">Políticas</h4>
              <ul className="space-y-3 text-gray-100 font-lato font-bold">
                <li><a href="/privacy-policy" className="hover:text-mint transition-colors text-base">Política de Privacidad</a></li>
                <li><a href="/terms-of-service" className="hover:text-lavender transition-colors text-base">Términos de Servicio</a></li>
                <li><a href="/data-deletion" className="hover:text-turquoise transition-colors font-bold text-base">Eliminación de Datos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-poppins font-bold mb-4 text-white text-lg">Contacto</h4>
              <ul className="space-y-3 text-gray-100 font-lato font-bold">
                <li><i className="fab fa-whatsapp mr-3 text-turquoise text-lg"></i>+56 9 7604 0797</li>
                <li><i className="fas fa-envelope mr-3 text-turquoise text-lg"></i>contacto@aleveterinaria.cl</li>
                <li><i className="fab fa-instagram mr-3 text-turquoise text-lg"></i>@aleveterinaria</li>
                <li><i className="fas fa-map-marker-alt mr-3 text-turquoise text-lg"></i>Santiago, Chile</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-100 font-lato font-bold">
            <p>&copy; 2025 Ale Veterinaria Chile. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}