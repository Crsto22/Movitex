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
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      
      <section className="relative h-80 mt-16 flex items-center justify-center overflow-hidden">
        {/* Fondo con gradiente diagonal dividido */}
        <div className="absolute inset-0">
          {/* Sección izquierda - Amarillo Movitex */}
          <div className="absolute inset-0 bg-[#1C1A1A]"></div>
          
          {/* Forma geométrica angular para dividir */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 1620 320" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="rightGradientUltra" x1="10%" y1="10%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              <polygon 
                points="1200,0 1920,0 1920,320 800,320" 
                fill="url(#rightGradientUltra)"
              />
            </svg>
            
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 items-center h-full">
            
            {/* Sección izquierda - Texto (7 columnas) */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Logo principal */}
              <div className="mb-4">
                <img 
                  src={MovitexUltraLogo} 
                  alt="Movitex Ultra Logo" 
                  className="h-12 mx-auto lg:mx-0 drop-shadow-2xl"
                />
              </div>

              {/* Eslogan */}
              <div className="mb-6">
                <p className="text-sm md:text-base lg:text-lg text-white font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow-lg">
                  La experiencia de lujo definitiva. Viaja como nunca antes lo habías imaginado.
                </p>
              </div>
            </div>

            {/* Sección derecha - Imagen del bus (5 columnas) */}
            <div className="lg:col-span-5 relative">
              <div className="relative transform hover:scale-105 transition-transform duration-500">
                <img 
                  src={MovitexUltraImg} 
                  alt="Movitex Ultra Bus" 
                  className="w-full mx-auto drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        
      </section>

      {/* Sección de título */}
      <section className="py-12 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl text-[#f0251f] mb-4" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            Servicios Ultra Exclusivos
          </h2>
          <p className="text-gray-600 max-w-4xl mx-auto" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            La experiencia de lujo definitiva en nuestros buses de doble piso. Cada servicio está diseñado 
            para superar las expectativas más exigentes y redefinir el concepto de viaje premium.
          </p>
        </div>
      </section>

      {/* Franja de servicios */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1C1A1A] rounded-2xl p-8">
            <div className="grid grid-cols-10 gap-8">
              <div className="flex flex-col items-center text-center">
                <Layers size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Buses de 2 pisos
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RockingChair size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Asientos 1er nivel
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RockingChair size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Asientos 2do nivel
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
                <Tv size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  TV personal 2do nivel
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Toilet size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Servicios higiénicos
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Wind size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Aire climatizado
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Gauge size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Velocidad controlada
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Zap size={40} className="text-white mb-4" />
                <p className="text-white font-medium text-sm leading-tight" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Cargador USB
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
                  src={MovitexUltraServicio1}
                  alt="Movitex Ultra Servicio 1"
                  className="w-full h-auto object-cover rounded-3xl"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio2}
                  alt="Movitex Ultra Servicio 2"
                  className="w-full h-auto object-cover rounded-3xl"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio3}
                  alt="Movitex Ultra Servicio 3"
                  className="w-full h-auto object-cover rounded-3xl"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={MovitexUltraServicio4}
                  alt="Movitex Ultra Servicio 4"
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

export default MovitexUltra;
