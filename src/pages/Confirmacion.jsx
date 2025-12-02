import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Ticket,
  ArrowRight,
} from "lucide-react";
import Confetti from "react-canvas-confetti";
import Lottie from "lottie-react";
import Navbar from "../components/Reserva/Navbar";
import Footer from "../components/Footer";
import { useReserva } from "../context/ReservaContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import SuccessAnimation from "../lottiefiles/Success Check.json";

const Confirmacion = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener ID de la reserva desde la URL
  const { 
    datosBoleta, 
    cargandoBoleta, 
    errorBoleta, 
    obtenerBoletaViaje, 
    limpiarReserva,
    inicializarParaConfirmacion
  } = useReserva();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [datosYaCargados, setDatosYaCargados] = useState(false);
  
  // Estados para confetti
  const [mostrarConfetti, setMostrarConfetti] = useState(false);
  const refConfetti = useRef();

  // Función para el confetti
  const dispararConfetti = useCallback(() => {
    if (refConfetti.current) {
      refConfetti.current({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f0251f', '#ff6b35', '#f59e0b', '#eab308', '#22c55e']
      });
    }
  }, []);

  useEffect(() => {
    // Verificar que tengamos un ID válido
    if (!id) {
      console.log("❌ No hay ID de reserva en la URL, redirigiendo al inicio...");
      navigate("/inicio");
      return;
    }

    // Inicializar contexto para confirmación (sin requerir sessionStorage)
    inicializarParaConfirmacion();

    // Solo cargar una vez usando el flag de control
    if (!datosYaCargados) {
      const cargarDatosBoleta = async () => {
        try {
          console.log("🎫 Cargando datos de boleta para ID:", id);
          await obtenerBoletaViaje(id);
          setDatosYaCargados(true);
          
          // Activar confetti después de cargar los datos exitosamente
          setTimeout(() => {
            setMostrarConfetti(true);
            dispararConfetti();
          }, 500);
          
        } catch (error) {
          console.error("❌ Error al cargar datos de boleta:", error);
          setDatosYaCargados(true); // Marcar como cargado para evitar reintentos infinitos
          // En caso de error, redirigir al inicio
          navigate("/inicio");
        } finally {
          setLoading(false);
        }
      };

      cargarDatosBoleta();
    }
  }, [id, datosYaCargados, inicializarParaConfirmacion]); // Solo dependencias esenciales

  const handleVolverInicio = () => {
    // Limpiar todos los datos de la reserva
    limpiarReserva();
    // Limpiar también el estado de reserva exitosa
    navigate("/inicio");
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return "";
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading || cargandoBoleta) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f0251f]"></div>
          <p className="ml-4 text-gray-600">Cargando datos de tu reserva...</p>
        </div>
      </div>
    );
  }

  if (errorBoleta || !datosBoleta || !datosBoleta.infoViaje || !datosBoleta.pasajeros) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 flex justify-center items-center min-h-[50vh] flex-col">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Error al cargar la reserva</h2>
            <p className="text-gray-600">{errorBoleta || "No se encontraron datos para esta reserva"}</p>
            <button
              onClick={() => navigate("/inicio")}
              className="bg-[#f0251f] text-white px-6 py-2 rounded-lg hover:bg-[#d91f1a] transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e5e7eb]">
      {/* Confetti Canvas */}
      <Confetti
        ref={refConfetti}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 9999
        }}
      />
      <Navbar />

      {/* Espaciado para compensar el navbar fijo */}
      <div className="pt-20 sm:pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-38 -mt-6 sm:-mt-12">
        {/* Stepper Progress - Estado Confirmación */}
        <div className="flex w-full max-w-full h-12 bg-gray-100 rounded-full overflow-hidden border border-gray-200 mb-8">
          <div className="flex items-center justify-center w-1/3 h-full px-4 text-gray-500 bg-white">
            <span
              className="text-xs sm:text-sm font-bold mr-2"
              style={{ fontFamily: "MusticaPro, sans-serif" }}
            >
              1
            </span>
            <span
              className="text-xs sm:text-sm font-semibold"
              style={{ fontFamily: "MusticaPro, sans-serif" }}
            >
              Ida
            </span>
          </div>
          <div className="flex items-center justify-center w-1/3 h-full px-4 text-gray-500 bg-white border-l border-r border-gray-200">
            <span
              className="text-xs sm:text-sm font-bold mr-2"
              style={{ fontFamily: "MusticaPro, sans-serif" }}
            >
              2
            </span>
            <span
              className="text-xs sm:text-sm font-semibold"
              style={{ fontFamily: "MusticaPro, sans-serif" }}
            >
              Pago
            </span>
          </div>
          <div className="flex items-center justify-center w-1/3 h-full px-4 bg-gradient-to-r from-[#f0251f] to-[#e63946] text-white">
            <span
              className="text-xs sm:text-sm font-bold mr-2"
              style={{ fontFamily: "MusticaPro, sans-serif" }}
            >
              3
            </span>
            <span
              className="text-xs sm:text-sm font-semibold"
              style={{ fontFamily: "MusticaPro, sans-serif" }}
            >
              Confirmación
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
          {/* Mensaje de Confirmación Principal - Efecto Ticket */}
          <div className="relative bg-white rounded-xl p-4 sm:p-6 lg:p-8 text-center overflow-hidden"
               style={{
                 position: 'relative'
               }}>
            {/* Borde perforado superior */}
            <div className="absolute top-[-10px] left-0 w-full h-[20px]"
                 style={{
                   background: 'radial-gradient(circle, #e5e7eb 10px, transparent 10px)',
                   backgroundSize: '40px 20px',
                   backgroundRepeat: 'repeat-x'
                 }}>
            </div>
            
            {/* Borde perforado inferior */}
            <div className="absolute bottom-[-10px] left-0 w-full h-[20px]"
                 style={{
                   background: 'radial-gradient(circle, #e5e7eb 10px, transparent 10px)',
                   backgroundSize: '40px 20px',
                   backgroundRepeat: 'repeat-x',
                   transform: 'rotate(180deg)'
                 }}>
            </div>
            
            <div className="flex flex-col items-center space-y-4 sm:space-y-6 relative z-10">
              {/* Animación de éxito */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center">
                <Lottie 
                  animationData={SuccessAnimation} 
                  loop={false}
                  autoplay={true}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    maxWidth: '128px',
                    maxHeight: '128px'
                  }}
                />
              </div>

              {/* Mensaje principal */}
              <div className="space-y-2 sm:space-y-4">
                <h1
                  className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 px-2"
                  style={{ fontFamily: "MusticaPro, sans-serif" }}
                >
                  ¡Pago Realizado con Éxito!
                </h1>
                <p
                  className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-2xl px-2"
                  style={{ fontFamily: "Inter_18pt-Medium, sans-serif" }}
                >
                  Tu reserva ha sido confirmada correctamente. Te enviaremos
                  todos los detalles de tu viaje al correo electrónico.
                </p>
              </div>

              {/* ID de Reserva */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6 w-full max-w-md mx-2">
                <div className="flex items-center justify-center space-x-2">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-[#f0251f]" />
                  <span
                    className="text-xs sm:text-sm font-medium text-gray-600"
                    style={{ fontFamily: "Inter_18pt-Medium, sans-serif" }}
                  >
                    ID de Reserva
                  </span>
                </div>
                <p
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-[#f0251f] mt-2 font-mono break-all"
                  style={{ fontFamily: "MusticaPro, sans-serif" }}
                >
                  {id?.slice(0, 8).toUpperCase() || "XXXXXXXX"}
                </p>
              </div>

              {/* Mensaje de correo */}
              <div className="flex items-center space-x-2 sm:space-x-3 text-blue-600 bg-blue-50 rounded-lg p-3 sm:p-4 w-full max-w-lg mx-2">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <p
                  className="text-xs sm:text-sm lg:text-base"
                  style={{ fontFamily: "Inter_18pt-Medium, sans-serif" }}
                >
                  Los boletos serán enviados a tu correo electrónico en los
                  próximos minutos.
                </p>
              </div>

              {/* Divisor */}
              <div className="w-full max-w-4xl mx-auto px-2">
                <div className="border-t border-gray-200 my-4 sm:my-6 lg:my-8"></div>
                
                {/* Resumen de la Compra */}
                <div className="text-left space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <h2
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-[#f0251f]"
                      style={{ fontFamily: "MusticaPro, sans-serif" }}
                    >
                      Resumen de tu Compra
                    </h2>
                  </div>

                  {/* Información del Usuario y Viaje */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <h3
                        className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2"
                        style={{ fontFamily: "MusticaPro, sans-serif" }}
                      >
                        Información del Pasajero
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {/* Lista de pasajeros */}
                        {datosBoleta.pasajeros.map((pasajero, index) => (
                          <div key={index} className="flex items-start space-x-2 sm:space-x-3 bg-gray-50 rounded-lg p-2 sm:p-3">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium text-gray-900 text-sm sm:text-base truncate"
                                style={{ fontFamily: "MusticaPro, sans-serif" }}
                              >
                                {pasajero.nombres} {pasajero.apellidos}
                              </p>
                              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                                <p style={{ fontFamily: "Inter_18pt-Medium, sans-serif" }}>
                                  DNI: {pasajero.dni}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span>Asiento: {pasajero.numero_asiento}</span>
                                  <span className="font-medium text-[#f0251f] text-sm sm:text-base">
                                    S/ {pasajero.precio.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center space-x-2 sm:space-x-3 bg-blue-50 rounded-lg p-2 sm:p-3">
                          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p
                              className="font-medium text-gray-900 text-sm sm:text-base"
                              style={{ fontFamily: "MusticaPro, sans-serif" }}
                            >
                              Total de Pasajeros: {datosBoleta.totalPasajeros}
                            </p>
                            <p
                              className="text-xs sm:text-sm text-gray-600 break-words"
                              style={{
                                fontFamily: "Inter_18pt-Medium, sans-serif",
                              }}
                            >
                              Asientos: {datosBoleta.pasajeros.map(p => p.numero_asiento).join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información del Viaje */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3
                        className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2"
                        style={{ fontFamily: "MusticaPro, sans-serif" }}
                      >
                        Detalles del Viaje
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                              <span
                                className="font-medium text-gray-900 capitalize text-sm sm:text-base"
                                style={{ fontFamily: "MusticaPro, sans-serif" }}
                              >
                                {datosBoleta.infoViaje.origen}
                              </span>
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span
                                className="font-medium text-gray-900 capitalize text-sm sm:text-base"
                                style={{ fontFamily: "MusticaPro, sans-serif" }}
                              >
                                {datosBoleta.infoViaje.destino}
                              </span>
                            </div>
                            <p
                              className="text-xs sm:text-sm text-gray-600 mt-1 capitalize"
                              style={{
                                fontFamily: "Inter_18pt-Medium, sans-serif",
                              }}
                            >
                              {datosBoleta.infoViaje.servicio ? datosBoleta.infoViaje.servicio.replace('_', ' ') : 'Servicio Premium'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p
                              className="font-medium text-gray-900 text-sm sm:text-base"
                              style={{ fontFamily: "MusticaPro, sans-serif" }}
                            >
                              Fecha de Viaje
                            </p>
                            <p
                              className="text-xs sm:text-sm text-gray-600 break-words"
                              style={{
                                fontFamily: "Inter_18pt-Medium, sans-serif",
                              }}
                            >
                              {formatearFecha(datosBoleta.infoViaje.fecha)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p
                              className="font-medium text-gray-900 text-sm sm:text-base"
                              style={{ fontFamily: "MusticaPro, sans-serif" }}
                            >
                              Hora de Salida
                            </p>
                            <p
                              className="text-xs sm:text-sm text-gray-600"
                              style={{
                                fontFamily: "Inter_18pt-Medium, sans-serif",
                              }}
                            >
                              {formatearHora(datosBoleta.infoViaje.hora_salida)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles de Pago */}
                  <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <h3
                      className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4"
                      style={{ fontFamily: "MusticaPro, sans-serif" }}
                    >
                      Detalles de Pago
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p
                              className="text-xs sm:text-sm font-medium text-gray-900"
                              style={{ fontFamily: "MusticaPro, sans-serif" }}
                            >
                              Estado de Pago
                            </p>
                            <p
                              className="text-xs sm:text-sm text-green-600 font-medium"
                              style={{
                                fontFamily: "Inter_18pt-Medium, sans-serif",
                              }}
                            >
                              ✅ Pagado
                            </p>
                          </div>
                        </div>

                        <div>
                          <p
                            className="text-xs sm:text-sm font-medium text-gray-900"
                            style={{ fontFamily: "MusticaPro, sans-serif" }}
                          >
                            Subtotal
                          </p>
                          <p
                            className="text-xs sm:text-sm text-gray-600"
                            style={{ fontFamily: "Inter_18pt-Medium, sans-serif" }}
                          >
                            S/ {datosBoleta.totalPrecio.toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p
                            className="text-xs sm:text-sm font-medium text-gray-900"
                            style={{ fontFamily: "MusticaPro, sans-serif" }}
                          >
                            Total Pagado
                          </p>
                          <p
                            className="text-lg sm:text-xl font-bold text-[#f0251f]"
                            style={{ fontFamily: "MusticaPro, sans-serif" }}
                          >
                            S/ {datosBoleta.totalPrecio.toFixed(2)}
                          </p>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-center mt-6 sm:mt-8 px-2">
                  <button
                    onClick={handleVolverInicio}
                    className="flex items-center justify-center space-x-2 bg-[#f0251f] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#d91f1a] transition-colors font-medium text-sm sm:text-base shadow-lg hover:shadow-xl"
                    style={{ fontFamily: "MusticaPro, sans-serif" }}
                  >
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Volver al Inicio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Confirmacion;
