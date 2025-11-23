import { useEffect } from 'react';
import Navbar from '../components/Reserva/Navbar';
import Footer from '../components/Footer';
import { useReserva } from '../context/ReservaContext';
import MovitexOneFont from '../assets/services/MovitexOne/MovitexOne-Font.png';
import MovitexProFont from '../assets/services/MovitexPro/MovitexPro-Font.png';
import MovitexUltraFont from '../assets/services/MovitexUltra/MovitexUltra-Font.png';

const Reserva = () => {
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

  // Consumir el contexto de reserva
  const {
    // Estados de reserva
    asientosReservados,
    totalPrecio,
    
    // Estados del formulario
    pasajeros,
    correo,
    confirmacionCorreo,
    telefono,
    codigoPromocional,
    metodoPago,
    aceptaPoliticas,
    
    // Estados del cronómetro
    tiempoRestante,
    mostrarModalTiempo,
    
    // Estados de DNI
    loadingDNI,
    
    // Estados de pago
    procesandoPago,
    errorPago,
    reservaExitosa,
    
    // Datos del viaje
    datosViaje,
    
    // Estado de usuario logueado
    isUserLoggedIn,
    
    // Funciones
    inicializarReserva,
    handleTiempoAgotado,
    formatTiempo,
    handlePasajeroChange,
    crearReserva,
    procesarPagoConIzipay,
    
    // Setters
    setCorreo,
    setConfirmacionCorreo,
    setTelefono,
    setCodigoPromocional,
    setMetodoPago,
    setAceptaPoliticas,
    setErrorPago
  } = useReserva();

  // La inicialización se maneja automáticamente en el ReservaContext

  // Función para manejar el pago
  const handlePagar = async () => {
    if (procesandoPago) return;
    
    try {
      // Procesar pago con Izipay
      console.log(' Procesando pago con Izipay...');
      await procesarPagoConIzipay();
      // La función procesarPagoConIzipay maneja la redirección y limpieza
    } catch (error) {
      console.error('Error al procesar pago:', error);
      // El error ya se maneja en el contexto
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Contenido principal con padding-top para compensar el navbar fijo */}
      <div className="pt-20 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-36">
          {/* Barra de progreso */}
          <div className="flex w-full max-w-full h-12 bg-gray-100 rounded-full overflow-hidden border border-gray-200 mb-8">
            <div className="flex items-center justify-center w-1/3 h-full px-4 text-gray-500 bg-white">
              <span
                className="text-sm font-bold mr-2"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                1
              </span>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                Ida
              </span>
            </div>
            <div className="flex items-center justify-center w-1/3 h-full px-4 bg-gradient-to-r from-[#f0251f] to-[#e63946] text-white border-l border-r border-gray-200">
              <span
                className="text-sm font-bold mr-2"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                2
              </span>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                Pago
              </span>
            </div>
            <div className="flex items-center justify-center w-1/3 h-full px-4 text-gray-500 bg-white">
              <span
                className="text-sm font-bold mr-2"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                3
              </span>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                Confirmación
              </span>
            </div>
          </div>

          {/* Contenedor principal con dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Formulario */}
            <div className="lg:col-span-2">
              {/* Información de los pasajeros */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-[#f0251f] rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                      1
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                    Información de <span className="text-[#f0251f]">los pasajeros</span>
                  </h2>
                  <div className="ml-auto flex items-center text-[#f0251f]">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[#f0251f] font-bold">{formatTiempo(tiempoRestante)}</span>
                  </div>
                </div>

                {/* Formularios de pasajeros */}
                <div className="space-y-6">
                  {pasajeros.map((pasajero, index) => (
                    <div key={pasajero.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      {/* Primera fila */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr] gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex items-center sm:block">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Asiento N°
                          </label>
                          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#f0251f] rounded-full flex items-center justify-center ml-2 sm:ml-0">
                            <span className="text-white font-bold text-xs sm:text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                              {asientosReservados[index]?.numero || asientosReservados[index] || (index + 1)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            N° Documento
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={pasajero.numeroDocumento || ''}
                              onChange={(e) => handlePasajeroChange(index, 'numeroDocumento', e.target.value)}
                              placeholder="DNI"
                              maxLength={8}
                              className={`w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs sm:text-sm ${
                                loadingDNI[index] ? 'bg-red-50 pr-8 sm:pr-12' : 'pr-2 sm:pr-3'
                              }`}
                              style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                              disabled={loadingDNI[index]}
                            />
                            {loadingDNI[index] && (
                              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-[#f0251f] border-t-transparent"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Nombres
                          </label>
                          <input
                            type="text"
                            value={pasajero.nombre || ''}
                            onChange={(e) => handlePasajeroChange(index, 'nombre', e.target.value)}
                            placeholder="Nombres"
                            className="w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs sm:text-sm"
                            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Apellidos
                          </label>
                          <input
                            type="text"
                            value={pasajero.apellido || ''}
                            onChange={(e) => handlePasajeroChange(index, 'apellido', e.target.value)}
                            placeholder="Apellidos"
                            className="w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs sm:text-sm"
                            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                          />
                        </div>
                      </div>

                      {/* Segunda fila - Fecha de nacimiento y Género */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Fecha de nacimiento
                          </label>
                          <input
                            type="date"
                            value={pasajero.fechaNacimiento || ''}
                            onChange={(e) => handlePasajeroChange(index, 'fechaNacimiento', e.target.value)}
                            className="w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs sm:text-sm"
                            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Género
                          </label>
                          <select
                            value={pasajero.genero || ''}
                            onChange={(e) => handlePasajeroChange(index, 'genero', e.target.value)}
                            className="w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs sm:text-sm"
                            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                          >
                            <option value="">Seleccionar</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Información de contacto */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={correo}
                        onChange={(e) => !isUserLoggedIn && setCorreo(e.target.value)}
                        readOnly={isUserLoggedIn}
                        placeholder="correo@ejemplo.com"
                        className={`w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg text-xs sm:text-sm ${
                          isUserLoggedIn 
                            ? 'bg-gray-100 cursor-not-allowed' 
                            : 'focus:outline-none focus:border-[#f0251f]'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Confirmar correo
                      </label>
                      <input
                        type="email"
                        value={confirmacionCorreo}
                        onChange={(e) => !isUserLoggedIn && setConfirmacionCorreo(e.target.value)}
                        readOnly={isUserLoggedIn}
                        placeholder="confirmar correo"
                        className={`w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg text-xs sm:text-sm ${
                          isUserLoggedIn 
                            ? 'bg-gray-100 cursor-not-allowed' 
                            : 'focus:outline-none focus:border-[#f0251f]'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => !isUserLoggedIn && setTelefono(e.target.value)}
                        readOnly={isUserLoggedIn}
                        placeholder="999 999 999"
                        className={`w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg text-xs sm:text-sm ${
                          isUserLoggedIn 
                            ? 'bg-gray-100 cursor-not-allowed' 
                            : 'focus:outline-none focus:border-[#f0251f]'
                        }`}
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Aviso */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                          Recuerda que todos los pasajes y comprobantes de compra serán enviados a la dirección de correo electrónico indicada previamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opciones de pago */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-[#f0251f] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        2
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                      Opciones <span className="text-[#f0251f]">de pago</span>
                    </h3>
                  </div>
                  {/* Métodos de pago */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {/* Izipay - Tarjeta de Crédito/Débito */}
                    <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer p-3 sm:p-4 border-2 border-[#f0251f] rounded-lg bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-all">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="izipay"
                        checked={metodoPago === 'izipay'}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#f0251f] border-gray-300 focus:ring-[#f0251f] focus:ring-2"
                      />
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                        <div className="flex items-center justify-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                          <span className="text-xl sm:text-2xl font-bold text-[#00a19c]" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                            Izipay
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm sm:text-base font-bold text-gray-800" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                              Tarjetas de Crédito / Débito
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center space-y-1">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-semibold text-green-600">Seguro</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  {/* Aceptar políticas */}
                  <div className="mb-4 sm:mb-6">
                    <label className="flex items-start space-x-2 sm:space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aceptaPoliticas}
                        onChange={(e) => setAceptaPoliticas(e.target.checked)}
                        className="w-3 h-3 sm:w-4 sm:h-4 text-[#f0251f] border-gray-300 rounded focus:ring-[#f0251f] focus:ring-2 mt-0.5"
                      />
                      <span className="text-xs sm:text-sm text-gray-700" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        Acepto la{' '}
                        <span className="text-[#f0251f] font-semibold cursor-pointer hover:underline">
                          política de privacidad, términos y condiciones
                        </span>{' '}
                        aplicables, y confirmo que cuento con la documentación requerida.
                      </span>
                    </label>
                  </div>

                  {/* Botón PAGAR */}
                  <button
                    onClick={handlePagar}
                    className={`w-full py-3 sm:py-4 rounded-lg text-white font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center ${
                      (aceptaPoliticas && metodoPago && !procesandoPago)
                        ? 'bg-gradient-to-r from-[#f0251f] to-[#d01f1b] hover:from-[#d01f1b] hover:to-[#b01816] shadow-lg hover:shadow-xl cursor-pointer'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                    disabled={!aceptaPoliticas || !metodoPago || procesandoPago}
                  >
                    {procesandoPago ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
                        <span className="text-sm sm:text-base">PROCESANDO...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm sm:text-base">PAGAR CON TARJETA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Columna derecha - Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Detalles de la <span className="text-[#f0251f]">compra</span>
                </h3>

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                      IDA
                    </span>
                    <span className="px-2 py-1 bg-[#f0251f] text-white text-xs font-semibold rounded" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                      IDA
                    </span>
                  </div>

                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <div className="mb-2">
                      {(() => {
                        const servicio = getDatosServicio(datosViaje?.tipoServicio || 'movitex_one');
                        return (
                          <div className={`inline-flex items-center px-2 py-1 rounded ${servicio.badgeClass}`}>
                            <img 
                              src={servicio.imagen} 
                              alt={servicio.alt} 
                              className="h-3 w-auto" 
                            />
                          </div>
                        );
                      })()}
                    </div>
                    <p>{datosViaje?.fecha ? new Date(datosViaje.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : new Date().toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</p>
                  </div>

                  <div className="flex items-center text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-gray-600">
                      {datosViaje?.ciudadOrigen?.nombre || 'Ciudad origen no disponible'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    {(() => {
                      if (datosViaje?.horaPartida) {
                        const [horas, minutos] = datosViaje.horaPartida.split(':').map(num => parseInt(num));
                        const fecha = new Date();
                        fecha.setHours(horas, minutos, 0, 0);
                        return fecha.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        });
                      }
                      return 'Hora no disponible';
                    })()}
                  </p>

                  <div className="flex items-center text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-gray-600">
                      {datosViaje?.ciudadDestino?.nombre || 'Ciudad destino no disponible'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    {(() => {
                      // Calcular hora de llegada: hora de salida + duración
                      if (datosViaje?.horaPartida && datosViaje?.duracionAprox) {
                        const [horas, minutos] = datosViaje.horaPartida.split(':').map(num => parseInt(num));
                        const duracionHoras = parseInt(datosViaje.duracionAprox);
                        
                        const fechaSalida = new Date();
                        fechaSalida.setHours(horas, minutos, 0, 0);
                        
                        const fechaLlegada = new Date(fechaSalida.getTime() + (duracionHoras * 60 * 60 * 1000));
                        
                        return fechaLlegada.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        }) + ' aprox';
                      }
                      return 'Hora no disponible';
                    })()}
                  </p>

                  <div className="flex items-center text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Duración: {(() => {
                        if (datosViaje?.duracionAprox) {
                          const duracionHoras = parseInt(datosViaje.duracionAprox);
                          const horas = Math.floor(duracionHoras);
                          const minutos = Math.round((duracionHoras - horas) * 60);
                          
                          if (minutos > 0) {
                            return `${horas}h ${minutos}m aprox`;
                          }
                          return `${horas}h aprox`;
                        }
                        return 'No disponible';
                      })()} 
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Pasajeros:
                      </span>
                      <span className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        {pasajeros.length}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Asientos:
                      </span>
                      <span className="text-sm text-gray-800" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        {asientosReservados.map(asiento => asiento?.numero || asiento).join(', ')}
                      </span>
                    </div>

                    {/* Desglose por tipo de asiento */}
                    {(() => {
                      // Agrupar asientos por tipo
                      const asientosPorTipo = {};
                      asientosReservados.forEach(asiento => {
                        const tipo = `${asiento.tipo}°`;
                        const precio = asiento.precio || 0;
                        
                        if (!asientosPorTipo[tipo]) {
                          asientosPorTipo[tipo] = {
                            cantidad: 0,
                            precioUnitario: precio,
                            total: 0
                          };
                        }
                        
                        asientosPorTipo[tipo].cantidad += 1;
                        asientosPorTipo[tipo].total += precio;
                      });

                      return Object.entries(asientosPorTipo).map(([tipo, datos]) => (
                        <div key={tipo} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            {datos.cantidad} x {tipo}:
                          </span>
                          <span className="text-sm text-gray-800" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            S/{datos.total.toFixed(2)}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="bg-[#f0251f] text-white p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>Total a pagar</span>
                      <span className="font-bold text-lg" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>S/{totalPrecio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de error de pago */}
      {errorPago && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 
                  className="text-lg font-bold text-red-800" 
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                  Error en el Pago
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p 
                className="text-sm text-gray-700" 
                style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
              >
                {errorPago}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setErrorPago(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setErrorPago(null);
                  // Aquí podrías agregar lógica adicional como limpiar formulario o volver a intentar
                }}
                className="px-4 py-2 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f1a] transition-colors font-medium"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                Intentar de Nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de tiempo agotado */}
      {mostrarModalTiempo && (
        <div className="fixed inset-0 bg-black/10  backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center">Tiempo agotado</h3>
            <p className="text-gray-700 mb-4">
              El tiempo para completar tu reserva ha expirado. Serás redirigido a la página de selección de asientos.
            </p>
            <button
              onClick={handleTiempoAgotado}
              className="w-full bg-red-600 text-white btn py-2 rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      
      {/* Contenedor para el checkout de Izipay (se renderiza como pop-up) */}
      <div id="izipay-container"></div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Reserva;