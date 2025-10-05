import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Reserva/Navbar';
import { getDNIData, validateDNI } from '../services/dniService';

const Reserva = () => {
  const [pasajeros, setPasajeros] = useState([
    {
      id: 1,
      asiento: '30',
      numeroDocumento: '75132058',
      nombre: 'Cristhofer',
      apellido: 'Leonardo',
      fechaNacimiento: '',
      genero: ''
    },
    {
      id: 2,
      asiento: '29',
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      genero: ''
    },
    {
      id: 3,
      asiento: '29',
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      genero: ''
    },
    {
      id: 4,
      asiento: '29',
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      genero: ''
    }
  ]);

  const [correo, setCorreo] = useState('arturo200512@gmail.com');
  const [confirmacionCorreo, setConfirmacionCorreo] = useState('arturo200512@gmail.com');
  const [telefono, setTelefono] = useState('932889985');

  // Estados para opciones de pago
  const [codigoPromocional, setCodigoPromocional] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);

  // Estados para manejo de DNI
  const [loadingDNI, setLoadingDNI] = useState({});
  const timeoutRefs = useRef({});

  const handlePasajeroChange = (index, field, value) => {
    const newPasajeros = [...pasajeros];
    
    // Si es el campo de número de documento, manejar la lógica de DNI
    if (field === 'numeroDocumento') {
      const dniAnterior = newPasajeros[index].numeroDocumento;
      
      // Actualizar el DNI inmediatamente
      newPasajeros[index][field] = value;
      setPasajeros(newPasajeros);
      
      // Manejar la búsqueda de DNI
      handleDNIChange(index, value, dniAnterior);
    } else {
      // Para otros campos, actualizar normalmente
      newPasajeros[index][field] = value;
      setPasajeros(newPasajeros);
    }
  };

  const handleDNIChange = (index, dni, dniAnterior) => {
    // Limpiar timeout anterior si existe
    if (timeoutRefs.current[index]) {
      clearTimeout(timeoutRefs.current[index]);
    }

    // Limpiar estado de loading si el DNI no es válido
    if (!validateDNI(dni)) {
      setLoadingDNI(prev => ({
        ...prev,
        [index]: false
      }));
      return;
    }

    // Si el DNI cambió (y no está vacío), limpiar los campos inmediatamente
    if (dni !== dniAnterior && dni.length > 0) {
      setPasajeros(prev => {
        const newPasajeros = [...prev];
        newPasajeros[index] = {
          ...newPasajeros[index],
          nombre: '',
          apellido: ''
        };
        return newPasajeros;
      });
    }

    // Establecer nuevo timeout para la búsqueda solo si el DNI es válido
    if (validateDNI(dni)) {
      timeoutRefs.current[index] = setTimeout(async () => {
        await searchDNI(index, dni);
      }, 1500); // Reducido a 1.5 segundos para mejor UX
    }
  };

  const searchDNI = async (index, dni) => {
    if (!validateDNI(dni)) return;

    // Verificar que el DNI actual siga siendo el mismo (por si el usuario siguió escribiendo)
    const currentDNI = pasajeros[index].numeroDocumento;
    if (currentDNI !== dni) {
      return;
    }

    try {
      setLoadingDNI(prev => ({
        ...prev,
        [index]: true
      }));

      const result = await getDNIData(dni);

      if (result.success && result.data) {
        // Verificar nuevamente que el DNI no haya cambiado durante la búsqueda
        setPasajeros(prev => {
          const currentDNI = prev[index].numeroDocumento;
          if (currentDNI === dni) {
            const newPasajeros = [...prev];
            newPasajeros[index] = {
              ...newPasajeros[index],
              nombre: result.data.nombre || '',
              apellido: result.data.apellido || ''
            };
            return newPasajeros;
          }
          return prev;
        });
      } else {
        // Si no se encontraron datos, asegurarse de que los campos queden limpios
        setPasajeros(prev => {
          const currentDNI = prev[index].numeroDocumento;
          if (currentDNI === dni) {
            const newPasajeros = [...prev];
            newPasajeros[index] = {
              ...newPasajeros[index],
              nombre: '',
              apellido: ''
            };
            return newPasajeros;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error al buscar DNI:', error);
      // En caso de error, limpiar los campos
      setPasajeros(prev => {
        const currentDNI = prev[index].numeroDocumento;
        if (currentDNI === dni) {
          const newPasajeros = [...prev];
          newPasajeros[index] = {
            ...newPasajeros[index],
            nombre: '',
            apellido: ''
          };
          return newPasajeros;
        }
        return prev;
      });
    } finally {
      setLoadingDNI(prev => ({
        ...prev,
        [index]: false
      }));
    }
  };

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>07:05</span>
                  </div>
                </div>

                {/* Formularios de pasajeros */}
                <div className="space-y-6">
                  {pasajeros.map((pasajero, index) => (
                    <div key={pasajero.id} className="border border-gray-200 rounded-lg p-4">
                      {/* Primera fila */}
                      <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_1fr_1fr] gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            N°
                          </label>
                          <div className="w-7 h-7 bg-[#f0251f] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                              {pasajero.asiento}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            N° Documento
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={pasajero.numeroDocumento}
                              onChange={(e) => handlePasajeroChange(index, 'numeroDocumento', e.target.value)}
                              placeholder={index === 0 ? "75132058" : "N°de documento"}
                              maxLength={8}
                              className={`w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-sm ${
                                loadingDNI[index] ? 'bg-red-50 pr-12' : 'pr-3'
                              }`}
                              style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                              disabled={loadingDNI[index]}
                            />
                            {loadingDNI[index] && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#f0251f] border-t-transparent"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Nombres
                          </label>
                          <input
                            type="text"
                            value={pasajero.nombre}
                            onChange={(e) => handlePasajeroChange(index, 'nombre', e.target.value)}
                            placeholder={index === 0 ? "Cristhofer" : ""}
                            className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs"
                            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Apellidos
                          </label>
                          <input
                            type="text"
                            value={pasajero.apellido}
                            onChange={(e) => handlePasajeroChange(index, 'apellido', e.target.value)}
                            placeholder={index === 0 ? "Leonardo" : ""}
                            className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs"
                            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                          />
                        </div>
                      </div>

                      {/* Segunda fila - Fecha de nacimiento y Género */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Fecha de nacimiento
                          </label>
                          <input
                            type="date"
                            value={pasajero.fechaNacimiento}
                            onChange={(e) => handlePasajeroChange(index, 'fechaNacimiento', e.target.value)}
                            className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-sm"
                            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            Género
                          </label>
                          <select
                            value={pasajero.genero}
                            onChange={(e) => handlePasajeroChange(index, 'genero', e.target.value)}
                            className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-sm"
                            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                          >
                            <option value="">Seleccionar género</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Información de contacto */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-sm"
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Confirmación correo
                      </label>
                      <input
                        type="email"
                        value={confirmacionCorreo}
                        onChange={(e) => setConfirmacionCorreo(e.target.value)}
                        className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-sm"
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-sm"
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
                  <div className="space-y-4 mb-6">
                    {/* Yape/Plin */}
                    <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="yape-plin"
                        checked={metodoPago === 'yape-plin'}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-4 h-4 text-[#f0251f] border-gray-300 focus:ring-[#f0251f] focus:ring-2"
                      />
                      <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        Paga con
                      </span>
                      <span className="text-sm font-bold text-purple-600" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        Yape
                      </span>
                      <span className="text-sm text-gray-500" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        o
                      </span>
                      <span className="text-sm font-bold text-blue-600" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        Plin
                      </span>
                      <div className="flex space-x-2 ml-auto">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Y</span>
                        </div>
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                      </div>
                    </label>

                    {/* Tarjeta de Crédito/Débito */}
                    <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="tarjeta"
                        checked={metodoPago === 'tarjeta'}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-4 h-4 text-[#f0251f] border-gray-300 focus:ring-[#f0251f] focus:ring-2"
                      />
                      <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        Tarjeta de Crédito / Débito
                      </span>
                      <span className="text-sm font-bold text-blue-600" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        Openpay
                      </span>
                    </label>

                    {/* PagoEfectivo */}
                    <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="pagoefectivo"
                        checked={metodoPago === 'pagoefectivo'}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-4 h-4 text-[#f0251f] border-gray-300 focus:ring-[#f0251f] focus:ring-2"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-6 bg-yellow-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span className="text-sm font-bold text-gray-700" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                          PagoEfectivo
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Aceptar políticas */}
                  <div className="mb-6">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aceptaPoliticas}
                        onChange={(e) => setAceptaPoliticas(e.target.checked)}
                        className="w-4 h-4 text-[#f0251f] border-gray-300 rounded focus:ring-[#f0251f] focus:ring-2 mt-0.5"
                      />
                      <span className="text-sm text-gray-700" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        Acepto la{' '}
                        <span className="text-[#f0251f] font-semibold cursor-pointer hover:underline">
                          política de privacidad, términos y condiciones
                        </span>{' '}
                        aplicables, y confirmo que cuento con la documentación requerida por la empresa y el Gobierno de Perú.
                      </span>
                    </label>
                  </div>

                  {/* Botón PAGAR */}
                  <button
                    className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-all duration-200 ${
                      aceptaPoliticas && metodoPago
                        ? 'bg-[#f0251f] hover:bg-[#d01f1b] cursor-pointer'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                    disabled={!aceptaPoliticas || !metodoPago}
                  >
                    PAGAR
                  </button>
                </div>
              </div>
            </div>

            {/* Columna derecha - Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  Detalles de la <span className="text-[#f0251f]">compra</span>
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>IDA</span>
                    <span className="px-2 py-1 bg-[#f0251f] text-white text-xs font-semibold rounded" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                      IDA
                    </span>
                  </div>

                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <p className="font-semibold">SUPERNOVA (r)</p>
                    <p>Jue, 25 Sep, 2025</p>
                  </div>

                  <div className="flex items-center text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-gray-600">Lima-Peru</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    Lima (28 de Julio), 13:35 PM
                  </p>

                  <div className="flex items-center text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <svg className="w-4 h-4 text-[#f0251f] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-gray-600">Arequipa-Peru</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    Arequipa (Terminal), 08:00 AM aprox
                  </p>

                  <div className="flex items-center text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Duración: 18hrs aprox</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>2 x 140°</span>
                    <span className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>S/180</span>
                  </div>
                  <div className="bg-[#f0251f] text-white p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>Total</span>
                      <span className="font-bold text-lg" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>S/180</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reserva;