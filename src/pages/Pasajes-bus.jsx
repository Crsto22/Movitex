import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Lottie from 'lottie-react';
import { useViajes } from '../context/ViajesContext';
import Navbar from '../components/Pasajes-bus/Navbar';
import Bus from '../components/Pasajes-bus/Bus';
import BusLoadingAnimation from '../lottiefiles/BusLoading.json';
import MovitexOneFont from '../assets/services/MovitexOne/MovitexOne-Font.png';
import MovitexProFont from '../assets/services/MovitexPro/MovitexPro-Font.png';
import MovitexUltraFont from '../assets/services/MovitexUltra/MovitexUltra-Font.png';
import { Clock, Tickets, Plug, Tv, ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import Seat140 from '../assets/icons/seat-140.png';
import Seat160 from '../assets/icons/seat-160.png';
import Seat180 from '../assets/icons/seat-180.png';

const PasajesBus = () => {
  // Obtener parámetros de la URL
  const { origen, destino } = useParams();
  const [searchParams] = useSearchParams();
  const fechaSalidaParam = searchParams.get('fecha_salida');
  
  // Hook para manejar viajes
  const { viajes, loading, error, buscarViajes } = useViajes();
  
  // Estado para controlar qué viaje tiene los asientos expandidos
  const [viajeExpandido, setViajeExpandido] = useState(null);
  
  // Estados para filtros
  const [servicios, setServicios] = useState({
    movitexUltra: false,
    movitexOne: false,
    movitexPro: false,
  });
  
  const [horasSalida, setHorasSalida] = useState({
    manana: false,
    tarde: false,
    noche: false,
  });
  
  const [tiposAsiento, setTiposAsiento] = useState({
    asiento140: false,
    asiento160: false,
    asiento180: false,
  });

  // Estados para controlar collapse de filtros
  const [expandedSections, setExpandedSections] = useState({
    servicios: true,
    horaSalida: true,
    tiposAsiento: true,
  });



  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleServiciosChange = (servicio) => {
    setServicios(prev => ({
      ...prev,
      [servicio]: !prev[servicio]
    }));
  };

  const handleHorasChange = (hora) => {
    setHorasSalida(prev => ({
      ...prev,
      [hora]: !prev[hora]
    }));
  };

  const handleAsientosChange = (asiento) => {
    setTiposAsiento(prev => ({
      ...prev,
      [asiento]: !prev[asiento]
    }));
  };

  // Refs para animaciones
  const serviciosRef = useRef(null);
  const horasRef = useRef(null);
  const asientosRef = useRef(null);

  // Función para convertir fecha de dd-mm-yyyy a yyyy-mm-dd
  const convertirFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const [dia, mes, año] = fechaStr.split('-');
    return `${año}-${mes}-${dia}`;
  };

  // Función para obtener datos del servicio
  const getDatosServicio = (tipoServicio) => {
    const servicios = {
      movitex_one: {
        imagen: MovitexOneFont,
        alt: 'Movitex One',
        badgeClass: 'bg-[#fab926]'
      },
      movitex_pro: {
        imagen: MovitexProFont,
        alt: 'Movitex Pro', 
        badgeClass: 'bg-[#fab926]'
      },
      movitex_ultra: {
        imagen: MovitexUltraFont,
        alt: 'Movitex Ultra',
        badgeClass: 'bg-black'
      }
    };
    return servicios[tipoServicio] || servicios.movitex_one;
  };

  // Función para obtener ícono del asiento según ángulo
  const getIconoAsiento = (angulo) => {
    const iconos = {
      140: Seat140,
      160: Seat160,
      180: Seat180
    };
    return iconos[angulo] || Seat140;
  };

  // Función para formatear fecha
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dia = dias[fecha.getDay()];
    const fechaFormateada = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
    return `${dia}, ${fechaFormateada}`;
  };

  // Función para formatear hora
  const formatearHora = (horaStr) => {
    const [hora, minuto] = horaStr.split(':');
    return `${hora}:${minuto} ${parseInt(hora) >= 12 ? 'PM' : 'AM'}`;
  };

  // Función para formatear duración
  const formatearDuracion = (duracionStr) => {
    const [horas] = duracionStr.split(':');
    return `${horas}hrs aprox`;
  };

  // Componente para renderizar cada card de viaje
  const ViajeCard = ({ viaje, index }) => {
    const datosServicio = getDatosServicio(viaje.tipoServicio);
    const expandido = viajeExpandido === index;
    
    const handleToggleExpansion = () => {
      if (expandido) {
        // Si está expandido, cerrar
        setViajeExpandido(null);
      } else {
        // Si no está expandido, abrir este y cerrar cualquier otro
        setViajeExpandido(index);
        
        // Desplazamiento automático hacia el plano del bus
        setTimeout(() => {
          // Buscar el contenedor del plano del bus dentro de esta card específica
          const cardElement = document.querySelector(`[data-viaje-index="${index}"]`);
          if (cardElement) {
            const busContainer = cardElement.querySelector('[data-bus-container]');
            if (busContainer) {
              busContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }
        }, 150); // Pequeño delay para permitir que la sección se expanda primero
      }
    };

    // Determinar qué ángulos mostrar
    const angulos = [];
    if (viaje.anguloPiso1) angulos.push(viaje.anguloPiso1);
    if (viaje.anguloPiso2) angulos.push(viaje.anguloPiso2);

    return (
      <div className="max-w-2xl mx-auto relative pt-3 sm:pt-6" data-viaje-index={index}>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border-gray-200 border overflow-hidden">
          <div className="p-3 sm:p-4 flex flex-col space-y-2">
            {/* Header - Responsive */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 badge ${datosServicio.badgeClass}`}>
                <img src={datosServicio.imagen} alt={datosServicio.alt} className="h-3 sm:h-4 w-auto" />
              </div>
            </div>

            {/* Middle section - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-3 space-y-3 sm:space-y-0">
              {/* Salida */}
              <div className="flex flex-wrap items-center space-x-1 sm:space-x-2 text-gray-500" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                <span className="text-xs sm:text-sm">Salida</span>
                <span className="text-xs sm:text-sm">{formatearFecha(viaje.fechaIda)}</span>
                <span className="text-xs sm:text-sm hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm">{formatearHora(viaje.horaSalida)}</span>
              </div>

              {/* Barra vertical separadora - Solo desktop */}
              <div className="hidden sm:block h-12 w-px bg-gray-300 mx-2 lg:mx-4"></div>

              {/* Asientos */}
              <div className="flex sm:flex-col items-center sm:items-center space-x-2 sm:space-x-0 sm:space-y-1">
                {angulos.map((angulo, index) => (
                  <div key={index} className="flex items-center">
                    <img src={getIconoAsiento(angulo)} alt={`Asiento ${angulo}`} className="h-4 sm:h-5 lg:h-6 w-auto" />
                    <span className="font-semibold text-xs sm:text-sm text-gray-500 ml-1" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                      {angulo}°
                    </span>
                  </div>
                ))}
              </div>

              {/* Barra vertical separadora - Solo desktop */}
              <div className="hidden sm:block h-12 w-px bg-gray-300 mx-2 lg:mx-4"></div>

              {/* Precio y Botón */}
              <div className="flex items-center justify-between sm:justify-center sm:space-x-3">
                <div className="flex flex-col items-start sm:items-center">
                  <span className="text-gray-500 text-xs" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>Desde</span>
                  <span className="text-[#f0251f] text-base sm:text-lg font-semibold" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    S/{viaje.precioMinimo}
                  </span>
                </div>
                <button 
                  onClick={handleToggleExpansion}
                  className="bg-[#f0251f] btn text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-colors" 
                  style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                >
                  {expandido ? 'Cancelar' : 'Comprar'}
                </button>
              </div>
            </div>

            {/* Footer - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm mt-2 border-t border-gray-200 pt-2 space-y-2 sm:space-y-0" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
              <span className='text-gray-500 text-center sm:text-left'>{viaje.asientosDisponibles} Asientos restantes</span>
              <div className="flex items-center justify-between sm:justify-center sm:space-x-4">
                <div className="flex items-center space-x-1 text-gray-800">
                  <Clock size={14} className="sm:w-4 sm:h-4" />
                  <span>{formatearDuracion(viaje.duracionEstimada)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Plug size={14} className="sm:w-4 sm:h-4" />
                  <Tv size={14} className="sm:w-4 sm:h-4" />
                  <Tickets size={14} className="sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Sección expandible para selección de asientos - Responsive */}
          {expandido && (
            <div className="bg-white border-t border-gray-200">
              <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6" data-bus-container>
                <div className="w-full">
                  <Bus idViaje={viaje.idViaje} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // useEffect para realizar la búsqueda cuando se cargan los parámetros
  useEffect(() => {
    if (origen && destino && fechaSalidaParam) {
      const fechaConvertida = convertirFecha(fechaSalidaParam);
      if (fechaConvertida) {
        // Limpiar resultados anteriores antes de la nueva búsqueda
        // Esto asegura que el usuario vea el loading inmediatamente
        buscarViajes(origen, destino, fechaConvertida);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origen, destino, fechaSalidaParam]);

  // Función para determinar el período del día según la hora
  const getPeriodoDelDia = (hora) => {
    const [horas] = hora.split(':');
    const horaNum = parseInt(horas);
    
    // Mañana: 1:00 a.m. a 10:59 a.m.
    if (horaNum >= 1 && horaNum < 11) return 'manana';
    // Tarde: 11:00 a.m. a 5:59 p.m.
    if (horaNum >= 11 && horaNum < 18) return 'tarde';
    // Noche: 6:00 p.m. a 12:59 a.m. (incluye 0 para medianoche)
    return 'noche';
  };

  // Función para filtrar viajes según los filtros activos
  const filtrarViajes = (viajesOriginales) => {
    return viajesOriginales.filter(viaje => {
      // Filtro por servicio
      const serviciosFiltrados = Object.keys(servicios).filter(key => servicios[key]);
      if (serviciosFiltrados.length > 0) {
        const servicioMatches = serviciosFiltrados.some(filtro => {
          switch (filtro) {
            case 'movitexUltra': return viaje.tipoServicio === 'movitex_ultra';
            case 'movitexOne': return viaje.tipoServicio === 'movitex_one';
            case 'movitexPro': return viaje.tipoServicio === 'movitex_pro';
            default: return false;
          }
        });
        if (!servicioMatches) return false;
      }

      // Filtro por hora de salida
      const horasFiltradas = Object.keys(horasSalida).filter(key => horasSalida[key]);
      if (horasFiltradas.length > 0) {
        const periodoViaje = getPeriodoDelDia(viaje.horaSalida);
        if (!horasFiltradas.includes(periodoViaje)) return false;
      }

      // Filtro por tipo de asiento
      const asientosFiltrados = Object.keys(tiposAsiento).filter(key => tiposAsiento[key]);
      if (asientosFiltrados.length > 0) {
        const angulosViaje = [];
        if (viaje.anguloPiso1) angulosViaje.push(viaje.anguloPiso1);
        if (viaje.anguloPiso2) angulosViaje.push(viaje.anguloPiso2);
        
        const asientoMatches = asientosFiltrados.some(filtro => {
          switch (filtro) {
            case 'asiento140': return angulosViaje.includes(140);
            case 'asiento160': return angulosViaje.includes(160);
            case 'asiento180': return angulosViaje.includes(180);
            default: return false;
          }
        });
        if (!asientoMatches) return false;
      }

      return true;
    });
  };

  // Función para resetear todos los filtros
  const resetAllFilters = () => {
    setServicios({
      movitexUltra: false,
      movitexOne: false,
      movitexPro: false,
    });
    setHorasSalida({
      manana: false,
      tarde: false,
      noche: false,
    });
    setTiposAsiento({
      asiento140: false,
      asiento160: false,
      asiento180: false,
    });
  };
  return (
    <>
      <style>
        {`
          .filter-enter {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          
          .filter-enter-active {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
            transition: all 300ms ease-in-out;
          }
          
          .filter-exit {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
          
          .filter-exit-active {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
            transition: all 300ms ease-in-out;
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

      {/* Espaciado para compensar el navbar fijo - Optimizado para móviles */}
      <div className="pt-32 md:pt-56 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-38 mt-36 md:mt-0">
        
        {/* Estados de Loading y Sin Resultados - Contenedor padre */}
        {loading ? (
          // Estado de carga con animación Lottie personalizada - Responsive
          <div className="flex justify-center items-center min-h-[50vh] px-4">
            <div className="flex flex-col items-center space-y-4 sm:space-y-8">
              {/* Animación Lottie personalizada - Responsive */}
              <div className="w-64 h-48 sm:w-80 sm:h-64 md:w-96 md:h-80 overflow-hidden relative">
                <div className="absolute -top-2 sm:-top-4 left-0 w-full">
                  <Lottie 
                    animationData={BusLoadingAnimation} 
                    loop={true}
                    autoplay={true}
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      maxWidth: '384px'
                    }}
                  />
                </div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2 px-4">
                <p className="text-gray-700 text-lg sm:text-xl font-semibold" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Buscando viajes disponibles
                </p>
                <p className="text-gray-500 text-base sm:text-lg" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Estamos encontrando las mejores opciones para ti...
                </p>
              </div>
            </div>
          </div>
        ) : !error && viajes.length === 0 && origen && destino && fechaSalidaParam ? (
          // Mensaje cuando no hay resultados - Responsive
          <div className="flex justify-center items-center min-h-[50vh] px-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8 lg:p-12 text-center max-w-2xl w-full">
              <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <Tickets className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-gray-800 font-bold text-xl sm:text-2xl" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                    No se encontraron viajes
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    No hay viajes disponibles para la ruta <span className="font-semibold capitalize">{origen}</span> → <span className="font-semibold capitalize">{destino}</span> el {formatearFecha(convertirFecha(fechaSalidaParam) || '')}
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    Intenta con otra fecha o ajusta tus filtros
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          // Estado de error - Responsive
          <div className="flex justify-center items-center min-h-[50vh] px-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 lg:p-12 text-center max-w-2xl w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0">
                  <X className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-red-800 font-bold text-lg sm:text-xl" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                    Error al buscar viajes
                  </h3>
                  <p className="text-red-600 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Stepper Progress */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Filtros expandidos con DaisyUI y animaciones - Oculto en móviles */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-gray-200 pb-2 sm:pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-[#f0251f]" />
                  <h3
                    className="text-base sm:text-lg font-bold text-[#f0251f]"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Filtros
                  </h3>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="btn btn-square btn-xs sm:btn-sm btn-outline border-[#f0251f] text-[#f0251f] hover:bg-[#f0251f] hover:text-white"
                  title="Limpiar filtros"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Servicios - Responsive */}
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={() => toggleSection('servicios')}
                  className="flex items-center justify-between w-full mb-2 sm:mb-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <h4
                    className="text-xs sm:text-sm font-semibold text-gray-800"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Servicios
                  </h4>
                  {expandedSections.servicios ? (
                    <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#f0251f]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#f0251f]" />
                  )}
                </button>
                
                <CSSTransition
                  in={expandedSections.servicios}
                  timeout={300}
                  classNames="filter"
                  unmountOnExit
                  nodeRef={serviciosRef}
                >
                  <div ref={serviciosRef} className="overflow-hidden">
                    <div className="flex flex-col gap-2 mb-3 items-start">
                      <button 
                        className={`px-3 py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          servicios.movitexUltra 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleServiciosChange('movitexUltra')}
                      >
                        Movitex Ultra
                      </button>
                      <button 
                        className={`px-3 py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          servicios.movitexOne 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleServiciosChange('movitexOne')}
                      >
                        Movitex One
                      </button>
                      <button 
                        className={`px-3 py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          servicios.movitexPro 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleServiciosChange('movitexPro')}
                      >
                        Movitex Pro
                      </button>
                    </div>
                  </div>
                </CSSTransition>
              </div>

              {/* Hora de Salida - Responsive */}
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={() => toggleSection('horaSalida')}
                  className="flex items-center justify-between w-full mb-2 sm:mb-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <h4
                    className="text-xs sm:text-sm font-semibold text-gray-800"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Hora de Salida
                  </h4>
                  {expandedSections.horaSalida ? (
                    <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#f0251f]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#f0251f]" />
                  )}
                </button>
                
                <CSSTransition
                  in={expandedSections.horaSalida}
                  timeout={300}
                  classNames="filter"
                  unmountOnExit
                  nodeRef={horasRef}
                >
                  <div ref={horasRef} className="overflow-hidden">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button 
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          horasSalida.manana 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleHorasChange('manana')}
                      >
                        Mañana
                      </button>
                      <button 
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          horasSalida.tarde 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleHorasChange('tarde')}
                      >
                        Tarde
                      </button>
                      <button 
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          horasSalida.noche 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleHorasChange('noche')}
                      >
                        Noche
                      </button>                     
                    </div>
                  </div>
                </CSSTransition>
              </div>

              {/* Tipos de asiento - Responsive */}
              <div>
                <button
                  onClick={() => toggleSection('tiposAsiento')}
                  className="flex items-center justify-between w-full mb-2 sm:mb-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <h4
                    className="text-xs sm:text-sm font-semibold text-gray-800"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Tipos de asiento
                  </h4>
                  {expandedSections.tiposAsiento ? (
                    <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#f0251f]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#f0251f]" />
                  )}
                </button>
                
                <CSSTransition
                  in={expandedSections.tiposAsiento}
                  timeout={300}
                  classNames="filter"
                  unmountOnExit
                  nodeRef={asientosRef}
                >
                  <div ref={asientosRef} className="overflow-hidden">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button 
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          tiposAsiento.asiento140 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleAsientosChange('asiento140')}
                      >
                        140°
                      </button>
                      <button 
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          tiposAsiento.asiento160 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleAsientosChange('asiento160')}
                      >
                        160°
                      </button>
                      <button 
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                          tiposAsiento.asiento180 
                            ? 'bg-[#f0251f] text-white hover:bg-[#d91e1e]' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                        onClick={() => handleAsientosChange('asiento180')}
                      >
                        180°
                      </button>
                    </div>
                  </div>
                </CSSTransition>
              </div>
            </div>
          </div>

          {/* Stepper Progress actualizado - Responsive - Ancho completo en móviles */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-center mb-6">
              <div className="flex w-full max-w-2xl h-10 sm:h-12 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div className="flex items-center justify-center w-1/3 h-full bg-gradient-to-r from-[#f0251f] to-[#e63946] text-white relative">
                  <span
                    className="text-xs sm:text-sm font-bold mr-1 sm:mr-2"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    1
                  </span>
                  <span
                    className="text-xs sm:text-sm font-semibold"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Ida
                  </span>
                  <div className="absolute right-0 top-0 h-full w-3 sm:w-4 bg-gradient-to-r from-[#f0251f] to-transparent transform skew-x-12"></div>
                </div>
                <div className="flex items-center justify-center w-1/3 h-full px-2 sm:px-4 text-gray-500 bg-white border-l border-r border-gray-200">
                  <span
                    className="text-xs sm:text-sm font-bold mr-1 sm:mr-2"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    2
                  </span>
                  <span
                    className="text-xs sm:text-sm font-semibold"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Pago
                  </span>
                </div>
                <div className="flex items-center justify-center w-1/3 h-full px-2 sm:px-4 text-gray-500 bg-white">
                  <span
                    className="text-xs sm:text-sm font-bold mr-1 sm:mr-2"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    3
                  </span>
                  <span
                    className="text-xs sm:text-sm font-semibold"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Confirmación
                  </span>
                </div>
              </div>
            </div>

            {/* Cards de Servicios de Bus - Solo cuando hay resultados - Responsive */}
            <div className="space-y-4 sm:space-y-6 ">
              {(() => {
                const viajesFiltrados = filtrarViajes(viajes);
                
                if (viajesFiltrados.length === 0) {
                  return (
                    <div className="flex justify-center items-center min-h-[30vh] px-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8 text-center max-w-2xl w-full">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <Filter className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-gray-800 font-bold text-lg sm:text-xl" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                              No hay viajes que coincidan
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                              Intenta ajustar los filtros para ver más opciones
                            </p>
                            <button
                              onClick={resetAllFilters}
                              className="mt-4 px-4 py-2 bg-[#f0251f] text-white rounded-lg text-sm font-medium hover:bg-[#d91e1e] transition-colors"
                              style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                            >
                              Limpiar filtros
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return viajesFiltrados.map((viaje, index) => (
                  <ViajeCard key={index} viaje={viaje} index={index} />
                ));
              })()}
            </div>
          </div>
        </div>
        </>
        )}
      </div>
      </div>
    </>
  );
};

export default PasajesBus;