import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCiudades } from '../../context/CiudadesContext';
import { toast } from 'react-hot-toast';

const SearchBox = () => {
  const navigate = useNavigate();
  
  const [searchData, setSearchData] = useState({
    origen: '',
    destino: '',
    salida: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    retorno: ''
  });

  // Obtener ciudades del contexto
  const { ciudades, loading: ciudadesLoading, searchCiudadesByName } = useCiudades();

  const [filteredOrigen, setFilteredOrigen] = useState([]);
  const [filteredDestino, setFilteredDestino] = useState([]);
  const [showOrigenSuggestions, setShowOrigenSuggestions] = useState(false);
  const [showDestinoSuggestions, setShowDestinoSuggestions] = useState(false);
  
  // Estados para el calendario dinámico
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState(''); // 'salida' o 'retorno'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobileCalendar, setIsMobileCalendar] = useState(false);

  // Referencias
  const containerRef = useRef(null);
  const calendarRef = useRef(null);
  const origenDesktopRef = useRef(null);
  const destinoDesktopRef = useRef(null);
  const origenMobileRef = useRef(null);
  const destinoMobileRef = useRef(null);
  const salidaDesktopRef = useRef(null);
  const retornoDesktopRef = useRef(null);
  const salidaMobileRef = useRef(null);
  const retornoMobileRef = useRef(null);

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
        // Detectar si estamos en mobile o desktop
        const isMobile = window.innerWidth < 768; // md breakpoint de Tailwind
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
        if (isMobile) {
          // En mobile, abrir el calendario directamente
          openCalendar('salida', true);
        } else {
          // En desktop, abrir el calendario
          openCalendar('salida', false);
        }
      }, 100);
    }
  };

  // Función para validar si una ciudad existe en la lista
  const isCiudadValida = (ciudadNombre) => {
    if (!ciudadNombre || !ciudadNombre.trim()) return false;
    return ciudades.some(ciudad => 
      ciudad.nombre.toLowerCase().trim() === ciudadNombre.toLowerCase().trim()
    );
  };

  const handleSearch = () => {
    console.log('🚀 Función handleSearch ejecutada');
    console.log('📊 Datos de búsqueda:', searchData);
    
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
    const origen = searchData.origen.toLowerCase().replace(/\s+/g, '-');
    const destino = searchData.destino.toLowerCase().replace(/\s+/g, '-');
    
    console.log('🏙️ Origen procesado:', origen);
    console.log('🎯 Destino procesado:', destino);
    
    // Formatear fecha para URL (dd-mm-yyyy)
    const formatDateForURL = (dateString) => {
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    };

    const fechaSalida = formatDateForURL(searchData.salida);
    console.log('📅 Fecha salida formateada:', fechaSalida);
    
    // Construir parámetros de query
    const queryParams = new URLSearchParams();
    queryParams.append('fecha_salida', fechaSalida);
    
    // Solo agregar fecha de retorno si fue seleccionada
    if (searchData.retorno) {
      const fechaRetorno = formatDateForURL(searchData.retorno);
      queryParams.append('fecha_retorno', fechaRetorno);
      console.log('🔄 Fecha retorno formateada:', fechaRetorno);
    }

    // Construir URL completa
    const url = `/pasajes-bus/${origen}/${destino}?${queryParams.toString()}`;
    
    console.log('🌐 URL construida:', url);
    console.log('🚀 Iniciando navegación...');
    
    // Navegar a la página de resultados
    try {
      navigate(url);
      console.log('✅ Navigate ejecutado');
    } catch (error) {
      console.error('❌ Error en navigate:', error);
      toast.error('Error al realizar la búsqueda. Inténtalo nuevamente.');
    }
  };

  // Formatear fecha para mostrar sin problemas de zona horaria
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Parsear directamente el string sin crear objeto Date problemático
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Funciones para el calendario dinámico
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const openCalendar = (type, isMobile = false) => {
    setCalendarType(type);
    setIsMobileCalendar(isMobile);
    
    let targetRef;
    if (isMobile) {
      targetRef = type === 'salida' ? salidaMobileRef : retornoMobileRef;
    } else {
      targetRef = type === 'salida' ? salidaDesktopRef : retornoDesktopRef;
    }
    
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;
      let width = rect.width;
      
      if (!isMobile && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        top = rect.bottom - containerRect.top + 8;
        left = rect.left - containerRect.left;
      }
      
      setCalendarPosition({
        top,
        left,
        width
      });
    }
    
    setShowCalendar(true);
    
    // Si es para retorno y ya hay fecha de salida, empezar desde ese mes
    if (type === 'retorno' && searchData.salida) {
      const [salidaYear, salidaMonth] = searchData.salida.split('-').map(Number);
      setCurrentMonth(salidaMonth - 1); // Restar 1 porque los meses en JS van de 0-11
      setCurrentYear(salidaYear);
    }
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

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const selectDate = (day) => {
    // Crear fecha local sin problemas de zona horaria
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
    
    // Deshabilitar fechas pasadas
    if (selectedDate < today) return true;
    
    // Si es retorno, deshabilitar fechas anteriores a la salida
    if (calendarType === 'retorno' && searchData.salida) {
      // Crear fecha de salida desde el string sin problemas de zona horaria
      const [salidaYear, salidaMonth, salidaDay] = searchData.salida.split('-').map(Number);
      const salidaDate = new Date(salidaYear, salidaMonth - 1, salidaDay);
      return selectedDate < salidaDate;
    }
    
    return false;
  };

  const isDateSelected = (day) => {
    // Crear string de fecha local consistente con selectDate
    const year = currentYear;
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    return searchData[calendarType] === dateString;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isDateSelected(day);
      
      days.push(
        <button
          key={day}
          onClick={() => !disabled && selectDate(day)}
          disabled={disabled}
          className={`
            p-2 text-sm font-medium transition-all duration-200 rounded-lg
            ${disabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : selected
                ? 'bg-[#f0251f] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100 hover:text-[#f0251f]'
            }
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  // Manejar clic fuera para popover en desktop
  useEffect(() => {
    if (!showCalendar || isMobileCalendar) return;

    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        closeCalendar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar, isMobileCalendar]);

  return (
    <div ref={containerRef} className="md:absolute md:bottom-8 md:left-1/2 md:transform md:-translate-x-1/2 w-full max-w-6xl px-4 z-10 relative mt-6">
      <div className="bg-white md:rounded-4xl rounded-lg shadow-lg md:p-6 p-8" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
        {/* Desktop layout */}
        <div className="hidden md:flex items-center gap-4">
          {/* Origen */}
          <div className="flex-1 relative">
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Origen</label>
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-[#f0251f] transition-all duration-200 hover:border-gray-300">
              <svg className="w-5 h-5 text-[#f0251f] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 01616 0z" />
              </svg>
              <input
                ref={origenDesktopRef}
                type="text"
                placeholder="Ingresa una ciudad"
                value={searchData.origen}
                onChange={(e) => handleInputChange('origen', e.target.value)}
                onFocus={() => handleFocus('origen')}
                onBlur={() => handleBlur('origen')}
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
              />
            </div>
            
            {/* Sugerencias de origen */}
            {showOrigenSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-xl mt-2 z-50 max-h-48 overflow-y-auto">
                {filteredOrigen.slice(0, 8).map((ciudad) => (
                  <button
                    key={ciudad.id_ciudad}
                    onClick={() => selectCiudad('origen', ciudad.nombre)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 hover:text-[#f0251f] text-gray-700 font-medium transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Destino</label>
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-[#f0251f] transition-all duration-200 hover:border-gray-300">
              <svg className="w-5 h-5 text-[#f0251f] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 01616 0z" />
              </svg>
              <input
                ref={destinoDesktopRef}
                type="text"
                placeholder="Ingresa el destino"
                value={searchData.destino}
                onChange={(e) => handleInputChange('destino', e.target.value)}
                onFocus={() => handleFocus('destino')}
                onBlur={() => handleBlur('destino')}
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
              />
            </div>
            
            {/* Sugerencias de destino */}
            {showDestinoSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-xl mt-2 z-50 max-h-48 overflow-y-auto">
                {filteredDestino.slice(0, 8).map((ciudad) => (
                  <button
                    key={ciudad.id_ciudad}
                    onClick={() => selectCiudad('destino', ciudad.nombre)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 hover:text-[#f0251f] text-gray-700 font-medium transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Salida</label>
            <div 
              ref={salidaDesktopRef}
              className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-[#f0251f] transition-all duration-200 hover:border-gray-300"
            >
              <svg className="w-5 h-5 text-[#f0251f] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <button
                type="button"
                onClick={() => openCalendar('salida', false)}
                className="w-full bg-transparent outline-none text-gray-700 font-medium cursor-pointer text-left"
              >
                {searchData.salida ? formatDate(searchData.salida) : 'Selecciona fecha'}
              </button>
            </div>
          </div>

          {/* Retorno */}
          <div className="flex-1 relative">
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Retorno</label>
            <div 
              ref={retornoDesktopRef}
              className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-[#f0251f] transition-all duration-200 hover:border-gray-300"
            >
              <svg className="w-5 h-5 text-[#f0251f] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <button
                type="button"
                onClick={() => openCalendar('retorno', false)}
                className="w-full bg-transparent outline-none text-gray-700 font-medium cursor-pointer text-left"
              >
                {searchData.retorno ? formatDate(searchData.retorno) : 'Opcional'}
              </button>
            </div>
          </div>

          {/* Botón de búsqueda */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('🖱️ Botón de búsqueda clickeado');
              handleSearch();
            }}
            className="bg-[#f0251f] hover:bg-[#d01f1b] transition-all duration-200 rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-4">
          {/* Primera fila */}
          <div className="grid grid-cols-2 gap-4">
            {/* Origen Mobile */}
            <div className="relative">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Origen</label>
              <div className="flex items-center bg-gray-50 rounded-lg px-3 py-3 border-2 border-gray-200 focus-within:border-[#f0251f] transition-all duration-200">
                <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 01616 0z" />
                </svg>
                <input
                  ref={origenMobileRef}
                  type="text"
                  placeholder="Ciudad origen"
                  value={searchData.origen}
                  onChange={(e) => handleInputChange('origen', e.target.value)}
                  onFocus={() => handleFocus('origen')}
                  onBlur={() => handleBlur('origen')}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm font-medium"
                />
              </div>
              
              {/* Sugerencias origen mobile */}
              {showOrigenSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-lg shadow-xl mt-2 z-50 max-h-40 overflow-y-auto">
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

            {/* Destino Mobile */}
            <div className="relative">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Destino</label>
              <div className="flex items-center bg-gray-50 rounded-lg px-3 py-3 border-2 border-gray-200 focus-within:border-[#f0251f] transition-all duration-200">
                <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 01616 0z" />
                </svg>
                <input
                  ref={destinoMobileRef}
                  type="text"
                  placeholder="Ciudad destino"
                  value={searchData.destino}
                  onChange={(e) => handleInputChange('destino', e.target.value)}
                  onFocus={() => handleFocus('destino')}
                  onBlur={() => handleBlur('destino')}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm font-medium"
                />
              </div>
              
              {/* Sugerencias destino mobile */}
              {showDestinoSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-lg shadow-xl mt-2 z-50 max-h-40 overflow-y-auto">
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

          {/* Segunda fila */}
          <div className="grid grid-cols-2 gap-4">
            {/* Salida Mobile */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Salida</label>
              <div ref={salidaMobileRef} className="flex items-center bg-gray-50 rounded-lg px-3 py-3 border-2 border-gray-200 focus-within:border-[#f0251f] transition-all duration-200">
                <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <button
                  type="button"
                  onClick={() => openCalendar('salida', true)}
                  className="w-full bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer text-left"
                >
                  {searchData.salida ? formatDate(searchData.salida) : 'Fecha'}
                </button>
              </div>
            </div>

            {/* Retorno Mobile */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Retorno</label>
              <div ref={retornoMobileRef} className="flex items-center bg-gray-50 rounded-lg px-3 py-3 border-2 border-gray-200 focus-within:border-[#f0251f] transition-all duration-200">
                <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <button
                  type="button"
                  onClick={() => openCalendar('retorno', true)}
                  className="w-full bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer text-left"
                >
                  {searchData.retorno ? formatDate(searchData.retorno) : 'Opcional'}
                </button>
              </div>
            </div>
          </div>

          {/* Botón de búsqueda centrado */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('🖱️ Botón móvil de búsqueda clickeado');
                handleSearch();
              }}
              className="bg-[#f0251f] hover:bg-[#d01f1b] transition-all duration-200 rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendario dinámico */}
      {showCalendar && (
        <>
          {isMobileCalendar ? (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
              onClick={closeCalendar}
            >
              <div 
                ref={calendarRef}
                className="bg-white rounded-xl shadow-xl p-6 m-4 max-w-sm w-full"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del calendario */}
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

                {/* Nombres de los días */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid de días */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>

                {/* Footer con botones */}
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
              className="absolute bg-white rounded-xl shadow-xl p-6 z-50"
              style={{
                top: `${calendarPosition.top}px`,
                left: `${calendarPosition.left}px`,
                width: '320px',
                fontFamily: 'MusticaPro, sans-serif'
              }}
            >
              {/* Header del calendario */}
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

              {/* Nombres de los días */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              {/* Footer con botones */}
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
    </div>
  );
};

export default SearchBox;
