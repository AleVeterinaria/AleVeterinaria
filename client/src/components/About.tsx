const About = () => {
  return (
    <section id="quien-soy" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-poppins font-bold text-darkgray mb-6">Dra. Alejandra Cautín Bastías</h2>
            
            <div className="space-y-4 text-lg text-gray-600 font-lato leading-relaxed">
              <p>
                Médico veterinaria de la Universidad de Chile y certificada Fear Free, comprometida con el bienestar físico y emocional de perros y gatos. Durante mis años de experiencia he aprendido que la medicina veterinaria no es solo tratar enfermedades, sino también cuidar vínculos y generar confianza entre el paciente, su familia y yo.
              </p>
              
              <p>
                Como tutora de perros y gatos, sé lo que significa preocuparse, amar y luchar por la calidad de vida de nuestros compañeros de cuatro patas. Esta experiencia personal guía mi forma de trabajar y me recuerda que cada animal merece ser escuchado, respetado y cuidado con calma.
              </p>
              
              <p>
                Mi enfoque es respetuoso, seguro y amoroso: jamás forzaré una revisión. Si un procedimiento o exploración no es posible en ese momento, buscamos juntos otra forma de acercarnos o reprogramamos la atención, siempre priorizando el bienestar del paciente.
              </p>
              
              <p>
                Para mantener esta conexión y brindar una atención realmente personalizada, decidí dedicarme a la atención domiciliaria. Así, mis pacientes están en un entorno conocido y seguro, y yo puedo dedicarles el tiempo que merecen, sin la presión de tener que apresurarnos por la agenda de otros pacientes.
              </p>
              
              <p className="font-semibold text-darkgray">
                Mi compromiso es entregar medicina de calidad sin perder la calidez, cuidando no solo la salud de tu mascota, sino también la relación y la confianza que construimos juntos.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-center space-x-4">
                <div className="bg-mint p-3 rounded-full">
                  <i className="fas fa-graduation-cap text-darkgray text-xl"></i>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-darkgray">Veterinaria Universidad de Chile</h4>
                  <p className="text-gray-600 font-lato">Médico veterinaria</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-lavender p-3 rounded-full">
                  <i className="fas fa-certificate text-darkgray text-xl"></i>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-darkgray">Certificada Fear Free</h4>
                  <p className="text-gray-600 font-lato">Bienestar físico y emocional</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Dra. María González veterinaria" 
              className="rounded-3xl shadow-2xl w-full h-auto" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
