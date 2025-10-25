import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../../assets/Logo.png';
import Movitex from "../../assets/Movitex.svg";
import User from '../../assets/User.png';
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';
import ModalRegistroGoogle from '../ModalRegistroGoogle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, userData, logoutUser, loading } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const openLoginModal = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      setUserDropdownOpen(!userDropdownOpen);
    }
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const backToLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  useEffect(() => {
    if (user && userData) {
      const hasGoogleTempData = userData.dni?.startsWith('GOOGLE_') || userData.telefono?.startsWith('GOOGLE_');
      if (hasGoogleTempData) {
        setIsGoogleModalOpen(true);
      }
    }
  }, [user, userData]);

  const closeGoogleModal = () => {
    setIsGoogleModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
    setUserDropdownOpen(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-xl' 
          : 'bg-white shadow-lg'
      }`}>
        {/* Navbar principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-36">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/inicio" className="flex items-center cursor-pointer">
                <img 
                  src={Logo} 
                  alt="Movitex Logo" 
                  className="h-8 object-contain"
                />
              </Link>
            </div>

            {/* Icono circular y botón hamburguesa */}
            <div className="flex items-center space-x-4">
              {/* Área del usuario / login */}
              <div className="relative">
                {!loading && (
                  <>
                    {user && user.email_confirmed_at ? (
                      // Usuario logueado con email confirmado
                      <div className="flex items-center space-x-3 user-dropdown-container">
                        {/* Icono de usuario */}
                        <div 
                          onClick={openLoginModal}
                          className="w-10 h-10 bg-[#f0251f] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                        >
                          <img src={userData?.foto_url || User} alt="Usuario" className="w-8 rounded-full h-8" />
                        </div>
                        
                        {/* Dropdown del usuario */}
                        {userDropdownOpen && (
                          <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                <p className="font-medium" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                                  {userData ? `${userData.nombre} ${userData.apellido}` : user.email}
                                </p>
                                {userData && (
                                  <p className="text-xs text-gray-500 mt-1 truncate" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                                    {userData.correo}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-[#f0251f] hover:bg-gray-50 transition-colors duration-200"
                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                              >
                                Cerrar Sesión
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Usuario no logueado - mostrar icono para login
                      <div 
                        onClick={openLoginModal}
                        className="w-10 h-10 bg-[#fab926] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                      >
                        <img src={Movitex} alt="Movitex" className="w-6 h-6" />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Botón hamburguesa para móvil */}
              <button
                onClick={toggleMenu}
                className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center rounded-md transition-all duration-300 hover:bg-gray-100 focus:outline-none"
                aria-label="Menu"
              >
                {/* Líneas del hamburguesa animadas */}
                <span className={`block w-6 h-0.5 bg-[#fab926] transition-all duration-300 transform ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`} />
                <span className={`block w-6 h-0.5 bg-[#fab926] transition-all duration-300 mt-1 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`} />
                <span className={`block w-6 h-0.5 bg-[#fab926] transition-all duration-300 mt-1 transform ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 transition-all duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMenu} />
          
          <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <Link to="/inicio" onClick={toggleMenu}>
                <img src={Logo} alt="Movitex" className="h-8 cursor-pointer" />
              </Link>
              <button onClick={toggleMenu} className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {user && user.email_confirmed_at && (
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <img 
                      src={userData?.foto_url || User} 
                      alt="Usuario" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-[#f0251f] flex items-center justify-center text-white font-semibold text-sm">
                      {userData?.nombre?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                      {userData ? `${userData.nombre} ${userData.apellido}` : user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                      {userData?.correo || user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-100 mt-auto">
              {user && user.email_confirmed_at ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-red-600 rounded-lg transition-all duration-200 hover:bg-red-50 text-left transform hover:translate-x-2"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      openLoginModal();
                      toggleMenu();
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-[#f0251f] border border-[#f0251f] rounded-lg transition-all duration-200 hover:bg-[#f0251f] hover:text-white transform hover:scale-105"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      openRegisterModal();
                      toggleMenu();
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-white bg-[#fab926] rounded-lg transition-all duration-200 hover:bg-[#e6a71f] transform hover:scale-105"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onOpenRegister={openRegisterModal}
      />
      
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={closeRegisterModal} 
        onBackToLogin={backToLoginModal}
      />

      <ModalRegistroGoogle 
        isOpen={isGoogleModalOpen} 
        onClose={closeGoogleModal}
      />
    </>
  );
};

export default Navbar;