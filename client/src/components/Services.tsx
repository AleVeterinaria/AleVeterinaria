import { useState } from 'react';

const Services = () => {
  const [expandedService, setExpandedService] = useState<number | null>(null);

  const toggleService = (index: number) => {
    setExpandedService(expandedService === index ? null : index);
  };
  const services = [
    {
      icon: "fas fa-stethoscope",
      title: "Consulta general",
      description: "Evaluación completa del estado de salud de tu mascota, diagnóstico de enfermedades y recomendación de tratamientos.",
      features: [
        "Examen físico sistemático completo",
        "Evaluación de signos vitales",
        "Diagnóstico de enfermedades",
        "Recomendación de tratamientos",
        "Historia clínica detallada",
        "Plan de seguimiento personalizado"
      ],
      gradient: "from-mint to-turquoise",
      textColor: "text-white"
    },
    {
      icon: "fas fa-syringe",
      title: "Vacunaciones",
      description: "Aplicación de vacunas esenciales para proteger a tu mascota contra enfermedades infecciosas comunes.",
      features: [
        "Vacunas esenciales según especie",
        "Protección contra enfermedades infecciosas",
        "Protocolos de inmunización",
        "Certificados de vacunación",
        "Calendario de refuerzos",
        "Asesoría sobre inmunización"
      ],
      gradient: "from-lavender to-palerose",
      textColor: "text-darkgray"
    },
    {
      icon: "fas fa-microchip",
      title: "Implantación de microchip",
      description: "Aplicación subcutánea de un microchip de identificación estándar, un método seguro y permanente para registrar a tu mascota.",
      features: [
        "Microchip de identificación estándar",
        "Aplicación subcutánea segura",
        "Registro permanente de mascota",
        "Procedimiento rápido y seguro",
        "Certificado de implantación",
        "Actualización de base de datos"
      ],
      gradient: "from-turquoise to-mint",
      textColor: "text-darkgray"
    },
    {
      icon: "fas fa-tint",
      title: "Exámenes de sangre",
      description: "Toma de muestras para perfiles bioquímicos, hemogramas y otros análisis para una evaluación interna completa.",
      features: [
        "Perfiles bioquímicos completos",
        "Hemogramas detallados",
        "Análisis hormonales",
        "Evaluación interna completa",
        "Toma profesional de muestras",
        "Interpretación de resultados"
      ],
      gradient: "from-palerose to-lavender",
      textColor: "text-darkgray"
    },
    {
      icon: "fas fa-heart",
      title: "Toma de presión arterial",
      description: "Medición no invasiva de la presión arterial, crucial para el monitoreo de pacientes con enfermedades cardíacas, renales o de la tercera edad.",
      features: [
        "Medición no invasiva",
        "Monitoreo cardíaco especializado",
        "Control de enfermedades renales",
        "Seguimiento en tercera edad",
        "Equipos especializados",
        "Interpretación profesional"
      ],
      gradient: "from-mint to-palerose",
      textColor: "text-darkgray"
    },
    {
      icon: "fas fa-file-medical",
      title: "Certificados de salud para viajes",
      description: "Emisión de certificados de salud necesarios para viajes nacionales e internacionales, asegurando que tu mascota cumple con todos los requisitos.",
      features: [
        "Certificados para viajes nacionales",
        "Documentación internacional",
        "Cumplimiento de requisitos",
        "Validación veterinaria oficial",
        "Asesoría en normativas",
        "Gestión de documentación"
      ],
      gradient: "from-lavender to-turquoise",
      textColor: "text-darkgray"
    },
    {
      icon: "fas fa-pills",
      title: "Desparasitaciones",
      description: "Administración de tratamientos para el control de parásitos internos y externos, fundamental para la salud de tu mascota y tu familia.",
      features: [
        "Control de parásitos internos",
        "Tratamiento de parásitos externos",
        "Protección familiar",
        "Calendarios preventivos",
        "Medicamentos especializados",
        "Educación sobre prevención"
      ],
      gradient: "from-palerose to-turquoise",
      textColor: "text-darkgray"
    },
    {
      icon: "fas fa-heart-broken",
      title: "Acompañamiento y homenaje final",
      description: "Un servicio compasivo y respetuoso para acompañarte en el difícil momento de la despedida, asegurando un final tranquilo y digno para tu fiel compañero.",
      features: [
        "Acompañamiento compasivo",
        "Servicio respetuoso",
        "Final tranquilo y digno",
        "Apoyo emocional",
        "Procedimiento humanizado",
        "Memoria de tu compañero"
      ],
      gradient: "from-gray-400 to-gray-600",
      textColor: "text-white"
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-poppins font-bold text-darkgray mb-4">Servicios</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Atención veterinaria personalizada en la comodidad de tu hogar
          </p>
          <div className="mt-6 flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <i className="fas fa-home text-mint mr-2"></i>
              <span>Atención domiciliaria</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-heart text-lavender mr-2"></i>
              <span>Bajos niveles de estrés para tu mascota</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-user-md text-turquoise mr-2"></i>
              <span>Dra. Alejandra Cautín</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${service.gradient} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer w-full sm:w-[300px] lg:w-[320px] min-h-[220px]`}
              onClick={() => toggleService(index)}
            >
              <div className={`${service.textColor} h-full flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <i className={`${service.icon} text-4xl`}></i>
                  <i className={`fas fa-chevron-${expandedService === index ? 'up' : 'down'} text-xl transition-transform`}></i>
                </div>
                <h3 className="text-2xl font-poppins font-semibold mb-4">{service.title}</h3>
                
                {expandedService === index && (
                  <div className="mt-4 border-t border-white/20 pt-4">
                    <p className="font-lato leading-relaxed">{service.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
