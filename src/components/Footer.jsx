import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
import LogoBN from '../assets/LogoBN.png';
const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-[#f0251f] via-[#e63946] to-[#d62d20] text-white overflow-hidden mt-8 sm:mt-12 md:mt-16">
      {/* Fondo animado con ondas y puntos */}
      <div className="absolute inset-0">
        {/* Ondas de fondo */}
        <div className="absolute inset-0">
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Primera onda */}
            <path
              d="M0,400 C320,300 420,500 720,450 C1020,400 1120,300 1440,350 L1440,800 L0,800 Z"
              fill="rgba(250, 185, 38, 0.15)"
              className="animate-pulse"
            />
            {/* Segunda onda */}
            <path
              d="M0,500 C360,400 480,600 840,550 C1200,500 1320,400 1440,450 L1440,800 L0,800 Z"
              fill="rgba(250, 185, 38, 0.25)"
            />
            {/* Tercera onda */}
            <path
              d="M0,600 C300,500 500,700 900,650 C1300,600 1400,500 1440,550 L1440,800 L0,800 Z"
              fill="rgba(240, 37, 31, 0.2)"
            />
          </svg>
        </div>

        {/* Puntos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Punto 1 */}
          <div 
            className="absolute w-3 h-3 bg-[#fab926] rounded-full opacity-70 animate-pulse"
            style={{ 
              top: '15%', 
              right: '20%',
              animationDelay: '0s',
              animationDuration: '3s'
            }}
          />
          {/* Punto 2 */}
          <div 
            className="absolute w-2 h-2 bg-white rounded-full opacity-50 animate-pulse"
            style={{ 
              top: '25%', 
              right: '15%',
              animationDelay: '1s',
              animationDuration: '4s'
            }}
          />
          {/* Punto 3 */}
          <div 
            className="absolute w-4 h-4 bg-[#fab926] rounded-full opacity-60 animate-pulse"
            style={{ 
              top: '40%', 
              right: '85%',
              animationDelay: '2s',
              animationDuration: '5s'
            }}
          />
          {/* Punto 4 */}
          <div 
            className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-pulse"
            style={{ 
              top: '60%', 
              right: '25%',
              animationDelay: '0.5s',
              animationDuration: '3.5s'
            }}
          />
          {/* Punto 5 */}
          <div 
            className="absolute w-2.5 h-2.5 bg-[#fab926] rounded-full opacity-55 animate-pulse"
            style={{ 
              top: '70%', 
              right: '75%',
              animationDelay: '1.5s',
              animationDuration: '4.5s'
            }}
          />
          {/* Punto 6 */}
          <div 
            className="absolute w-3.5 h-3.5 bg-white rounded-full opacity-45 animate-pulse"
            style={{ 
              top: '35%', 
              right: '50%',
              animationDelay: '2.5s',
              animationDuration: '6s'
            }}
          />
        </div>

        {/* Gradiente overlay para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0251f] via-transparent to-transparent opacity-40" />
      </div>
      {/* Sección principal del footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 md:gap-8">
          
          {/* Logo y descripción */}
          <div className="lg:col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start mb-3 sm:mb-4">
              <img 
                src={LogoBN} 
                alt="Movitex Logo" 
                className="h-16 sm:h-20 md:h-24 lg:h-28 object-contain"
              />
            </div>
            <p className="text-white text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 px-2 sm:px-0" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
              Tu compañía de confianza para viajar por todo el Perú. 5 años brindando 
              las mejores experiencias de viaje con seguridad y comodidad.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-3 sm:space-x-4 justify-center sm:justify-start">
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-[#fab926] rounded-full flex items-center justify-center hover:bg-yellow-500 active:scale-95 transition-all duration-200 shadow-lg"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-[#fab926] rounded-full flex items-center justify-center hover:bg-yellow-500 active:scale-95 transition-all duration-200 shadow-lg"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-[#fab926] rounded-full flex items-center justify-center hover:bg-yellow-500 active:scale-95 transition-all duration-200 shadow-lg"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="text-center sm:text-left mt-6 sm:mt-0">
            <h3 
              className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4" 
              style={{ fontFamily: 'MusticaPro, sans-serif', color: '#fab926' }}
            >
              Enlaces rápidos
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a href="#inicio" className="text-white hover:text-[#fab926] active:text-yellow-400 transition-colors duration-200 text-sm sm:text-base inline-block" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Inicio
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-white hover:text-[#fab926] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Servicios
                </a>
              </li>
              <li>
                <a href="#destinos" className="text-white hover:text-[#fab926] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Destinos
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-white hover:text-[#fab926] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Contacto
                </a>
              </li>
              <li>
                <a href="#rastreo" className="text-white hover:text-[#fab926] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Rastrea tu envío
                </a>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div className="text-center sm:text-left mt-6 sm:mt-0">
            <h3 
              className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4" 
              style={{ fontFamily: 'MusticaPro, sans-serif', color: '#fab926' }}
            >
              Servicios
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a href="#" className="text-white hover:text-[#fab926] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Transporte de pasajeros
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#fab926] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Encomiendas
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#fab926] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Servicios corporativos
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#fab926] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Tours y excursiones
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="text-center sm:text-left mt-6 sm:mt-0">
            <h3 
              className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4" 
              style={{ fontFamily: 'MusticaPro, sans-serif', color: '#fab926' }}
            >
              Contacto
            </h3>
            <div className="space-y-3 sm:space-y-3.5">
              <div className="flex items-start space-x-2 sm:space-x-3 justify-center sm:justify-start">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#fab926] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    Av. Principal 123, Lima - Perú
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 justify-center sm:justify-start">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#fab926] flex-shrink-0" />
                <p className="text-white text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  +51 1 234-5678
                </p>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 justify-center sm:justify-start">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#fab926] flex-shrink-0" />
                <p className="text-white text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  info@movitex.com.pe
                </p>
              </div>
              
              <div className="flex items-start space-x-2 sm:space-x-3 justify-center sm:justify-start">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#fab926] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    Lun - Dom: 24 horas
                  </p>
                  <p className="text-white text-xs" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    Atención al cliente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-t border-white/20">
        <div className="md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left mb-3 md:mb-0">
            <p className="text-white text-xs sm:text-sm md:text-base" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
              © 2025 Movitex. Todos los derechos reservados.
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className="flex flex-col sm:flex-row sm:space-x-3 md:space-x-4 lg:space-x-6 space-y-2 sm:space-y-0 justify-center md:justify-end">
              <a href="#" className="text-white hover:text-[#fab926] text-xs sm:text-sm transition-colors duration-200" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                Términos y condiciones
              </a>
              <a href="#" className="text-white hover:text-[#fab926] text-xs sm:text-sm transition-colors duration-200" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                Política de privacidad
              </a>
              <a href="#" className="text-white hover:text-[#fab926] text-xs sm:text-sm transition-colors duration-200" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                Libro de reclamaciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
