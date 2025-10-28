const Resources = () => {
  const pdfResources = [
    {
      title: "Administrar Medicación",
      description: "Guía para dar medicamentos a tu mascota usando premios y técnicas Fear Free",
      icon: "fas fa-pills",
      color: "text-lavender", 
      file: "/darle-medicacion-a-tu-animal.pdf"
    },
    {
      title: "Lenguaje Corporal",
      description: "Identifica signos de miedo, ansiedad y estrés en perros y gatos",
      icon: "fas fa-eye",
      color: "text-turquoise",
      file: "/lenguaje-corporal-miedo-ansiedad.pdf"
    },
    {
      title: "Perro Feliz y Satisfecho",
      description: "Cómo satisfacer las necesidades físicas, sociales y exploratorias de tu perro",
      icon: "fas fa-heart",
      color: "text-palerose",
      file: "/perro-satisfecho-es-perro-feliz.pdf"
    }
  ];

  const professionalLinks = [
    {
      title: "COLMEVET",
      description: "Colegio Médico Veterinario de Chile",
      icon: "fas fa-graduation-cap",
      color: "text-mint",
      url: "https://www.colmevet.cl/"
    },
    {
      title: "SAG Chile",
      description: "Servicio Agrícola y Ganadero",
      icon: "fas fa-shield-alt",
      color: "text-turquoise",
      url: "https://www.sag.cl/"
    },
    {
      title: "ISFM",
      description: "International Society of Feline Medicine - iCatCare Veterinary Society",
      icon: "fas fa-cat",
      color: "text-lavender",
      url: "https://icatcare.org/veterinary/isfm/"
    },
    {
      title: "Fear Free",
      description: "Técnicas de manejo libre de estrés para mascotas",
      icon: "fas fa-heart",
      color: "text-palerose",
      url: "https://www.fearfreehappyhomes.com/"
    },
    {
      title: "WSAVA",
      description: "World Small Animal Veterinary Association",
      icon: "fas fa-globe",
      color: "text-mint",
      url: "https://www.wsava.org/"
    }
  ];

  return (
    <section id="recursos" className="py-20 bg-warmbeige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-poppins font-bold text-darkgray mb-4">Recursos para Tutores</h2>
          <p className="text-xl text-darkgray font-bold">Guías Fear Free y enlaces profesionales para el cuidado de tu mascota</p>
        </div>

        {/* PDF Resources */}
        <div className="mb-16">
          <h3 className="text-2xl font-poppins font-bold text-darkgray mb-8 text-center">Guías Descargables Fear Free</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pdfResources.map((resource, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-200 rounded-full flex items-center justify-center shadow-lg`}>
                    <i className={`${resource.icon} text-3xl ${
                      resource.color === 'text-lavender' ? 'text-purple-600' :
                      resource.color === 'text-turquoise' ? 'text-teal-600' :
                      resource.color === 'text-palerose' ? 'text-rose-600' :
                      resource.color === 'text-mint' ? 'text-green-600' : 'text-gray-700'
                    }`}></i>
                  </div>
                  <h4 className="text-lg font-poppins font-bold text-darkgray mb-2">{resource.title}</h4>
                  <p className="text-sm text-darkgray font-lato font-bold mb-4">{resource.description}</p>
                </div>
                <a 
                  href={resource.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center w-full font-poppins font-bold hover:underline text-base ${
                    resource.color === 'text-lavender' ? 'text-purple-600' :
                    resource.color === 'text-turquoise' ? 'text-teal-600' :
                    resource.color === 'text-palerose' ? 'text-rose-600' :
                    resource.color === 'text-mint' ? 'text-green-600' : 'text-gray-700'
                  }`}
                  data-testid={`pdf-download-${index}`}
                >
                  <i className="fas fa-download mr-2 text-lg"></i>
                  Descargar PDF
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Links */}
        <div>
          <h3 className="text-2xl font-poppins font-bold text-darkgray mb-8 text-center">Enlaces Profesionales</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {professionalLinks.map((link, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-200 rounded-full flex items-center justify-center shadow-lg`}>
                  <i className={`${link.icon} text-3xl ${
                    link.color === 'text-mint' ? 'text-green-600' :
                    link.color === 'text-turquoise' ? 'text-teal-600' :
                    link.color === 'text-lavender' ? 'text-purple-600' :
                    link.color === 'text-palerose' ? 'text-rose-600' : 'text-gray-700'
                  }`}></i>
                </div>
                <h4 className="text-lg font-poppins font-bold text-darkgray mb-2">{link.title}</h4>
                <p className="text-sm text-darkgray font-lato font-bold mb-4">{link.description}</p>
                <a 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center font-poppins font-bold hover:underline text-base ${
                    link.color === 'text-mint' ? 'text-green-600' :
                    link.color === 'text-turquoise' ? 'text-teal-600' :
                    link.color === 'text-lavender' ? 'text-purple-600' :
                    link.color === 'text-palerose' ? 'text-rose-600' : 'text-gray-700'
                  }`}
                  data-testid={`external-link-${index}`}
                >
                  <i className="fas fa-external-link-alt mr-2 text-lg"></i>
                  Visitar sitio
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;
