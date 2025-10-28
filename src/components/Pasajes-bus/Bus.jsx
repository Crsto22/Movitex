import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Lottie from 'lottie-react'
import { X } from 'lucide-react'
import asientosDisponibles from '../../assets/icons/asientos-disponibles.svg'
import timon from '../../assets/icons/icon-timon.png'
import asientosSeleccionados from '../../assets/icons/asientos-seleccionados.svg'
import asientosOcupados from '../../assets/icons/asientos-ocupados.svg'
import BusLoadingAnimation from '../../lottiefiles/BusLoading.json'
import { useAsientos } from '../../context/AsientosContext'
import { useViajes } from '../../context/ViajesContext'
import { useCiudades } from '../../context/CiudadesContext'

function Bus({ idViaje = null }) {
  console.log('🚌 Componente Bus iniciado con idViaje:', idViaje)
  
  const navigate = useNavigate()
  const [seatData, setSeatData] = useState([])
  const [allSeatsData, setAllSeatsData] = useState([]) // Almacenar todos los asientos de ambos pisos
  const [hoveredSeat, setHoveredSeat] = useState(null)
  const [activePiso, setActivePiso] = useState('piso1')
  const [pisosDisponibles, setPisosDisponibles] = useState([1])
  
  // Referencia para el contenedor del plano del bus
  const busContainerRef = useRef(null)
  
  // Hook del contexto de asientos
  const { asientos, loading, error, obtenerAsientosPorViaje } = useAsientos()
  
  // Hook del contexto de viajes
  const { viajes } = useViajes()
  
  // Hook del contexto de ciudades
  const { ciudades } = useCiudades()
  
  // Log para monitorear cambios en el contexto
  useEffect(() => {
    console.log('📊 Estados del contexto:')
    console.log('  - asientos:', asientos)
    console.log('  - loading:', loading)
    console.log('  - error:', error)
  }, [asientos, loading, error])

  // Función para procesar los asientos del backend y determinar pisos disponibles
  const processSeatsData = () => {
    console.log(' processSeatsData - asientos recibidos:', asientos)
    console.log(' processSeatsData - activePiso:', activePiso)
    
    if (!asientos || asientos.length === 0) {
      console.log(' No hay asientos disponibles')
      setSeatData([])
      setAllSeatsData([])
      setPisosDisponibles([1])
      return
    }
    
    // Determinar qué pisos están disponibles
    const pisosUnicos = [...new Set(asientos.map(asiento => asiento.piso))].sort()
    console.log(' Pisos únicos encontrados:', pisosUnicos)
    setPisosDisponibles(pisosUnicos)
    
    // Si no hay piso 2 y estamos en piso2, cambiar a piso1
    if (!pisosUnicos.includes(2) && activePiso === 'piso2') {
      console.log('Cambiando a piso1 porque no existe piso2')
      setActivePiso('piso1')
    }
    
    // Generar datos para TODOS los pisos (mantener el estado de selección)
    const allSeats = []
    pisosUnicos.forEach(pisoNum => {
      const asientosPiso = asientos.filter(asiento => asiento.piso === pisoNum)
      const pisoKey = pisoNum === 1 ? 'piso1' : 'piso2'
      const generatedSeats = generateSeatsFromBackendData(asientosPiso, pisoKey, pisoNum)
      allSeats.push(...generatedSeats)
    })
    
    // Mantener el estado de selección de los asientos previamente seleccionados
    const updatedSeats = allSeats.map(newSeat => {
      const existingSeat = allSeatsData.find(s => s.id === newSeat.id)
      if (existingSeat && existingSeat.status === 'selected') {
        return { ...newSeat, status: 'selected' }
      }
      return newSeat
    })
    
    console.log(' Todos los asientos generados:', updatedSeats)
    setAllSeatsData(updatedSeats)
    
    // Filtrar asientos solo del piso activo para visualización
    const pisoNumero = activePiso === 'piso1' ? 1 : 2
    const asientosPisoActivo = updatedSeats.filter(asiento => asiento.pisoNumero === pisoNumero)
    console.log(' Asientos filtrados para piso activo', pisoNumero, ':', asientosPisoActivo)
    setSeatData(asientosPisoActivo)
  }

  // Función para generar la configuración de asientos basada en datos reales del backend
  const generateSeatsFromBackendData = (seatsData, piso = 'piso1', pisoNumero = 1) => {
    if (!seatsData || seatsData.length === 0) return []
    
    // Configuración dinámica basada en la cantidad de asientos
    const seatsPerRow = 4
    const totalColumns = Math.ceil(seatsData.length / seatsPerRow)
    
    // Calcular posiciones dinámicamente - basePosition según pisos disponibles
    const generateLeftPositions = (columns) => {
      const basePosition = 15 
      const columnSpacing = 14
      return Array.from({ length: columns }, (_, i) => basePosition + (i * columnSpacing))
    }
    
    const leftPositions = generateLeftPositions(totalColumns)
    
    // Posiciones verticales - MISMAS para ambos pisos
    const topPositions = [
      { number: 38, label: 38, seat: 39 },
      { number: 29, label: 29, seat: 30 },
      { number: 9, label: 9, seat: 10 },
      { number: 1, label: 1, seat: 2 }
    ]

    const positions = []
    let seatIndex = 0
    
    // Generar posiciones basadas en los datos reales del backend
    for (let col = 0; col < totalColumns && seatIndex < seatsData.length; col++) {
      for (let row = 0; row < seatsPerRow && seatIndex < seatsData.length; row++) {
        const asiento = seatsData[seatIndex]
        
        // Mapear estado del backend al frontend
        let status = 'available'
        if (asiento.estado === 'ocupado') status = 'occupied'
        else if (asiento.estado === 'seleccionado') status = 'selected'
        
        positions.push({
          id: asiento.idAsiento,
          number: asiento.numeroAsiento,
          leftPos: leftPositions[col],
          topPosLabel: topPositions[row]?.number || 49,
          topPosSeat: topPositions[row]?.seat || 50,
          status: status,
          column: col + 1,
          row: row + 1,
          fare: asiento.precio.toFixed(2),
          seatType: `${asiento.anguloReclinacion}°`,
          piso: piso,
          anguloReclinacion: asiento.anguloReclinacion,
          pisoNumero: pisoNumero
        })
        seatIndex++
      }
    }
    
    return positions
  }

  // Cargar asientos cuando se proporciona un idViaje
  useEffect(() => {
    console.log(' useEffect idViaje - idViaje:', idViaje)
    if (idViaje) {
      console.log(' Llamando a obtenerAsientosPorViaje con:', idViaje)
      obtenerAsientosPorViaje(idViaje)
    } else {
      console.log(' No se proporcionó idViaje')
    }
  }, [idViaje, obtenerAsientosPorViaje])
  
  // Procesar datos cuando cambien los asientos del backend (solo al inicio o actualización)
  useEffect(() => {
    console.log(' useEffect processSeatsData - ejecutando processSeatsData')
    processSeatsData()
  }, [asientos])

  // Actualizar vista cuando cambia el piso activo (sin resetear selecciones)
  useEffect(() => {
    if (allSeatsData.length > 0) {
      const pisoNumero = activePiso === 'piso1' ? 1 : 2
      const asientosPisoActivo = allSeatsData.filter(asiento => asiento.pisoNumero === pisoNumero)
      setSeatData(asientosPisoActivo)
    }
  }, [activePiso])

  // Función para cambiar entre pisos
  const handlePisoChange = (piso) => {
    const pisoNumero = piso === 'piso1' ? 1 : 2
    if (pisosDisponibles.includes(pisoNumero)) {
      setActivePiso(piso)
      setHoveredSeat(null)
    }
  }

  // Función para manejar la selección de asientos
  const handleSeatClick = (seatId) => {
    // Actualizar en allSeatsData (estado global)
    setAllSeatsData(prevAllSeats => {
      const selectedSeats = prevAllSeats.filter(seat => seat.status === 'selected')
      const clickedSeat = prevAllSeats.find(seat => seat.id === seatId)
      
      // Si el asiento ya está seleccionado, permitir deseleccionarlo
      if (clickedSeat.status === 'selected') {
        const updated = prevAllSeats.map(seat => 
          seat.id === seatId 
            ? { ...seat, status: 'available' }
            : seat
        )
        
        // Actualizar también la vista del piso actual
        const pisoNumero = activePiso === 'piso1' ? 1 : 2
        setSeatData(updated.filter(s => s.pisoNumero === pisoNumero))
        
        return updated
      }
      
      // Si ya hay 8 asientos seleccionados, no permitir seleccionar más
      if (selectedSeats.length >= 8) {
        alert('Máximo 8 asientos por compra')
        return prevAllSeats
      }
      
      // Seleccionar el asiento
      const updated = prevAllSeats.map(seat => 
        seat.id === seatId 
          ? { ...seat, status: 'selected' }
          : seat
      )
      
      // Actualizar también la vista del piso actual
      const pisoNumero = activePiso === 'piso1' ? 1 : 2
      setSeatData(updated.filter(s => s.pisoNumero === pisoNumero))
      
      return updated
    })
  }

  // Calcular asientos seleccionados y total desde allSeatsData
  const selectedSeats = allSeatsData.filter(seat => seat.status === 'selected')
  const totalPrice = selectedSeats.reduce((total, seat) => total + parseFloat(seat.fare), 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-4xl mx-auto bg-white border border-gray-300 rounded-2xl h-56 flex items-center justify-center">
          <div className="text-center">
            <div className="w-28 h-28 overflow-hidden relative">
              <div className="absolute -top-2 -right-4 w-full">
                <Lottie 
                  animationData={BusLoadingAnimation} 
                  loop={true}
                  autoplay={true}
                  style={{ width: '140px', height: '140px' }}
                />
              </div>
            </div>
            <p className="mt-2 text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>Cargando asientos...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-2xl h-56 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error al cargar asientos: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full">
        {/* Tabs para seleccionar piso - Solo mostrar si hay múltiples pisos */}
        {pisosDisponibles.length > 1 && (
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1 border border-gray-300">
              <div className="flex">
                {pisosDisponibles.includes(1) && (
                  <button
                    onClick={() => handlePisoChange('piso1')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activePiso === 'piso1'
                        ? 'bg-[#f0251f] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                  >
                    Piso 1
                  </button>
                )}
                {pisosDisponibles.includes(2) && (
                  <button
                    onClick={() => handlePisoChange('piso2')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activePiso === 'piso2'
                        ? 'bg-[#f0251f] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                  >
                    Piso 2
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leyenda de asientos */}
        <div className="flex justify-center mb-4 space-x-3 sm:space-x-6">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <img src={asientosDisponibles} alt="Disponible" className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
              Disponible
            </span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <img src={asientosSeleccionados} alt="Seleccionado" className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
              Seleccionado
            </span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <img src={asientosOcupados} alt="Ocupado" className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
              Ocupado
            </span>
          </div>
        </div>
        <div 
          ref={busContainerRef}
          className="w-full max-w-3xl mx-auto bg-gray-50 border border-gray-300 rounded-2xl h-48
          flex items-center justify-center relative"
        >
          {/* Elementos fijos del bus - Solo visible en Piso 1 */}
          {activePiso === 'piso1' && (
            <>
              <div className="absolute left-13 top-0 h-2/5 border-l-2 border-gray-300"></div>
              <img src={timon} alt="Timon" className="w-3 h-3 sm:w-4 sm:h-4 absolute left-5 bottom-5 sm:bottom-7" />
              <div className="absolute left-13 top-3/5 h-2/5 border-l-2 border-gray-300"></div>
            </>
          )}

          {/* Generación dinámica de asientos desde backend */}
          {console.log('🎯 Renderizando asientos - seatData.length:', seatData.length)}
          {seatData.map((seat) => (
            <div key={seat.id}>
              {/* Número del asiento */}
              <div 
                className={`absolute text-xs flex items-center justify-center w-10 h-7 z-10 pointer-events-none ${
                  seat.status === 'selected' ? 'text-white' : seat.status === 'occupied' ? 'text-gray-400' : 'text-gray-700'
                }`}
                style={{ 
                  top: `${seat.topPosSeat * 0.25}rem`, 
                  left: `${seat.leftPos * 0.25}rem`, 
                fontFamily: 'Inter_18pt-Medium, sans-serif'
                }}
              >
                {seat.number}
              </div>
              
              {/* Imagen del asiento clickeable */}
              <img 
                src={seat.status === 'selected' ? asientosSeleccionados : 
                     seat.status === 'occupied' ? asientosOcupados : asientosDisponibles} 
                alt={`Asiento ${seat.number}`} 
                className={`w-10 h-10 absolute transition-all duration-200 ${
                  seat.status === 'occupied' ? 'opacity-30 cursor-no-drop' : 'cursor-pointer hover:opacity-75'
                }`}
                style={{ 
                  top: `${seat.topPosSeat * 0.25}rem`, 
                  left: `${seat.leftPos * 0.25}rem` 
                }}
                onClick={() => seat.status !== 'occupied' && handleSeatClick(seat.id)}
                onMouseEnter={() => seat.status !== 'occupied' && setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
              />

            
              {/* Tooltip - Solo para asientos disponibles y seleccionados */}
              {hoveredSeat && hoveredSeat.id === seat.id && seat.status !== 'occupied' && (
                <div
                  className="absolute bg-[#fab926] text-white text-xs sm:text-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 z-20 shadow-lg whitespace-nowrap"
                  style={{
                    top: `${seat.topPosSeat * 0.25 - 4.5}rem`,
                    left: `${seat.leftPos * 0.25 + 1.25}rem`,
                    transform: 'translateX(-50%)',
                    fontFamily: 'Inter_18pt-Medium, sans-serif'
                  }}
                >
                  <div className="text-center" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                    <div className="font-semibold">Asiento: {seat.number}</div>
                    <div className="">Tarifa: S/. {seat.fare}</div>
                    <div className="">Tipo: {seat.anguloReclinacion}°</div>
                  </div>
                  {/* Flecha del tooltip */}
                  <div 
                    className="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"
                    style={{
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Botón Continuar con precio total */}
        <div className="flex justify-end mt-6">
          <div className="">
            <button 
              className={`w-full font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition-colors duration-200 text-sm sm:text-base ${
                selectedSeats.length > 0
                  ? 'bg-[#f0251f] hover:bg-[#f0151f] cursor-pointer text-white'
                  : 'bg-gray-400 cursor-not-allowed text-gray-200'
              }`}
              style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
              disabled={selectedSeats.length === 0}
              onClick={() => {
                if (selectedSeats.length > 0) {
                  console.log('Asientos seleccionados:', selectedSeats)
                  
                  // Buscar datos del viaje seleccionado
                  const viajeSeleccionado = viajes.find(viaje => viaje.idViaje === idViaje)
                  
                  // Obtener datos de origen y destino desde sessionStorage o URL
                  const origenDestino = sessionStorage.getItem('busqueda_viajes')
                  let datosRuta = null
                  
                  if (origenDestino) {
                    try {
                      datosRuta = JSON.parse(origenDestino)
                    } catch (error) {
                      console.error('Error al parsear datos de búsqueda:', error)
                    }
                  }
                  
                  // Buscar los nombres completos de las ciudades
                  const ciudadOrigen = ciudades.find(ciudad => 
                    ciudad.nombre.toLowerCase() === datosRuta?.ciudadOrigen?.toLowerCase()
                  )
                  const ciudadDestino = ciudades.find(ciudad => 
                    ciudad.nombre.toLowerCase() === datosRuta?.ciudadDestino?.toLowerCase()
                  )
                  
                  console.log(' Datos del viaje seleccionado:', viajeSeleccionado)
                  console.log(' Datos de ruta:', datosRuta)
                  console.log(' Ciudades encontradas:', { ciudadOrigen, ciudadDestino })
                  
                  // Preparar asientos seleccionados
                  const asientosSeleccionados = selectedSeats.map(seat => ({
                    id: seat.id,
                    numero: seat.number,
                    precio: parseFloat(seat.fare),
                    tipo: seat.anguloReclinacion,
                    piso: seat.pisoNumero
                  }))

                  // Preparar datos del viaje
                  const datosViaje = {
                    tipoServicio: viajeSeleccionado?.tipoServicio || 'Movitex One',
                    fecha: viajeSeleccionado?.fechaIda || datosRuta?.fecha || new Date().toISOString(),
                    horaPartida: viajeSeleccionado?.horaSalida || null,
                    horaLlegada: null, // Calculado dinámicamente si existe duración
                    duracionAprox: viajeSeleccionado?.duracionEstimada || null,
                    ciudadOrigen: ciudadOrigen ? { 
                      nombre: ciudadOrigen.nombre 
                    } : (datosRuta?.ciudadOrigen ? {
                      nombre: datosRuta.ciudadOrigen
                    } : null),
                    ciudadDestino: ciudadDestino ? { 
                      nombre: ciudadDestino.nombre 
                    } : (datosRuta?.ciudadDestino ? {
                      nombre: datosRuta.ciudadDestino
                    } : null),
                    terminalOrigen: ciudadOrigen?.terminal || null,
                    terminalDestino: ciudadDestino?.terminal || null,
                    tipoAsiento: selectedSeats[0]?.anguloReclinacion || '140°'
                  }
                  
                  // VERIFICAR SI HAY CAMBIOS EN LA SELECCIÓN DE ASIENTOS
                  const existingData = sessionStorage.getItem('movitex_reserva_completa')
                  let shouldReinitialize = false
                  
                  if (existingData) {
                    try {
                      const parsedData = JSON.parse(existingData)
                      
                      // Verificar si los asientos seleccionados son diferentes
                      const existingSeats = parsedData.asientosSeleccionados || []
                      const newSeatIds = asientosSeleccionados.map(s => s.id).sort()
                      const existingSeatIds = existingSeats.map(s => s.id).sort()
                      
                      const seatsDifferent = JSON.stringify(newSeatIds) !== JSON.stringify(existingSeatIds)
                      const viajesDifferent = parsedData.idViaje !== idViaje
                      
                      if (seatsDifferent || viajesDifferent) {
                        console.log(' Detectados cambios en la selección:', {
                          asientosDiferentes: seatsDifferent,
                          viajesDiferentes: viajesDifferent,
                          asientosAnteriores: existingSeatIds,
                          asientosNuevos: newSeatIds
                        })
                        shouldReinitialize = true
                      }
                    } catch (error) {
                      console.error('Error al verificar datos existentes:', error)
                      shouldReinitialize = true
                    }
                  }
                  
                  // Configurar cronómetro
                  const tiempoInicio = Date.now()
                  const tiempoLimite = tiempoInicio + (10 * 60 * 1000) // 10 minutos
                  
                  if (shouldReinitialize) {
                    //  HAY CAMBIOS: Limpiar y reiniciar con nuevos datos
                    console.log(' Reiniciando sessionStorage con nuevos datos de asientos')
                    
                    // Limpiar datos anteriores
                    sessionStorage.removeItem('movitex_reserva_completa')
                    sessionStorage.removeItem('movitex_reserva_data')
                    sessionStorage.removeItem('movitex_timer_start')
                    sessionStorage.removeItem('movitex_timer_limit')
                    sessionStorage.removeItem('movitex_formulario_data')
                  }
                  
                  //  CREAR NUEVA ESTRUCTURA CONSOLIDADA
                  const nuevaReservaCompleta = {
                    datosViaje: datosViaje,
                    asientosSeleccionados: asientosSeleccionados,
                    totalPrecio: totalPrice,
                    idViaje: idViaje,
                    timerStart: tiempoInicio,
                    timerLimit: tiempoLimite,
                    formulario: {
                      pasajeros: [],
                      correo: '',
                      confirmacionCorreo: '',
                      telefono: '',
                      codigoPromocional: '',
                      metodoPago: '',
                      aceptaPoliticas: false
                    },
                    timestamp: Date.now()
                  }
                  
                  // Guardar nueva estructura
                  sessionStorage.setItem('movitex_reserva_completa', JSON.stringify(nuevaReservaCompleta))
                  
                  console.log(' Datos de reserva actualizados:', {
                    reiniciado: shouldReinitialize,
                    asientos: asientosSeleccionados.length,
                    total: totalPrice,
                    viaje: idViaje
                  })
                  
                  // Navegar a la página de reserva
                  navigate('/pasajes-bus/reserva')
                }
              }}
            >
              Continuar - S/. {totalPrice.toFixed(2)}
            </button>
            <div className="text-center mt-2">
              <span className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                {selectedSeats.length} asiento{selectedSeats.length !== 1 ? 's' : ''} seleccionado{selectedSeats.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default Bus