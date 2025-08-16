import { useState, useEffect } from 'react';
import Logo from '../assets/Logo.png';
import Movitex from "../../public/Movitex.svg"
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-md' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y texto */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <img 
                src={Logo} 
                alt="Movitex Logo" 
                className="h-8  object-contain"
              />
             
            </div>
          </div>

          {/* Menú desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#inicio" 
              className="font-medium px-3 py-2 text-[#f0251f] hover:text-[#fab926]  rounded-md transition-colors duration-200"
            >
              Inicio
            </a>
            
                         <div className="relative group">
               <button 
                 className="font-medium px-3 py-2 rounded-md transition-colors duration-200 flex items-center text-[#fab926] hover:text-[#f0251f]"
               >
                 Servicios
                 <span className="ml-1 text-sm">▾</span>
               </button>
               {/* Dropdown opcional para servicios */}
               <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                 <div className="py-1">
                   <a href="#servicio1" className="block px-4 py-2 text-sm text-[#fab926] hover:text-[#f0251f] transition-colors duration-200">
                     Servicio 1
                   </a>
                   <a href="#servicio2" className="block px-4 py-2 text-sm text-[#fab926] hover:text-[#f0251f] transition-colors duration-200">
                     Servicio 2
                   </a>
                 </div>
               </div>
             </div>

                         <a 
               href="#contacto" 
               className="font-medium px-3 py-2 rounded-md transition-colors duration-200 text-[#fab926] hover:text-[#f0251f]"
             >
               Contacto
             </a>
          </div>

          {/* Icono circular y botón hamburguesa */}
          <div className="flex items-center space-x-4">
            {/* Icono circular con SVG */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
              style={{ backgroundColor: '#fab926' }}
            >
             <img src={Movitex} alt="Movitex" className="w-6 h-6" />
            </div>

            {/* Botón hamburguesa para móvil */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              style={{ color: '#fab926' }}
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                             <a 
                 href="#inicio" 
                 className="block px-3 py-2 rounded-md font-medium text-[#f0251f] hover:text-[#fab926] transition-colors duration-200"
               >
                 Inicio
               </a>
               
               <a 
                 href="#servicios" 
                 className="block px-3 py-2 rounded-md font-medium text-[#fab926] hover:text-[#f0251f] transition-colors duration-200"
               >
                 Servicios ▾
               </a>

               <a 
                 href="#contacto" 
                 className="block px-3 py-2 rounded-md font-medium text-[#fab926] hover:text-[#f0251f] transition-colors duration-200"
               >
                 Contacto
               </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
