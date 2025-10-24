import { X, MapPin, Clock, Calendar, Building2, Armchair, Bus, Tv, Plug, Wifi, Wind, Bath, Utensils } from 'lucide-react';
import MovitexOneFont from '../../assets/services/MovitexOne/MovitexOne-Font.png';
import MovitexProFont from '../../assets/services/MovitexPro/MovitexPro-Font.png';
import MovitexUltraFont from '../../assets/services/MovitexUltra/MovitexUltra-Font.png';
import Seat140 from '../../assets/icons/seat-140.png';
import Seat160 from '../../assets/icons/seat-160.png';
import Seat180 from '../../assets/icons/seat-180.png';

const DetallesViajeModal = ({ isOpen, onClose, viaje }) => {
  if (!isOpen || !viaje) return null;

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
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dia = dias[fecha.getDay()];
    const mes = meses[fecha.getMonth()];
    const diaNum = fecha.getDate();
    const año = fecha.getFullYear();
    return `${dia}, ${diaNum} de ${mes} de ${año}`;
  };

  // Función para formatear hora
  const formatearHora = (horaStr) => {
    const [hora, minuto] = horaStr.split(':');
    const horaNum = parseInt(hora);
    const periodo = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum > 12 ? horaNum - 12 : horaNum === 0 ? 12 : horaNum;
    return `${hora12}:${minuto} ${periodo}`;
  };

  // Función para formatear fecha corta (DD/MM/YY)
  const formatearFechaCorta = (fechaStr, horaStr) => {
    const fecha = new Date(fechaStr + 'T' + horaStr);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear().toString().slice(-2);
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
  };

  // Función para calcular fecha de llegada
  const calcularFechaLlegada = () => {
    const fechaSalida = new Date(viaje.fechaIda + 'T' + viaje.horaSalida);
    const [horas, minutos] = viaje.duracionEstimada.split(':');
    const duracionMs = (parseInt(horas) * 60 + parseInt(minutos)) * 60 * 1000;
    const fechaLlegada = new Date(fechaSalida.getTime() + duracionMs);
    
    const dia = fechaLlegada.getDate().toString().padStart(2, '0');
    const mes = (fechaLlegada.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaLlegada.getFullYear().toString().slice(-2);
    const hrs = fechaLlegada.getHours().toString().padStart(2, '0');
    const mins = fechaLlegada.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${año} ${hrs}:${mins}`;
  };

  // Función para obtener solo la hora de llegada
  const obtenerHoraLlegada = () => {
    const fechaSalida = new Date(viaje.fechaIda + 'T' + viaje.horaSalida);
    const [horas, minutos] = viaje.duracionEstimada.split(':');
    const duracionMs = (parseInt(horas) * 60 + parseInt(minutos)) * 60 * 1000;
    const fechaLlegada = new Date(fechaSalida.getTime() + duracionMs);
    return formatearHora(fechaLlegada.getHours().toString().padStart(2, '0') + ':' + fechaLlegada.getMinutes().toString().padStart(2, '0'));
  };

  const datosServicio = getDatosServicio(viaje.tipoServicio);

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] sm:max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#f0251f] border-b border-gray-200 p-3 sm:p-4 md:p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
              Detalles del Viaje
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-red-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Fecha y Hora */}
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[10px] sm:text-xs mb-1">Sale</span>
                <span className="text-gray-800 font-semibold text-[10px] sm:text-xs">{formatearFechaCorta(viaje.fechaIda, viaje.horaSalida)}</span>
              </div>
              <div className="flex flex-col items-center px-2 sm:px-4">
                <span className="text-gray-500 text-[10px] sm:text-xs mb-1">Duración</span>
                <span className="text-[#f0251f] font-bold text-xs sm:text-sm">{viaje.duracionEstimada.split(':')[0]}hrs</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-500 text-[10px] sm:text-xs mb-1">Llega</span>
                <span className="text-gray-800 font-semibold text-[10px] sm:text-xs">{calcularFechaLlegada()}</span>
              </div>
            </div>
          </div>

          {/* Itinerario */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6">
            <h3 className="font-semibold text-gray-800 text-start mb-4 sm:mb-6 text-sm sm:text-base" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
              Itinerario
            </h3>
            
            <div className="flex flex-col items-center space-y-2 sm:space-y-4">
              {/* Origen */}
              <div className="flex items-center w-full max-w-md">
                <div className="flex-shrink-0 w-14 sm:w-20 text-right pr-2 sm:pr-4">
                  <span className="text-gray-800 font-bold text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    {formatearHora(viaje.horaSalida)}
                  </span>
                </div>
                
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f0251f] flex items-center justify-center shadow-lg">
                    <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 pl-2 sm:pl-4">
                  <p className="text-gray-800 font-bold text-sm sm:text-base md:text-lg capitalize" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    {viaje.ciudadOrigen}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    Sale de: {viaje.ciudadOrigen}
                  </p>
                </div>
              </div>

              {/* Línea conectora */}
              <div className="flex items-center w-full max-w-md">
                <div className="w-18 sm:w-25"></div>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-0.5 h-8 sm:h-12 bg-[#f0251f]"></div>
                </div>
              </div>

              {/* Destino */}
              <div className="flex items-center w-full max-w-md">
                <div className="flex-shrink-0 w-14 sm:w-20 text-right pr-2 sm:pr-4">
                  <span className="text-gray-800 font-bold text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    {obtenerHoraLlegada()}
                  </span>
                </div>
                
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f0251f] flex items-center justify-center shadow-lg">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 pl-2 sm:pl-4">
                  <p className="text-gray-800 font-bold text-sm sm:text-base md:text-lg capitalize" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    {viaje.ciudadDestino}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    Llega a: {viaje.ciudadDestino}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenidades y Servicios */}
          <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6">
            <h3 className="font-semibold text-gray-800 text-start mb-3 sm:mb-4 text-sm sm:text-base" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
              Amenidades y Servicios
            </h3>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* TV/Pantallas */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
                  <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-[#f0251f]" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 text-center" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  TV
                </span>
              </div>

              {/* Cargadores USB */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
                  <Plug className="w-5 h-5 sm:w-6 sm:h-6 text-[#f0251f]" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 text-center leading-tight" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Cargador
                </span>
              </div>

              {/* WiFi */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
                  <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-[#f0251f]" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 text-center" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  WiFi
                </span>
              </div>

              {/* Aire Acondicionado */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
                  <Wind className="w-5 h-5 sm:w-6 sm:h-6 text-[#f0251f]" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 text-center leading-tight" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Aire A/C
                </span>
              </div>

              {/* Baño */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
                  <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-[#f0251f]" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 text-center" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Baño
                </span>
              </div>

              {/* Snacks */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
                  <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-[#f0251f]" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 text-center" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Snacks
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesViajeModal;
