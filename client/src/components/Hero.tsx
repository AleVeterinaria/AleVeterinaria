import fearFreeLogo from "@assets/FF Certified Professional Logo jpg_1755132258911.jpg";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative" style={{ backgroundColor: '#FAF6F2' }}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Columna texto */}
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl/tight font-bold sm:text-5xl" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
              Dra. Alejandra<br className="hidden sm:block" /> Cautín Bastías
            </h1>

            {/* Subtítulo cálido */}
            <p className="mt-3 text-xl font-medium" style={{ color: '#000000', fontFamily: 'Lato, sans-serif' }}>
              Atención a domicilio
            </p>

            {/* Lema Fear Free - Más destacado */}
            <p className="mt-2 text-xl font-bold italic" style={{ color: '#5FA98D', fontFamily: 'Poppins, sans-serif' }}>
              Sin miedo. Sin estrés. Con bienestar y ciencia.
            </p>

            {/* Propuesta de valor principal */}
            <p className="mt-4 text-lg leading-relaxed" style={{ color: '#374151', fontFamily: 'Lato, sans-serif' }}>
              Veterinaria a domicilio con un enfoque <span className="font-semibold" style={{ color: '#5FA98D' }}>Fear Free</span> y medicina preventiva
            </p>

            {/* Cita inspiracional */}
            <p className="mt-4 italic text-neutral-600" style={{ fontFamily: 'Lato, sans-serif' }}>
              "Cuidar no es solo curar; es acompañar con conciencia."
            </p>

            {/* CTA: Jerarquía mejorada con CTA principal destacado */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* CTA Principal - Mint Green vibrante */}
              <button
                onClick={() => scrollToSection('agendar')}
                className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-white font-bold shadow-lg
                          hover:shadow-xl focus:outline-none focus:ring-4 transition transform hover:scale-105"
                style={{ 
                  backgroundColor: '#5FA98D', 
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 10px 25px rgba(95, 169, 141, 0.4)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4D8B6B'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5FA98D'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 2v2H8V2H6v2H5a2 2 0 0 0-2 2v3h18V6a2 2 0 0 0-2-2h-1V2h-2zM3 20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11H3v9z"/>
                </svg>
                Agendar Consulta
              </button>

              {/* CTAs Secundarios - Lila en contorno */}
              <button
                onClick={() => scrollToSection('servicios')}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 font-semibold
                          hover:bg-opacity-10 focus:outline-none focus:ring-4 transition"
                style={{ 
                  borderColor: '#5FA98D', 
                  color: '#5FA98D',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(95, 169, 141, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Ver Servicios
              </button>

              <button
                onClick={() => scrollToSection('portales')}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 font-semibold
                          hover:bg-opacity-10 focus:outline-none focus:ring-4 transition"
                style={{ 
                  borderColor: '#5FA98D', 
                  color: '#5FA98D',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(95, 169, 141, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Acceder a Portal
              </button>

              {/* Señal de confianza resumida con mint green */}
              <div className="mt-2 flex items-center gap-3 text-sm" style={{ color: '#374151', fontFamily: 'Lato, sans-serif' }}>
                <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#5FA98D' }}></span>
                Atención en tu hogar · Región Metropolitana
              </div>
            </div>
          </div>

          {/* Columna imagen */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-xl">
              <img
                src="https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=1400&auto=format&fit=crop"
                alt="Perro pequeño feliz en pasto, tranquilo durante su consulta a domicilio"
                className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[0_20px_80px_-20px_rgba(0,0,0,0.3)]"
              />

              {/* Badge Fear Free integrado al componente, no 'pegoteado' */}
              <div className="absolute -bottom-6 right-6">
                <div className="rounded-2xl bg-white/90 backdrop-blur p-3 shadow-lg ring-1 ring-black/5">
                  <img 
                    src={fearFreeLogo}
                    alt="Fear Free Certified Professional" 
                    className="h-8 w-auto object-contain" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default Hero;