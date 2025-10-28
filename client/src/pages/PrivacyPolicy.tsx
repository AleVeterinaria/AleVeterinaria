import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="bg-warmbeige font-lato">
      {/* Header */}
      <div className="bg-gradient-to-r from-mint to-turquoise py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/assets/logo.png" 
              alt="Ale Veterinaria Logo" 
              className="w-12 h-12 mr-4"
            />
            <h1 className="text-4xl font-poppins font-bold text-white">Política de Privacidad</h1>
          </div>
          <p className="text-xl text-white font-lato">
            Ale Veterinaria - Protegemos tu información y la de tu mascota
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 bg-gray-50 inline-block px-4 py-2 rounded-full">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CL')}
            </p>
          </div>
          
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-mint to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-mint">1. Información que recopilamos</h2>
              <p className="mb-4 text-darkgray font-bold text-base">
                En Ale Veterinaria recopilamos la siguiente información para brindar nuestros servicios veterinarios:
              </p>
              <ul className="list-disc pl-6 mb-4 text-darkgray font-bold text-base">
                <li><strong>Información del tutor:</strong> Nombre, RUT, teléfono, email, dirección</li>
                <li><strong>Información de la mascota:</strong> Nombre, especie, raza, edad, peso, condición médica</li>
                <li><strong>Información médica:</strong> Historial médico, vacunas, tratamientos, prescripciones</li>
                <li><strong>Información de comunicación:</strong> Mensajes de WhatsApp, emails, llamadas telefónicas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-lavender to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-lavender">2. Cómo utilizamos tu información</h2>
              <p className="mb-4">Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Proporcionar atención veterinaria profesional a domicilio</li>
                <li>Programar y gestionar citas veterinarias</li>
                <li>Mantener registros médicos precisos de las mascotas</li>
                <li>Enviar recordatorios de citas y vacunaciones</li>
                <li>Comunicarnos contigo sobre el cuidado de tu mascota</li>
                <li>Cumplir con requisitos legales y regulatorios veterinarios</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-turquoise to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-turquoise">3. WhatsApp Business</h2>
              <p className="mb-4">
                Utilizamos WhatsApp Business para comunicarnos contigo de manera eficiente:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Confirmaciones de citas programadas</li>
                <li>Recordatorios de citas y vacunaciones</li>
                <li>Consultas sobre el estado de salud de tu mascota</li>
                <li>Envío de informes médicos y certificados</li>
              </ul>
              <p className="mb-4">
                Al proporcionar tu número de WhatsApp, consientes recibir mensajes relacionados con 
                los servicios veterinarios. Puedes optar por no recibir mensajes en cualquier momento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-palerose to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-palerose">4. Compartir información</h2>
              <p className="mb-4">
                No vendemos, alquilamos o compartimos tu información personal con terceros, excepto:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Cuando sea requerido por ley o autoridades competentes</li>
                <li>Con laboratorios veterinarios para análisis médicos</li>
                <li>Con servicios de emergencia veterinaria cuando sea necesario</li>
                <li>Con tu consentimiento explícito</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-mint to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-mint">5. Seguridad de datos</h2>
              <p className="mb-4">
                Implementamos medidas de seguridad técnicas y organizacionales para proteger 
                tu información personal:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Cifrado de datos en tránsito y en reposo</li>
                <li>Acceso restringido solo a personal autorizado</li>
                <li>Copias de seguridad regulares de registros médicos</li>
                <li>Actualización constante de medidas de seguridad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-lavender to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-lavender">6. Tus derechos</h2>
              <p className="mb-4">Tienes derecho a:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Acceder a tu información personal y la de tu mascota</li>
                <li>Rectificar información incorrecta o incompleta</li>
                <li>Solicitar la eliminación de datos (sujeto a obligaciones legales)</li>
                <li>Restringir el procesamiento de tu información</li>
                <li>Portar tus datos a otro servicio veterinario</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-turquoise to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-turquoise">7. Retención de datos</h2>
              <p className="mb-4">
                Conservamos los registros médicos veterinarios según lo requerido por la 
                legislación chilena y las mejores prácticas veterinarias, generalmente 
                por un período de 5 años después de la última consulta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-palerose to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-palerose">8. Contacto</h2>
              <p className="mb-4">
                Para consultas sobre esta política de privacidad o tus datos personales, contacta:
              </p>
              <div className="bg-gradient-to-r from-mint/20 to-turquoise/20 p-6 rounded-xl border-2 border-mint shadow-lg">
                <p className="font-poppins font-bold text-xl text-mint">Ale Veterinaria</p>
                <p className="font-lato text-darkgray font-semibold">Dra. Alejandra Cautín Bastías</p>
                <p className="font-lato text-darkgray font-bold text-lg"><i className="fas fa-envelope mr-3 text-mint text-xl"></i>contacto@aleveterinaria.cl</p>
                <p className="font-lato text-darkgray font-bold text-lg"><i className="fab fa-whatsapp mr-3 text-mint text-xl"></i>+56 9 7604 0797</p>
                <p className="font-lato text-darkgray font-bold text-lg"><i className="fas fa-map-marker-alt mr-3 text-mint text-xl"></i>Santiago, Chile</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-mint to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-mint">9. Cambios a esta política</h2>
              <p className="mb-4">
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos 
                sobre cambios significativos a través de WhatsApp o email antes de que entren en vigor.
              </p>
            </section>
          </div>
        </div>
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
                <li><a href="/privacy-policy" className="hover:text-mint transition-colors font-bold text-base">Política de Privacidad</a></li>
                <li><a href="/terms-of-service" className="hover:text-lavender transition-colors text-base">Términos de Servicio</a></li>
                <li><a href="/data-deletion" className="hover:text-turquoise transition-colors text-base">Eliminación de Datos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-poppins font-bold mb-4 text-white text-lg">Contacto</h4>
              <ul className="space-y-3 text-gray-100 font-lato font-bold">
                <li><i className="fab fa-whatsapp mr-3 text-mint text-lg"></i>+56 9 7604 0797</li>
                <li><i className="fas fa-envelope mr-3 text-mint text-lg"></i>contacto@aleveterinaria.cl</li>
                <li><i className="fab fa-instagram mr-3 text-mint text-lg"></i>@aleveterinaria</li>
                <li><i className="fas fa-map-marker-alt mr-3 text-mint text-lg"></i>Santiago, Chile</li>
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