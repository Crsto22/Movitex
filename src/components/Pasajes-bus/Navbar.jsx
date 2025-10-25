import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCiudades } from '../../context/CiudadesContext';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Logo from '../../assets/Logo.png';
import Movitex from "../../assets/Movitex.svg";
import User from '../../assets/User.png';
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';
import ModalRegistroGoogle from '../ModalRegistroGoogle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, userData, logoutUser, loading } = useAuth();
  
  // Obtener ciudades del contexto
  const { ciudades, loading: ciudadesLoading, searchCiudadesByName } = useCiudades();
  
  // Hooks para obtener parámetros de la URL
  const { origen: origenParam, destino: destinoParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Estados para el SearchBox integrado
  const [searchData, setSearchData] = useState({
    origen: '',
    destino: '',
    salida: new Date().toISOString().split('T')[0],
    retorno: ''
  });

  // Función para formatear fecha de DD-MM-YYYY a YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
    if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
      return dateString;
    }
    // Si está en formato DD-MM-YYYY, convertir a YYYY-MM-DD
    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString;
  };

  // Efecto para capturar y autocompletar desde la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fechaSalida = searchParams.get('fecha_salida');
    const fechaRetorno = searchParams.get('fecha_retorno');
    
    console.log('URL Params capturados:', { origenParam, destinoParam, fechaSalida, fechaRetorno });
    
    // Solo actualizar si realmente hay parámetros en la URL
    if (origenParam || destinoParam || fechaSalida || fechaRetorno) {
      setSearchData(prev => ({
        ...prev,
        origen: origenParam ? decodeURIComponent(origenParam).toLowerCase().replace(/^\w/, c => c.toUpperCase()) : prev.origen,
        destino: destinoParam ? decodeURIComponent(destinoParam).toLowerCase().replace(/^\w/, c => c.toUpperCase()) : prev.destino,
        salida: fechaSalida ? formatDateForInput(fechaSalida) : prev.salida,
        retorno: fechaRetorno ? formatDateForInput(fechaRetorno) : prev.retorno
      }));
      
      console.log('SearchData actualizado desde URL:', {
        origen: origenParam ? decodeURIComponent(origenParam).toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '',
        destino: destinoParam ? decodeURIComponent(destinoParam).toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '',
        salida: fechaSalida ? formatDateForInput(fechaSalida) : '',
        retorno: fechaRetorno ? formatDateForInput(fechaRetorno) : ''
      });
    }
  }, [origenParam, destinoParam, location.search]);



  const [filteredOrigen, setFilteredOrigen] = useState([]);
  const [filteredDestino, setFilteredDestino] = useState([]);
  const [showOrigenSuggestions, setShowOrigenSuggestions] = useState(false);
  const [showDestinoSuggestions, setShowDestinoSuggestions] = useState(false);
  
  // Estados para el calendario
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isMobileCalendar, setIsMobileCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 320 });

  // Referencias
  const calendarRef = useRef(null);
  const origenDesktopRef = useRef(null);
  const destinoDesktopRef = useRef(null);
  const origenMobileRef = useRef(null);
  const destinoMobileRef = useRef(null);
  const salidaDesktopRef = useRef(null);
  const retornoDesktopRef = useRef(null);
  const salidaMobileRef = useRef(null);
  const retornoMobileRef = useRef(null);

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

  // Funciones del SearchBox integrado
  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));

    // Filtrar ciudades para autocompletado usando el contexto
    if (field === 'origen') {
      const filtered = searchCiudadesByName(value);
      setFilteredOrigen(filtered);
      setShowOrigenSuggestions(filtered.length > 0);
    } else if (field === 'destino') {
      const filtered = searchCiudadesByName(value);
      setFilteredDestino(filtered);
      setShowDestinoSuggestions(filtered.length > 0);
    }
  };

  // Función para mostrar todas las ciudades cuando se hace focus
  const handleFocus = (field) => {
    if (field === 'origen') {
      setFilteredOrigen(ciudades);
      setShowOrigenSuggestions(ciudades.length > 0);
    } else if (field === 'destino') {
      setFilteredDestino(ciudades);
      setShowDestinoSuggestions(ciudades.length > 0);
    }
  };

  // Función para manejar cuando el usuario sale del input
  const handleBlur = (field) => {
    setTimeout(() => {
      if (field === 'origen') {
        setShowOrigenSuggestions(false);
      } else if (field === 'destino') {
        setShowDestinoSuggestions(false);
      }
    }, 200);
  };

  // Función para validar si una ciudad existe en la lista
  const isCiudadValida = (ciudadNombre) => {
    if (!ciudadNombre || !ciudadNombre.trim()) return false;
    return ciudades.some(ciudad => 
      ciudad.nombre.toLowerCase().trim() === ciudadNombre.toLowerCase().trim()
    );
  };

  const selectCiudad = (field, ciudad) => {
    setSearchData(prev => ({
      ...prev,
      [field]: ciudad
    }));
    
    if (field === 'origen') {
      setShowOrigenSuggestions(false);
      setFilteredOrigen([]);
      
      // Enfocar automáticamente el input de destino
      setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          destinoMobileRef.current?.focus();
        } else {
          destinoDesktopRef.current?.focus();
        }
      }, 100);
      
    } else if (field === 'destino') {
      setShowDestinoSuggestions(false);
      setFilteredDestino([]);
      
      // Enfocar automáticamente el input de fecha de salida
      setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        openCalendar('salida', isMobile);
      }, 100);
    }
  };

  // Función para formatear fecha de YYYY-MM-DD a DD-MM-YYYY para URL
  const formatDateForUrl = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    console.log('Navbar handleSearch iniciado');
    console.log('Datos de búsqueda:', searchData);
    
    // Validar que los campos obligatorios estén llenos
    if (!searchData.origen.trim() || !searchData.destino.trim()) {
      toast.error('Debes ingresar ciudad de origen y destino');
      return;
    }
    
    // Validar que las ciudades sean válidas (existan en la lista)
    if (!isCiudadValida(searchData.origen)) {
      toast.error('Debes seleccionar una ciudad válida de la lista');
      return;
    }
    
    if (!isCiudadValida(searchData.destino)) {
      toast.error('Debes seleccionar una ciudad válida de la lista');
      return;
    }
    
    // Validar que no sean la misma ciudad
    if (searchData.origen.trim().toLowerCase() === searchData.destino.trim().toLowerCase()) {
      toast.error('No puedes seleccionar la misma ciudad para origen y destino');
      return;
    }

    if (!searchData.salida) {
      toast.error('Por favor, seleccione la fecha de salida');
      return;
    }

    console.log('✅ Validaciones pasadas');

    // Construir la URL de navegación
    const origenUrl = encodeURIComponent(searchData.origen.toLowerCase());
    const destinoUrl = encodeURIComponent(searchData.destino.toLowerCase());
    
    // Crear los parámetros de consulta
    const params = new URLSearchParams();
    params.append('fecha_salida', formatDateForUrl(searchData.salida));
    
    if (searchData.retorno) {
      params.append('fecha_retorno', formatDateForUrl(searchData.retorno));
    }
    
    // Construir URL completa
    const searchUrl = `/pasajes-bus/${origenUrl}/${destinoUrl}?${params.toString()}`;
    
    console.log('URL generada:', searchUrl);
    console.log('Navegando hacia:', searchUrl);
    
    // Navegar a la nueva URL
    try {
      navigate(searchUrl);
      console.log('✅ Navigate ejecutado');
    } catch (error) {
      console.error('❌ Error en navigate:', error);
      toast.error('Error al realizar la búsqueda. Inténtalo nuevamente.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Funciones del calendario
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const openCalendar = (type, isMobile = false) => {
    setCalendarType(type);
    setIsMobileCalendar(isMobile);
    
    if (type === 'retorno' && searchData.salida) {
      const [year, month] = searchData.salida.split('-').map(Number);
      setCurrentMonth(month - 1);
      setCurrentYear(year);
    }

    // Para desktop, calcular posición antes de mostrar el calendario
    if (!isMobile) {
      const targetRef = type === 'salida' ? salidaDesktopRef : retornoDesktopRef;
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        
        // Calcular posición antes de mostrar
        const calendarTop = rect.bottom + window.scrollY + 8;
        const calendarLeft = rect.left + window.scrollX;
        
        // Establecer posición inicial en el estado
        setCalendarPosition({
          top: calendarTop,
          left: calendarLeft,
          width: 320
        });
      }
    }
    
    setShowCalendar(true);
  };

  const closeCalendar = () => {
    setShowCalendar(false);
    setCalendarType('');
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const selectDate = (day) => {
    const year = currentYear;
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    
    setSearchData(prev => ({
      ...prev,
      [calendarType]: dateString
    }));
    
    closeCalendar();
  };

  const isDateDisabled = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) return true;
    
    if (calendarType === 'retorno' && searchData.salida) {
      const [salidaYear, salidaMonth, salidaDay] = searchData.salida.split('-').map(Number);
      const salidaDate = new Date(salidaYear, salidaMonth - 1, salidaDay);
      if (selectedDate < salidaDate) return true;
    }
    
    return false;
  };

  const isDateSelected = (day) => {
    const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return searchData[calendarType] === dateString;
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isDateSelected(day);
      
      days.push(
        <button
          key={day}
          onClick={() => !disabled && selectDate(day)}
          disabled={disabled}
          className={`p-2 text-sm rounded-lg transition-all duration-200 ${
            disabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : selected
                ? 'bg-[#f0251f] text-white font-semibold'
                : 'text-gray-700 hover:bg-[#f0251f] hover:text-white font-medium'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const currentScrollY = scrollTop;
      
      // Detectar dirección del scroll
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling hacia abajo
        setScrollDirection('down');
        setShowSearchBox(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling hacia arriba
        setScrollDirection('up');
        setShowSearchBox(true);
      }
      
      // Si está en la parte superior, siempre mostrar
      if (currentScrollY <= 50) {
        setShowSearchBox(true);
      }
      
      setIsScrolled(scrollTop > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
      if (showCalendar && !isMobileCalendar && calendarRef.current && !calendarRef.current.contains(event.target)) {
        closeCalendar();
      }
    };

    const handleResize = () => {
      if (showCalendar && !isMobileCalendar) {
        closeCalendar();
      }
    };

    const handleScroll = () => {
      if (showCalendar && !isMobileCalendar) {
        const targetRef = calendarType === 'salida' ? salidaDesktopRef : retornoDesktopRef;
        if (targetRef.current) {
          const rect = targetRef.current.getBoundingClientRect();
          
          setCalendarPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            width: 320
          });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [userDropdownOpen, showCalendar, isMobileCalendar, calendarType]);

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

        {/* SearchBox integrado con animación */}
        <div 
          className={`border-t border-gray-200 bg-white transition-all duration-300 ease-in-out ${
            showSearchBox 
              ? 'max-h-96 opacity-100 transform translate-y-0 overflow-visible' 
              : 'max-h-0 opacity-0 transform -translate-y-full overflow-hidden'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-36 py-4 relative">
              <div className="bg-gray-50 rounded-2xl p-4 relative" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                {/* Versión Desktop */}
                <div className="hidden md:flex items-center gap-3 relative">
                  {/* Origen */}
                  <div className="flex-1 relative">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Origen</label>
                    <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200 focus-within:border-[#f0251f] transition-all duration-200">
                      <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                      </svg>
                      <input
                        ref={origenDesktopRef}
                        type="text"
                        placeholder="Ciudad origen"
                        value={searchData.origen}
                        onChange={(e) => handleInputChange('origen', e.target.value)}
                        onFocus={() => handleFocus('origen')}
                        onBlur={() => handleBlur('origen')}
                        className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm font-medium"
                      />
                    </div>
                    
                    {showOrigenSuggestions && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-[100] max-h-40 overflow-y-auto">
                        {filteredOrigen.slice(0, 8).map((ciudad) => (
                          <button
                            key={ciudad.id_ciudad}
                            onClick={() => selectCiudad('origen', ciudad.nombre)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 hover:text-[#f0251f] text-gray-700 text-sm transition-all duration-200"
                          >
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                              </svg>
                              {ciudad.nombre}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Destino */}
                  <div className="flex-1 relative">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Destino</label>
                    <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200 focus-within:border-[#f0251f] transition-all duration-200">
                      <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                      </svg>
                      <input
                        ref={destinoDesktopRef}
                        type="text"
                        placeholder="Ciudad destino"
                        value={searchData.destino}
                        onChange={(e) => handleInputChange('destino', e.target.value)}
                        onFocus={() => handleFocus('destino')}
                        onBlur={() => handleBlur('destino')}
                        className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm font-medium"
                      />
                    </div>
                    
                    {showDestinoSuggestions && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-[100] max-h-40 overflow-y-auto">
                        {filteredDestino.slice(0, 8).map((ciudad) => (
                          <button
                            key={ciudad.id_ciudad}
                            onClick={() => selectCiudad('destino', ciudad.nombre)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 hover:text-[#f0251f] text-gray-700 text-sm transition-all duration-200"
                          >
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                              </svg>
                              {ciudad.nombre}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Salida */}
                  <div className="flex-1 relative">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Salida</label>
                    <div 
                      ref={salidaDesktopRef}
                      className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200 focus-within:border-[#f0251f] transition-all duration-200"
                    >
                      <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <button
                        type="button"
                        onClick={() => openCalendar('salida', false)}
                        className="w-full bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer text-left"
                      >
                        {searchData.salida ? formatDate(searchData.salida) : 'Fecha'}
                      </button>
                    </div>
                  </div>

                  {/* Retorno */}
                  <div className="flex-1 relative">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Retorno</label>
                    <div 
                      ref={retornoDesktopRef}
                      className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200 focus-within:border-[#f0251f] transition-all duration-200"
                    >
                      <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <button
                        type="button"
                        onClick={() => openCalendar('retorno', false)}
                        className="w-full bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer text-left"
                      >
                        {searchData.retorno ? formatDate(searchData.retorno) : 'Opcional'}
                      </button>
                    </div>
                  </div>

                  {/* Botón buscar */}
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="bg-[#f0251f] hover:bg-[#d01f1b] transition-all duration-200 rounded-lg px-6 py-2 text-white font-medium text-sm"
                  >
                    Buscar
                  </button>
                </div>

                {/* Versión Móvil */}
                <div className="md:hidden space-y-3 relative">
                  <div className="grid grid-cols-2 gap-3 relative">
                    {/* Origen móvil */}
                    <div className="relative">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Origen</label>
                      <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <input
                          ref={origenMobileRef}
                          type="text"
                          placeholder="Origen"
                          value={searchData.origen}
                          onChange={(e) => handleInputChange('origen', e.target.value)}
                          onFocus={() => handleFocus('origen')}
                          onBlur={() => handleBlur('origen')}
                          className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                        />
                      </div>
                      
                      {/* Sugerencias origen mobile */}
                      {showOrigenSuggestions && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-[100] max-h-40 overflow-y-auto">
                          {filteredOrigen.slice(0, 6).map((ciudad) => (
                            <button
                              key={ciudad.id_ciudad}
                              onClick={() => selectCiudad('origen', ciudad.nombre)}
                              className="w-full text-left px-3 py-2.5 hover:bg-gray-50 hover:text-[#f0251f] text-gray-700 text-sm font-medium transition-all duration-200 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                                </svg>
                                {ciudad.nombre}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Destino móvil */}
                    <div className="relative">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Destino</label>
                      <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <input
                          ref={destinoMobileRef}
                          type="text"
                          placeholder="Destino"
                          value={searchData.destino}
                          onChange={(e) => handleInputChange('destino', e.target.value)}
                          onFocus={() => handleFocus('destino')}
                          onBlur={() => handleBlur('destino')}
                          className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                        />
                      </div>
                      
                      {/* Sugerencias destino mobile */}
                      {showDestinoSuggestions && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-[100] max-h-40 overflow-y-auto">
                          {filteredDestino.slice(0, 6).map((ciudad) => (
                            <button
                              key={ciudad.id_ciudad}
                              onClick={() => selectCiudad('destino', ciudad.nombre)}
                              className="w-full text-left px-3 py-2.5 hover:bg-gray-50 hover:text-[#f0251f] text-gray-700 text-sm font-medium transition-all duration-200 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                                </svg>
                                {ciudad.nombre}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Salida móvil */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Salida</label>
                      <div 
                        ref={salidaMobileRef}
                        className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200"
                      >
                        <svg className="w-4 h-4 text-[#f0251f] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <button
                          type="button"
                          onClick={() => openCalendar('salida', true)}
                          className="w-full bg-transparent outline-none text-gray-700 text-xs cursor-pointer text-left"
                        >
                          {searchData.salida ? formatDate(searchData.salida) : 'Fecha'}
                        </button>
                      </div>
                    </div>

                    {/* Retorno móvil */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Retorno</label>
                      <div 
                        ref={retornoMobileRef}
                        className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200"
                      >
                        <svg className="w-4 h-4 text-[#f0251f] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <button
                          type="button"
                          onClick={() => openCalendar('retorno', true)}
                          className="w-full bg-transparent outline-none text-gray-700 text-xs cursor-pointer text-left"
                        >
                          {searchData.retorno ? formatDate(searchData.retorno) : 'Opcional'}
                        </button>
                      </div>
                    </div>

                    {/* Botón buscar móvil */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="w-full bg-[#f0251f] hover:bg-[#d01f1b] transition-all duration-200 rounded-lg py-2 text-white font-medium text-sm"
                      >
                        Buscar
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Calendario dinámico */}
      {showCalendar && (
        <>
          {isMobileCalendar ? (
            <div 
              className="fixed inset-0 flex items-center justify-center z-[100] bg-black/50"
              onClick={closeCalendar}
            >
              <div 
                ref={calendarRef}
                className="bg-white rounded-xl shadow-xl p-6 m-4 max-w-sm w-full"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <h3 className="text-lg font-bold text-gray-800">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>

                <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeCalendar}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  
                  {calendarType === 'retorno' && (
                    <button
                      onClick={() => {
                        setSearchData(prev => ({ ...prev, retorno: '' }));
                        closeCalendar();
                      }}
                      className="px-4 py-2 text-[#f0251f] hover:text-[#d01f1b] font-medium transition-colors duration-200"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div 
              ref={calendarRef}
              className="bg-white rounded-xl shadow-xl p-6 z-[100] border border-gray-200"
              style={{
                position: 'absolute',
                top: `${calendarPosition.top}px`,
                left: `${calendarPosition.left}px`,
                width: `${calendarPosition.width}px`,
                fontFamily: 'MusticaPro, sans-serif'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h3 className="text-lg font-bold text-gray-800">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={closeCalendar}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
                
                {calendarType === 'retorno' && (
                  <button
                    onClick={() => {
                      setSearchData(prev => ({ ...prev, retorno: '' }));
                      closeCalendar();
                    }}
                    className="px-4 py-2 text-[#f0251f] hover:text-[#d01f1b] font-medium transition-colors duration-200"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          )}
        </>
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