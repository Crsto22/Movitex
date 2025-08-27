import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovitexOneImg from '../assets/services/MovitexOne/MovitexOne.png';
import MovitexOneLogo from '../assets/services/MovitexOne/MovitexOne-Font.png';
import MovitexOneServicio1 from '../assets/services/MovitexOne/movitexone-servicio (1).png';
import MovitexOneServicio2 from '../assets/services/MovitexOne/movitexone-servicio (2).png';
import MovitexOneServicio3 from '../assets/services/MovitexOne/movitexone-servicio (3).png';
import MovitexOneServicio4 from '../assets/services/MovitexOne/movitexone-servicio (4).png';
import { BusFront, RockingChair, Clapperboard, MapPinned, Toilet, Gauge } from 'lucide-react';

const MovitexOne = () => {
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
          {/* Sección izquierda - Amarillo Movitex con animación */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-[#fab926] via-[#f0c04a] to-[#fab926] transition-all duration-1000 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-80 scale-105'
            }`}
            style={{
              backgroundSize: '200% 100%',
              animation: isLoaded ? 'gradientShift 4s ease-in-out infinite' : 'none'
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
                <linearGradient id="rightGradient" x1="10%" y1="10%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                fill={isLoaded ? "url(#animatedGradient)" : "url(#rightGradient)"}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>

        {/* Añadir keyframes CSS para todas las animaciones */}
        <style jsx>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes speedLines {
            0% { 
              opacity: 0;
              transform: translateX(-20px) scaleX(0);
            }
            50% { 
              opacity: 1;
              transform: translateX(0px) scaleX(1);
            }
            100% { 
              opacity: 0;
              transform: translateX(40px) scaleX(0.5);
            }
          }
          
          @keyframes speedLinesReverse {
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
          
          @keyframes busVibration {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-1px); }
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
                  src={MovitexOneLogo}
                  alt="Movitex One Logo"
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
                  Viaja con todas las comodidades al mejor precio para tu bolsillo.
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
                    src={MovitexOneImg}
                    alt="Movitex One Bus"
                    className="w-full mx-auto drop-shadow-xl hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Efecto de polvo/humo detrás del bus */}
                <div 
                  className={`absolute bottom-0 right-0 w-32 h-8 bg-gradient-to-l from-transparent via-gray-300/30 to-transparent rounded-full blur-sm transform transition-all duration-2000 ${
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
                    className="absolute top-0 right-0 w-8 h-0.5 bg-white/40 rounded-full"
                    style={{
                      animation: busAnimationStart ? 'speedLinesReverse 1.5s ease-out 1s' : 'none'
                    }}
                  ></div>
                  <div 
                    className="absolute top-2 right-4 w-6 h-0.5 bg-white/30 rounded-full"
                    style={{
                      animation: busAnimationStart ? 'speedLinesReverse 1.5s ease-out 1.2s' : 'none'
                    }}
                  ></div>
                  <div 
                    className="absolute top-4 right-2 w-4 h-0.5 bg-white/20 rounded-full"
                    style={{
                      animation: busAnimationStart ? 'speedLinesReverse 1.5s ease-out 1.4s' : 'none'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* Sección de título */}
      <section className="py-12 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl text-[#f0251f] mb-4" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            Servicios Esenciales Movitex One
          </h2>
          <p className="text-gray-600 max-w-4xl mx-auto" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            La mejor relación entre precio y calidad para tus viajes. Disfruta de comodidades esenciales 
            y servicios confiables que hacen de cada trayecto una experiencia agradable y segura.
          </p>
        </div>
      </section>



      {/* Franja de servicios */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f0251f] rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
              <div className="flex flex-col items-center text-center">
                <BusFront size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}  >
                  Buses de 1 piso
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RockingChair size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Asientos reclinables 140°
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clapperboard size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Entretenimiento a bordo
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <MapPinned size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Monitoreo GPS las 24 hrs
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Toilet size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Servicios higiénicos
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Gauge size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Velocidad controlada
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
             {/* Galería de imágenes */}
       <section className="py-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="p-8">
             <div className="grid grid-cols-4 gap-10">
               <div className="flex justify-center">
                 <img
                   src={MovitexOneServicio1}
                   alt="Movitex One Servicio 1"
                   className="w-full h-auto object-cover rounded-3xl"
                 />
               </div>
               <div className="flex justify-center">
                 <img
                   src={MovitexOneServicio2}
                   alt="Movitex One Servicio 2"
                   className="w-full h-auto object-cover rounded-3xl"
                 />
               </div>
               <div className="flex justify-center">
                 <img
                   src={MovitexOneServicio3}
                   alt="Movitex One Servicio 3"
                   className="w-full h-auto object-cover rounded-3xl"
                 />
               </div>
               <div className="flex justify-center">
                 <img
                   src={MovitexOneServicio4}
                   alt="Movitex One Servicio 4"
                   className="w-full h-auto object-cover rounded-3xl"
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

export default MovitexOne;
