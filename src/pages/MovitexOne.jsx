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
  return (
    <div className="min-h-screen bg-white">
      <Navbar />


      <section className="relative h-80 mt-16 flex items-center justify-center overflow-hidden">
        {/* Fondo con gradiente diagonal dividido */}
        <div className="absolute inset-0">
          {/* Sección izquierda - Rojo Movitex */}
          <div className="absolute inset-0 bg-[#fab926]"></div>

          {/* Forma geométrica angular para dividir */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 1620 320" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="rightGradient" x1="10%" y1="10%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              <polygon
                points="1200,0 1920,0 1920,320 800,320"
                fill="url(#rightGradient)"
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
                  src={MovitexOneLogo}
                  alt="Movitex One Logo"
                  className="h-12 mx-auto lg:mx-0 drop-shadow-2xl"
                />
              </div>

              {/* Eslogan */}
              <div className="mb-6">
                <p className="text-sm md:text-base lg:text-lg text-white font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow-lg">
                  Viaja con todas las comodidades al mejor precio para tu bolsillo.
                </p>
              </div>
            </div>

            {/* Sección derecha - Imagen del bus (5 columnas) */}
            <div className="lg:col-span-5 relative">
              <div className="relative transform hover:scale-105 transition-transform duration-500">
                <img
                  src={MovitexOneImg}
                  alt="Movitex One Bus"
                  className="w-full  mx-auto drop-shadow-xl"
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
