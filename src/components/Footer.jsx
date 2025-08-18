import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
import LogoBN from '../assets/LogoBN.png';
const Footer = () => {
  return (
    <footer className="bg-[#f0251f] text-white ">
      {/* Sección principal del footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center">
              <img 
                src={LogoBN} 
                alt="Movitex Logo" 
                className="h-32 object-contain "
              />
            </div>
            <p className="text-white text-sm leading-relaxed mb-4">
              Tu compañía de confianza para viajar por todo el Perú. 44 años brindando 
              las mejores experiencias de viaje con seguridad y comodidad.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-[#fab926] rounded-full flex items-center justify-center hover:bg-[#fab926] transition-colors duration-200"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-[#fab926] rounded-full flex items-center justify-center hover:bg-[#fab926] transition-colors duration-200"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-[#fab926] rounded-full flex items-center justify-center hover:bg-[#fab926] transition-colors duration-200"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 
              className="text-lg font-bold mb-4" 
              style={{ fontFamily: 'MusticaPro, sans-serif', color: '#fab926' }}
            >
              Enlaces rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#destinos" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Destinos
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#rastreo" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Rastrea tu envío
                </a>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 
              className="text-lg font-bold mb-4" 
              style={{ fontFamily: 'MusticaPro, sans-serif', color: '#fab926' }}
            >
              Servicios
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Transporte de pasajeros
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Encomiendas
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Servicios corporativos
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#fab926] transition-colors duration-200 text-sm">
                  Tours y excursiones
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 
              className="text-lg font-bold mb-4" 
              style={{ fontFamily: 'MusticaPro, sans-serif', color: '#fab926' }}
            >
              Contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#f0251f] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm">
                    Av. Principal 123, Lima - Perú
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#f0251f] flex-shrink-0" />
                <p className="text-white text-sm">
                  +51 1 234-5678
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#f0251f] flex-shrink-0" />
                <p className="text-white text-sm">
                  info@movitex.com.pe
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#f0251f] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm">
                    Lun - Dom: 24 horas
                  </p>
                  <p className="text-white text-xs">
                    Atención al cliente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Línea separadora */}
      <div className="border-t border-white"></div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-white text-sm">
              © 2024 Movitex. Todos los derechos reservados.
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center md:text-right">
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 justify-center md:justify-end">
              <a href="#" className="text-white hover:text-[#fab926] text-sm transition-colors duration-200">
                Términos y condiciones
              </a>
              <a href="#" className="text-white hover:text-[#fab926] text-sm transition-colors duration-200">
                Política de privacidad
              </a>
              <a href="#" className="text-white hover:text-[#fab926] text-sm transition-colors duration-200">
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
