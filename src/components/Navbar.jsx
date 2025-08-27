import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import Movitex from "../assets/Movitex.svg";
import LoginModal from './LoginModal';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 rounded-b-full  ${
      isScrolled 
        ? 'bg-white shadow-xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-36">
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
                                     <Link 
              to="/inicio" 
              className=" px-3 py-2 text-[#f0251f] hover:text-black rounded-md font-bold transition-colors duration-200"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Inicio
            </Link>
            
                         <div className="relative group">
               <button 
                 className="px-3 py-2 rounded-md transition-colors cursor-pointer font-bold duration-200 flex items-center text-[#f0251f] hover:text-black "
                 style={{ fontFamily: 'MusticaPro, sans-serif' }}
               >
                 Servicios
                 <span className="ml-1 text-sm">▾</span>
               </button>
               {/* Dropdown opcional para servicios */}
               <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                 <div className="py-1">
                   <Link to="/MovitexOne" style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block px-4 py-2 text-sm text-[#f0251f] hover:bg-gray-50 transition-colors duration-200">
                     Movitex <span style={{ fontFamily: 'MusticaPro, sans-serif' }} className="text-[#fab926]">One</span>
                   </Link>
                   <Link to="/MovitexPro" style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block px-4 py-2 text-sm text-[#f0251f] hover:bg-gray-50 transition-colors duration-200">
                     Movitex <span style={{ fontFamily: 'MusticaPro, sans-serif' }} className="text-[#fab926]">Pro</span>
                   </Link>
                   <Link to="/MovitexUltra" style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block px-4 py-2 text-sm text-[#f0251f] hover:bg-gray-50 transition-colors duration-200">
                     Movitex <span style={{ fontFamily: 'MusticaPro, sans-serif' }} className="text-black">Ultra</span>
                   </Link>
                 </div>
               </div>
             </div>

                         <Link 
               to="/contactos" 
               className="px-3 py-2 font-bold rounded-md transition-colors duration-200 text-[#f0251f] hover:text-black "
               style={{ fontFamily: 'MusticaPro, sans-serif' }}
             >
               Contactos
             </Link>
          </div>

          {/* Icono circular y botón hamburguesa */}
          <div className="flex items-center space-x-4">
            {/* Icono circular con SVG - Click para abrir modal de login */}
            <div 
              onClick={openLoginModal}
              className="w-10 h-10 bg-[#fab926] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"    
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
                                           <Link 
                to="/inicio" 
                className="block px-3 py-2 rounded-md font-medium text-[#f0251f] hover:text-[#fab926] transition-colors duration-200"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
             >
                Inicio
              </Link>
               
               <div className="block px-3 py-2">
                 <p className="font-medium text-[#fab926] mb-2" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                   Servicios ▾
                 </p>
                 <Link 
                   to="/MovitexOne" 
                   className="block pl-4 py-1 text-sm text-[#f0251f] hover:text-[#fab926] transition-colors duration-200"
                   style={{ fontFamily: 'MusticaPro, sans-serif' }}
                 >
                   Movitex One
                 </Link>
                 <Link 
                   to="/MovitexPro" 
                   className="block pl-4 py-1 text-sm text-[#f0251f] hover:text-[#fab926] transition-colors duration-200"
                   style={{ fontFamily: 'MusticaPro, sans-serif' }}
                 >
                   Movitex Pro
                 </Link>
                 <Link 
                   to="/MovitexUltra" 
                   className="block pl-4 py-1 text-sm text-[#f0251f] hover:text-[#fab926] transition-colors duration-200"
                   style={{ fontFamily: 'MusticaPro, sans-serif' }}
                 >
                   Movitex Ultra
                 </Link>
               </div>

               <Link 
                 to="/contactos" 
                 className="block px-3 py-2 rounded-md font-medium text-[#fab926] hover:text-[#f0251f] transition-colors duration-200"
                 style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                 Contactos
               </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de inicio de sesión */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </nav>
  );
};

export default Navbar;
