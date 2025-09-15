import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovitexUltraImg from '../assets/services/MovitexUltra/MovitexUltra.png';
import MovitexUltraLogo from '../assets/services/MovitexUltra/MovitexUltra-Font.png';
import MovitexUltraServicio1 from '../assets/services/MovitexUltra/movitexultra-servicio (1).png';
import MovitexUltraServicio2 from '../assets/services/MovitexUltra/movitexultra-servicio (2).png';
import MovitexUltraServicio3 from '../assets/services/MovitexUltra/movitexultra-servicio (3).png';
import MovitexUltraServicio4 from '../assets/services/MovitexUltra/movitexultra-servicio (4).png';
import { BusFront, RockingChair, Clapperboard, MapPinned, Toilet, Gauge, Wind, Zap, Layers, Tv } from 'lucide-react';

const MovitexUltra = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [busAnimationStart, setBusAnimationStart] = useState(false);

  useEffect(() => {
    // Iniciar animaciones después de que el componente se monte
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setBusAnimationStart(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      
      <section className="relative h-80 mt-16 flex items-center justify-center overflow-hidden">
        {/* Fondo con gradiente diagonal dividido animado */}
        <div className="absolute inset-0">
          {/* Sección izquierda - Negro Ultra con animación */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-[#1C1A1A] via-[#2a2626] to-[#1C1A1A] transition-all duration-1000 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-80 scale-105'
            }`}
            style={{
              backgroundSize: '200% 100%',
              animation: isLoaded ? 'gradientShiftUltra 4s ease-in-out infinite' : 'none'
            }}
          ></div>
          
          {/* Forma geométrica angular para dividir con animación */}
          <div className="absolute inset-0">
            <svg 
              className={`w-full h-full transition-transform duration-1000 ${
                isLoaded ? 'scale-100 rotate-0' : 'scale-110 rotate-1'
              }`} 
              viewBox="0 0 1620 320" 
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="rightGradientUltra" x1="10%" y1="10%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="animatedGradientUltra" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    values="0 0; 50 0; 0 0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </linearGradient>
              </defs>
              <polygon 
                points="1200,0 1920,0 1920,320 800,320" 
                fill={isLoaded ? "url(#animatedGradientUltra)" : "url(#rightGradientUltra)"}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>

        {/* Añadir keyframes CSS para todas las animaciones */}
        <style jsx>{`
          @keyframes gradientShiftUltra {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes speedLinesReverseUltra {
            0% { 
              opacity: 0;
              transform: translateX(20px) scaleX(0);
            }
            50% { 
              opacity: 1;
              transform: translateX(0px) scaleX(1);
            }
            100% { 
              opacity: 0;
              transform: translateX(-40px) scaleX(0.5);
            }
          }
        `}</style>

        {/* Contenido principal */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 items-center h-full">
            
            {/* Sección izquierda - Texto (7 columnas) */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Logo principal con animación */}
              <div 
                className={`mb-4 transform transition-all duration-1000 ${
                  isLoaded ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-8 opacity-0 scale-95'
                }`}
              >
                <img 
                  src={MovitexUltraLogo} 
                  alt="Movitex Ultra Logo" 
                  className="h-12 mx-auto lg:mx-0 drop-shadow-2xl"
                />
              </div>

              {/* Eslogan con animación */}
              <div 
                className={`mb-6 transform transition-all duration-1000 delay-300 ${
                  isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
                }`}
              >
                <p className="text-sm md:text-base lg:text-lg text-white font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow-lg">
                  La experiencia de lujo definitiva. Viaja como nunca antes lo habías imaginado.
                </p>
              </div>
            </div>

            {/* Sección derecha - Imagen del bus (5 columnas) */}
            <div className="lg:col-span-5 relative">
              <div className="relative overflow-hidden">
                {/* Bus con animación de entrada desde la derecha */}
                <div 
                  className={`transform transition-all duration-2000 ease-out ${
                    busAnimationStart 
                      ? 'translate-x-0 opacity-100 scale-100' 
                      : 'translate-x-[150%] opacity-0 scale-90'
                  }`}
                  style={{
                    transitionDelay: '600ms'
                  }}
                >
                  <img 
                    src={MovitexUltraImg} 
                    alt="Movitex Ultra Bus" 
                    className="w-full mx-auto drop-shadow-xl hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Efecto de polvo/humo detrás del bus */}
                <div 
                  className={`absolute bottom-0 right-0 w-32 h-8 bg-gradient-to-l from-transparent via-gray-400/40 to-transparent rounded-full blur-sm transform transition-all duration-2000 ${
                    busAnimationStart 
                      ? 'translate-x-0 opacity-60' 
                      : 'translate-x-[200%] opacity-0'
                  }`}
                  style={{
                    transitionDelay: '800ms'
                  }}
                ></div>

                {/* Líneas de velocidad animadas desde la derecha */}
                <div 
                  className={`absolute top-1/2 right-0 w-full h-1 transform -translate-y-1/2 ${
                    busAnimationStart ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div 
                    className="absolute top-0 right-0 w-8 h-0.5 bg-white/50 rounded-full"
                    style={{
                      animation: busAnimationStart ? 'speedLinesReverseUltra 1.5s ease-out 1s' : 'none'
                    }}
                  ></div>
                  <div 
                    className="absolute top-2 right-4 w-6 h-0.5 bg-white/40 rounded-full"
                    style={{
                      animation: busAnimationStart ? 'speedLinesReverseUltra 1.5s ease-out 1.2s' : 'none'
                    }}
                  ></div>
                  <div 
                    className="absolute top-4 right-2 w-4 h-0.5 bg-white/30 rounded-full"
                    style={{
                      animation: busAnimationStart ? 'speedLinesReverseUltra 1.5s ease-out 1.4s' : 'none'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </section>

      {/* Sección de título */}
      <section className="py-8 sm:py-12 bg-white mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#f0251f] mb-3 sm:mb-4" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            Servicios Ultra Exclusivos
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            La experiencia de lujo definitiva en nuestros buses de doble piso. Cada servicio está diseñado 
            para superar las expectativas más exigentes y redefinir el concepto de viaje premium.
          </p>
        </div>
      </section>

      {/* Franja de servicios */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1C1A1A] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-4 sm:gap-6 lg:gap-8">
              <div className="flex flex-col items-center text-center">
                <Layers size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Buses de 2 pisos
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RockingChair size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Asientos 1er nivel
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RockingChair size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Asientos 2do nivel
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clapperboard size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Entretenimiento a bordo
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <MapPinned size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Monitoreo GPS las 24 hrs
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Tv size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  TV personal 2do nivel
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Toilet size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Servicios higiénicos
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Wind size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Aire climatizado
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Gauge size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Velocidad controlada
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Zap size={32} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white mb-2 sm:mb-3 lg:mb-4" />
                <p className="text-white font-medium text-xs sm:text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Cargador USB
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galería de imágenes */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Layout para escritorio */}
            <div className="hidden md:grid md:grid-cols-4 gap-6 lg:gap-10">
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio1}
                  alt="Movitex Ultra Servicio 1"
                  className="w-full h-auto object-cover rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio2}
                  alt="Movitex Ultra Servicio 2"
                  className="w-full h-auto object-cover rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio3}
                  alt="Movitex Ultra Servicio 3"
                  className="w-full h-auto object-cover rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio4}
                  alt="Movitex Ultra Servicio 4"
                  className="w-full h-auto object-cover rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
            </div>

            {/* Layout móvil - 2 filas y 2 columnas */}
            <div className="md:hidden grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio1}
                  alt="Movitex Ultra Servicio 1"
                  className="w-full h-auto object-cover rounded-xl shadow-md"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio2}
                  alt="Movitex Ultra Servicio 2"
                  className="w-full h-auto object-cover rounded-xl shadow-md"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio3}
                  alt="Movitex Ultra Servicio 3"
                  className="w-full h-auto object-cover rounded-xl shadow-md"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio4}
                  alt="Movitex Ultra Servicio 4"
                  className="w-full h-auto object-cover rounded-xl shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MovitexUltra;
