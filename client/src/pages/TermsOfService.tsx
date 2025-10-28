import React from 'react';

export function TermsOfService() {
  return (
    <div className="bg-warmbeige font-lato">
      {/* Header */}
      <div className="bg-gradient-to-r from-lavender to-palerose py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/assets/logo.png" 
              alt="Ale Veterinaria Logo" 
              className="w-12 h-12 mr-4"
            />
            <h1 className="text-4xl font-poppins font-bold text-white">Condiciones del Servicio</h1>
          </div>
          <p className="text-xl text-white font-lato">
            Ale Veterinaria - Términos y condiciones para nuestros servicios
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
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-lavender to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-lavender">1. Aceptación de términos</h2>
              <p className="mb-4">
                Al utilizar los servicios de Ale Veterinaria, aceptas estos términos y condiciones. 
                Si no estás de acuerdo, no utilices nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-turquoise to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-turquoise">2. Descripción del servicio</h2>
              <p className="mb-4">
                Ale Veterinaria proporciona servicios veterinarios profesionales a domicilio, incluyendo:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Consultas veterinarias generales</li>
                <li>Vacunación y desparasitación</li>
                <li>Certificados de salud y exportación</li>
                <li>Evaluación nutricional y dietética</li>
                <li>Exámenes médicos preventivos</li>
                <li>Asesoramiento sobre bienestar animal</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-mint to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-mint">3. Programación de citas</h2>
              <p className="mb-4">Las citas deben programarse con anticipación a través de:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Nuestro formulario web en aleveterinaria.cl</li>
                <li>WhatsApp: +56 9 7604 0797</li>
                <li>Email: contacto@aleveterinaria.cl</li>
              </ul>
              <p className="mb-4">
                <strong>Política de cancelación:</strong> Las cancelaciones deben hacerse con al menos 
                2 horas de anticipación. Las cancelaciones tardías pueden estar sujetas a cargos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-palerose to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-palerose">4. Responsabilidades del cliente</h2>
              <p className="mb-4">Como cliente, te comprometes a:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Proporcionar información precisa sobre tu mascota</li>
                <li>Informar sobre alergias, medicamentos actuales y problemas de salud</li>
                <li>Mantener a tu mascota en un ambiente seguro durante la consulta</li>
                <li>Seguir las instrucciones médicas proporcionadas</li>
                <li>Pagar los servicios según los términos acordados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-lavender to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-lavender">5. Servicios de emergencia</h2>
              <p className="mb-4">
                Ale Veterinaria no proporciona servicios de emergencia 24/7. Para emergencias 
                veterinarias fuera del horario de atención, contacta:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Hospital Veterinario Universidad de Chile</li>
                <li>Clínica Veterinaria Las Condes</li>
                <li>Red de Emergencias Veterinarias de Santiago</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-turquoise to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-turquoise">6. Pagos y facturación</h2>
              <p className="mb-4">Los pagos pueden realizarse mediante:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Efectivo en el momento de la consulta</li>
                <li>Transferencia bancaria</li>
                <li>Tarjetas de débito/crédito</li>
              </ul>
              <p className="mb-4">
                Los precios incluyen IVA cuando corresponda. Se emitirá boleta o factura 
                según solicitud del cliente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-mint to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-mint">7. Comunicaciones por WhatsApp</h2>
              <p className="mb-4">
                Al proporcionar tu número de WhatsApp, autorizas a Ale Veterinaria a contactarte para:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Confirmar y recordar citas programadas</li>
                <li>Enviar resultados de exámenes médicos</li>
                <li>Proporcionar seguimiento médico</li>
                <li>Enviar recordatorios de vacunación</li>
              </ul>
              <p className="mb-4">
                Puedes optar por no recibir comunicaciones respondiendo "STOP" o contactándonos directamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-palerose to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-palerose">8. Limitación de responsabilidad</h2>
              <p className="mb-4">
                Ale Veterinaria se compromete a proporcionar servicios veterinarios profesionales 
                según los estándares de la medicina veterinaria. Sin embargo:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>No garantizamos resultados médicos específicos</li>
                <li>La responsabilidad está limitada al valor de los servicios prestados</li>
                <li>No somos responsables por daños indirectos o consecuenciales</li>
                <li>Los tratamientos siguen protocolos veterinarios estándar</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-lavender to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-lavender">9. Confidencialidad médica</h2>
              <p className="mb-4">
                Toda información médica de tu mascota se mantiene confidencial según las 
                normas éticas veterinarias. Solo se comparte información cuando:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Sea requerido por ley</li>
                <li>Tengas consentimiento explícito</li>
                <li>Sea necesario para emergencias médicas</li>
                <li>Se transfiera a otro veterinario con tu autorización</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-turquoise to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-turquoise">10. Modificaciones del servicio</h2>
              <p className="mb-4">
                Nos reservamos el derecho de modificar, suspender o discontinuar cualquier 
                aspecto del servicio con previo aviso cuando sea posible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-mint to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-mint">11. Ley aplicable</h2>
              <p className="mb-4">
                Estos términos se rigen por las leyes de Chile. Cualquier disputa se 
                resolverá en los tribunales competentes de Santiago, Chile.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4 bg-gradient-to-r from-palerose to-darkgray px-6 py-4 rounded-xl shadow-lg border-2 border-palerose">12. Contacto</h2>
              <p className="mb-4">
                Para consultas sobre estos términos de servicio:
              </p>
              <div className="bg-gradient-to-r from-lavender/20 to-palerose/20 p-6 rounded-xl border-2 border-lavender shadow-lg">
                <p className="font-poppins font-bold text-xl text-lavender">Ale Veterinaria</p>
                <p className="font-lato text-darkgray font-semibold">Dra. Alejandra Cautín Bastías</p>
                <p className="font-lato text-darkgray font-bold text-lg"><i className="fas fa-envelope mr-3 text-lavender text-xl"></i>contacto@aleveterinaria.cl</p>
                <p className="font-lato text-darkgray font-bold text-lg"><i className="fab fa-whatsapp mr-3 text-lavender text-xl"></i>+56 9 7604 0797</p>
                <p className="font-lato text-darkgray font-bold text-lg"><i className="fas fa-map-marker-alt mr-3 text-lavender text-xl"></i>Santiago, Chile</p>
              </div>
            </section>

            <section className="mb-8">
              <p className="text-sm text-gray-600">
                Al utilizar los servicios de Ale Veterinaria, confirmas que has leído, 
                entendido y aceptado estos términos y condiciones.
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
                <li><a href="/privacy-policy" className="hover:text-mint transition-colors text-base">Política de Privacidad</a></li>
                <li><a href="/terms-of-service" className="hover:text-lavender transition-colors font-bold text-base">Términos de Servicio</a></li>
                <li><a href="/data-deletion" className="hover:text-turquoise transition-colors text-base">Eliminación de Datos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-poppins font-bold mb-4 text-white text-lg">Contacto</h4>
              <ul className="space-y-3 text-gray-100 font-lato font-bold">
                <li><i className="fab fa-whatsapp mr-3 text-lavender text-lg"></i>+56 9 7604 0797</li>
                <li><i className="fas fa-envelope mr-3 text-lavender text-lg"></i>contacto@aleveterinaria.cl</li>
                <li><i className="fab fa-instagram mr-3 text-lavender text-lg"></i>@aleveterinaria</li>
                <li><i className="fas fa-map-marker-alt mr-3 text-lavender text-lg"></i>Santiago, Chile</li>
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