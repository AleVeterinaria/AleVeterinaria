import { useState } from 'react';

const FAQ = () => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "¿Cuándo debo solicitar una visita a domicilio?",
      answer: "Cuando tu mascota necesite chequeo general, vacunación, desparasitación, control de tratamiento, toma de muestras, certificados de salud o acompañamiento en cuidados paliativos. También para revisiones preventivas en cachorros, animales senior o mascotas que se estresan en la clínica.",
      gradient: "from-turquoise to-mint",
      textColor: "text-darkgray"
    },
    {
      question: "¿Cuándo se considera una emergencia y debo acudir a una clínica?",
      answer: "Es una emergencia si presenta: dificultad respiratoria o asfixia, sangrado abundante o hemorragia que no cede, convulsiones o pérdida de conciencia, envenenamiento o ingestión de objetos peligrosos, fracturas expuestas o trauma grave. En estos casos, acude de inmediato a una clínica veterinaria 24/7.",
      gradient: "from-lavender to-palerose",
      textColor: "text-darkgray"
    },
    {
      question: "¿Qué ventajas tiene la atención a domicilio?",
      answer: "Evita el transporte y la sala de espera, reduce el estrés, y permite atender en el entorno seguro de tu mascota, favoreciendo una revisión más completa y tranquila.",
      gradient: "from-palerose to-turquoise",
      textColor: "text-darkgray"
    },
    {
      question: "¿Qué es el manejo Fear Free y cómo lo aplica?",
      answer: "Es un enfoque para reducir el miedo, la ansiedad y el estrés durante la atención veterinaria. Utilizamos movimientos suaves, evitamos el contacto brusco, ofrecemos snacks seguros, feromonas y permitimos que la mascota marque el ritmo de la interacción. Además, Fear Free también busca proteger el bienestar y la seguridad del equipo veterinario, asegurando que la atención se realice en un entorno seguro y respetuoso para todos.",
      gradient: "from-mint to-lavender",
      textColor: "text-darkgray"
    },
    {
      question: "¿Qué es la premedicación y cuándo se usa?",
      answer: "En algunos pacientes nerviosos, agresivos o muy ansiosos, se recomienda administrar previamente un medicamento suave para disminuir el estrés y facilitar la atención sin poner en riesgo su bienestar ni el del equipo. Esto se indica solo tras una evaluación profesional y con la dosis adecuada.",
      gradient: "from-turquoise to-palerose",
      textColor: "text-darkgray"
    },
    {
      question: "¿Debo pagar un abono previo para agendar?",
      answer: "Sí. Para confirmar tu cita solicitamos un abono que se descuenta del valor total de la consulta. Este pago asegura tu hora y nos permite reservar el tiempo y los insumos necesarios para tu mascota.",
      gradient: "from-lavender to-turquoise",
      textColor: "text-darkgray"
    },
    {
      question: "¿Cuál es la política de cancelación?",
      answer: "Si cancelas con al menos 24 horas de anticipación, puedes reagendar tu visita sin costo. Cancelaciones con menos de 24 horas o inasistencias implican la pérdida del abono.",
      gradient: "from-mint to-palerose",
      textColor: "text-darkgray"
    },
    {
      question: "¿Cómo debo preparar a mi mascota para la visita?",
      answer: "Mantenerla en un espacio tranquilo y seguro. En gatos, usar transportadora o habitación cerrada. Tener carnet de vacunas y antecedentes médicos. Seguir las indicaciones previas, como ayuno si se tomarán muestras.",
      gradient: "from-palerose to-lavender",
      textColor: "text-darkgray"
    },
    {
      question: "¿Qué pasa si mi mascota se pone muy nerviosa o agresiva?",
      answer: "Aplicamos técnicas Fear Free. Si no es posible continuar, podemos reagendar o sugerir premedicación para una futura visita, siempre priorizando la seguridad y el bienestar de todos.",
      gradient: "from-turquoise to-mint",
      textColor: "text-darkgray"
    },
    {
      question: "¿Atienden a más de una mascota en la misma visita?",
      answer: "Sí, siempre que lo indiques al agendar, para llevar el material necesario y ajustar el tiempo de atención.",
      gradient: "from-lavender to-mint",
      textColor: "text-darkgray"
    },
    {
      question: "¿Qué formas de pago aceptan?",
      answer: "Transferencia bancaria, efectivo y algunos métodos electrónicos. El pago se realiza al finalizar la atención, descontando el abono previo.",
      gradient: "from-mint to-turquoise",
      textColor: "text-darkgray"
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-poppins font-bold text-darkgray mb-4">Preguntas Frecuentes</h2>
          <p className="text-xl text-gray-600">Resolvemos las dudas más comunes sobre nuestros servicios veterinarios a domicilio</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className={`bg-gradient-to-r ${faq.gradient} p-6 rounded-xl shadow-lg`}>
              <button 
                className="w-full text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleQuestion(index)}
                data-testid={`faq-question-${index}`}
              >
                <h3 className={`text-xl font-poppins font-semibold ${faq.textColor}`}>{faq.question}</h3>
                <i className={`fas fa-chevron-down ${faq.textColor} transform transition-transform ${expandedQuestion === index ? 'rotate-180' : ''}`}></i>
              </button>
              {expandedQuestion === index && (
                <div className={`mt-4 ${faq.textColor} font-lato leading-relaxed`}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-elegant-surface p-6 rounded-2xl border border-elegant-accent/20">
            <h3 className="text-xl font-poppins font-semibold text-elegant-main mb-3">
              ¿Tienes más preguntas?
            </h3>
            <p className="text-elegant-muted mb-4">
              Contáctanos directamente para resolver cualquier duda específica sobre tu mascota
            </p>
            <a
              href="https://wa.me/56976040797?text=Hola,%20tengo%20una%20pregunta%20sobre%20los%20servicios%20veterinarios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
              data-testid="contact-whatsapp"
            >
              <i className="fab fa-whatsapp mr-2"></i>
              Preguntar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;