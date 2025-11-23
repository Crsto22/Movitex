// contexto de reservas - maneja todo el proceso de reserva de pasajes
// gestiona: seleccion de asientos, datos de pasajeros, pago, y creacion de reserva en el backend

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDNIData, validateDNI } from '../services/dniService'
import { supabase } from '../supabase/supabase'
import { 
  generateTransactionId, 
  getTokenSession, 
  createIzipayConfig, 
  loadIzipayForm,
  isPaymentSuccessful,
  getPaymentErrorMessage,
  guardarTransaccion
} from '../services/izipayService'

// Crear el contexto
const ReservaContext = createContext()

// Hook personalizado para usar el contexto
export const useReserva = () => {
  const context = useContext(ReservaContext)
  if (!context) {
    throw new Error('useReserva must be used within a ReservaProvider')
  }
  return context
}

// Proveedor del contexto
export const ReservaProvider = ({ children }) => {
  const navigate = useNavigate()

  // Estados del cronómetro de reserva (15 minutos para completar)
  const [tiempoRestante, setTiempoRestante] = useState(0)           // tiempo restante en milisegundos
  const [mostrarModalTiempo, setMostrarModalTiempo] = useState(false) // mostrar aviso de tiempo agotado

  // Estados de la reserva actual
  const [asientosReservados, setAsientosReservados] = useState([])  // asientos seleccionados por el usuario
  const [totalPrecio, setTotalPrecio] = useState(0)                 // precio total de la reserva
  const [idViaje, setIdViaje] = useState(null)                      // id del viaje seleccionado
  const [datosViaje, setDatosViaje] = useState(null)                // informacion completa del viaje

  // Estados del formulario de pasajeros
  const [pasajeros, setPasajeros] = useState([])                    // datos de cada pasajero
  const [correo, setCorreo] = useState('')                          // correo de contacto
  const [confirmacionCorreo, setConfirmacionCorreo] = useState('')  // confirmacion de correo
  const [telefono, setTelefono] = useState('')                      // telefono de contacto
  const [codigoPromocional, setCodigoPromocional] = useState('')    // codigo de descuento
  const [metodoPago, setMetodoPago] = useState('')                  // metodo de pago seleccionado
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false)     // aceptacion de terminos

  // Estados para consulta de dni (api externa)
  const [loadingDNI, setLoadingDNI] = useState({})                  // estado de carga por pasajero
  const [inicializado, setInicializado] = useState(false)           // si ya se cargo la reserva
  const timeoutRefs = useRef({})                                    // timeouts para busqueda de dni

  // Estados del proceso de pago y creacion de reserva
  const [procesandoPago, setProcesandoPago] = useState(false)       // si esta procesando el pago
  const [errorPago, setErrorPago] = useState(null)                  // errores en el proceso
  const [reservaExitosa, setReservaExitosa] = useState(null)        // datos de reserva exitosa

  // Estados para la boleta de viaje
  const [datosBoleta, setDatosBoleta] = useState(null)              // datos de la boleta
  const [cargandoBoleta, setCargandoBoleta] = useState(false)       // cargando boleta
  const [errorBoleta, setErrorBoleta] = useState(null)              // errores al obtener boleta

  // Estados de Izipay
  const [izipayToken, setIzipayToken] = useState(null)              // token de sesion de Izipay
  const [cargandoIzipay, setCargandoIzipay] = useState(false)       // cargando checkout de Izipay
  const [transactionData, setTransactionData] = useState(null)      // datos de la transaccion

  // Función para inicializar reserva desde sessionStorage
  const inicializarReserva = useCallback((allowEmpty = false, forzarReinicio = false, nuevosAsientos = null, nuevoIdViaje = null, nuevoDatosViaje = null, nuevoTotal = null, nuevoCronometro = null) => {
    // Si hay datos nuevos que requieren reinicio, usar la función de reinicio
    if (forzarReinicio && nuevosAsientos && nuevoIdViaje !== null) {
      console.log(' Forzando reinicio con nuevos datos de asientos')
      console.log(' Forzando reinicio con nuevos datos de asientos')
      reiniciarReservaConNuevosDatos(nuevosAsientos, nuevoIdViaje, nuevoDatosViaje, nuevoTotal, nuevoCronometro)
      return true
    }
    
    // Si ya se inicializó y no se fuerza reinicio, no hacer nada
    if (inicializado && !forzarReinicio) return true
    
    // Intentar cargar la nueva estructura consolidada primero
    let reservaCompleta = sessionStorage.getItem('movitex_reserva_completa')
    
    // Si no existe la nueva estructura, migrar desde la estructura antigua
    if (!reservaCompleta) {
      const reservaData = sessionStorage.getItem('movitex_reserva_data')
      const timerStart = sessionStorage.getItem('movitex_timer_start')
      const timerLimit = sessionStorage.getItem('movitex_timer_limit')
      const formularioData = sessionStorage.getItem('movitex_formulario_data')
      
      // Si no hay datos de reserva y no se permite vacío, redirigir
      if (!reservaData && !allowEmpty) {
        navigate('/inicio')
        return false
      }
      
      // Migrar a la nueva estructura
      try {
        const oldReservaData = JSON.parse(reservaData)
        const oldFormularioData = formularioData ? JSON.parse(formularioData) : null
        
        const nuevaEstructura = {
          // Datos del viaje y reserva
          datosViaje: oldReservaData.datosViaje || null,
          asientosSeleccionados: oldReservaData.asientosSeleccionados || [],
          totalPrecio: oldReservaData.totalPrecio || 0,
          idViaje: oldReservaData.idViaje || null,
          
          // Datos del cronómetro
          timerStart: timerStart ? parseInt(timerStart) : null,
          timerLimit: timerLimit ? parseInt(timerLimit) : null,
          
          // Datos del formulario
          formulario: oldFormularioData || {
            pasajeros: [],
            correo: '',
            confirmacionCorreo: '',
            telefono: '',
            codigoPromocional: '',
            metodoPago: '',
            aceptaPoliticas: false
          }
        }
        
        // Guardar la nueva estructura y limpiar las antiguas
        sessionStorage.setItem('movitex_reserva_completa', JSON.stringify(nuevaEstructura))
        sessionStorage.removeItem('movitex_reserva_data')
        sessionStorage.removeItem('movitex_timer_start')
        sessionStorage.removeItem('movitex_timer_limit')
        sessionStorage.removeItem('movitex_formulario_data')
        
        reservaCompleta = JSON.stringify(nuevaEstructura)
      } catch (error) {
        console.error('Error migrando estructura antigua:', error)
        navigate('/pasajes-bus')
        return false
      }
    }
    
    // Si no hay datos de reserva y no se permite vacío, redirigir
    if (!reservaCompleta && !allowEmpty) {
      navigate('/inicio')
      return false
    }

    // Si no hay datos pero se permite vacío (para páginas como confirmación), 
    // simplemente marcar como inicializado y continuar
    if (!reservaCompleta && allowEmpty) {
      setInicializado(true)
      return true
    }

    try {
      // Cargar datos de la estructura consolidada
      const data = JSON.parse(reservaCompleta)
      
      // Cargar datos de reserva
      setAsientosReservados(data.asientosSeleccionados || [])
      setTotalPrecio(data.totalPrecio || 0)
      setIdViaje(data.idViaje || null)
      
      // Cargar datos del viaje si existen
      if (data.datosViaje) {
        console.log(' Datos del viaje cargados:', data.datosViaje)
        setDatosViaje(data.datosViaje)
      } else {
        console.log(' No se encontraron datos del viaje en la reserva')
      }

      // Generar formularios dinámicos según asientos seleccionados
      const pasajerosIniciales = data.asientosSeleccionados.map((asiento, index) => ({
        id: index + 1,
        asiento: asiento.numero.toString(),
        id_asiento: asiento.id || asiento.numero, // Agregar el id_asiento
        precio: asiento.precio || (data.totalPrecio / data.asientosSeleccionados.length) || 0, // Agregar el precio del asiento
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        genero: ''
      }))

      setPasajeros(pasajerosIniciales)

      // Cargar datos del usuario desde localStorage si está logueado
      const userData = localStorage.getItem('movitex_user_data')
      let userInfo = null
      if (userData) {
        try {
          userInfo = JSON.parse(userData)
          console.log(' Datos del usuario encontrados:', userInfo)
        } catch (error) {
          console.error('Error al parsear datos del usuario:', error)
        }
      }

      // Cargar datos del formulario si existen, sino usar datos del usuario
      if (data.formulario && data.formulario.pasajeros) {
        if (data.formulario.pasajeros.length === pasajerosIniciales.length) {
          // Si hay usuario logueado, autocompletar primer pasajero con datos del usuario si están vacíos
          let pasajerosFormulario = [...data.formulario.pasajeros]
          if (userInfo && pasajerosFormulario.length > 0) {
            const primerPasajero = pasajerosFormulario[0]
            pasajerosFormulario[0] = {
              ...primerPasajero,
              numeroDocumento: primerPasajero.numeroDocumento || userInfo.dni || '',
              nombre: primerPasajero.nombre || userInfo.nombre || '',
              apellido: primerPasajero.apellido || userInfo.apellido || '',
              fechaNacimiento: primerPasajero.fechaNacimiento || userInfo.fecha_nacimiento || '',
              genero: primerPasajero.genero || userInfo.genero || ''
            }
            console.log('👤 Completando datos faltantes del primer pasajero con datos del usuario')
          }
          setPasajeros(pasajerosFormulario)
        }
        // Si hay datos guardados del formulario, usarlos
        setCorreo(data.formulario.correo || (userInfo?.correo || ''))
        setConfirmacionCorreo(data.formulario.confirmacionCorreo || (userInfo?.correo || ''))
        setTelefono(data.formulario.telefono || (userInfo?.telefono || ''))
        setCodigoPromocional(data.formulario.codigoPromocional || '')
        setMetodoPago(data.formulario.metodoPago || '')
        setAceptaPoliticas(data.formulario.aceptaPoliticas || false)
      } else if (userInfo) {
        // Si no hay datos del formulario pero hay usuario logueado, usar sus datos
        console.log('📝 Autocompletando con datos del usuario logueado')
        setCorreo(userInfo.correo || '')
        setConfirmacionCorreo(userInfo.correo || '')
        setTelefono(userInfo.telefono || '')
        
        // Autocompletar datos del primer pasajero con datos del usuario
        if (pasajerosIniciales.length > 0) {
          const pasajerosConDatos = [...pasajerosIniciales]
          pasajerosConDatos[0] = {
            ...pasajerosConDatos[0],
            numeroDocumento: userInfo.dni || '',
            nombre: userInfo.nombre || '',
            apellido: userInfo.apellido || '',
            fechaNacimiento: userInfo.fecha_nacimiento || '',
            genero: userInfo.genero || ''
          }
          setPasajeros(pasajerosConDatos)
          console.log('👤 Primer pasajero autocompletado con datos del usuario')
        }
      }

      // Configurar cronómetro
      if (data.timerStart && data.timerLimit) {
        const ahora = Date.now()
        const limite = data.timerLimit
        const restante = Math.max(0, limite - ahora)

        if (restante <= 0) {
          setMostrarModalTiempo(true)
        } else {
          setTiempoRestante(restante)
        }
      }

      setInicializado(true)
      return true
    } catch (error) {
      console.error('Error al cargar datos de reserva:', error)
      navigate('/pasajes-bus')
      return false
    }
  }, [navigate, inicializado])

  // Función para limpiar datos de reserva
  const limpiarReserva = useCallback(() => {
    // Limpiar tanto la nueva estructura como las antiguas (por compatibilidad)
    sessionStorage.removeItem('movitex_reserva_completa')
    sessionStorage.removeItem('movitex_reserva_data')
    sessionStorage.removeItem('movitex_timer_start')
    sessionStorage.removeItem('movitex_timer_limit')
    sessionStorage.removeItem('movitex_formulario_data')

    // Resetear estados
    setAsientosReservados([])
    setTotalPrecio(0)
    setIdViaje(null)
    setDatosViaje(null)
    setPasajeros([])
    setCorreo('')
    setConfirmacionCorreo('')
    setTelefono('')
    setCodigoPromocional('')
    setMetodoPago('')
    setAceptaPoliticas(false)
    setTiempoRestante(0)
    setMostrarModalTiempo(false)
    setLoadingDNI({})
    setReservaExitosa(null) // Limpiar también el estado de reserva exitosa
    setErrorPago(null)
    setProcesandoPago(false)
    setDatosBoleta(null) // Limpiar datos de boleta
    setErrorBoleta(null)
    setCargandoBoleta(false)
    setInicializado(false)
  }, [])

  // Función para reiniciar reserva con nuevos datos (cuando se seleccionan nuevos asientos)
  const reiniciarReservaConNuevosDatos = useCallback((nuevosAsientos, nuevoIdViaje, nuevoDatosViaje, nuevoTotal, nuevoCronometro) => {
    console.log('🔄 Reiniciando reserva con nuevos datos de asientos...')
    
    // Limpiar completamente el sessionStorage anterior
    sessionStorage.removeItem('movitex_reserva_completa')
    sessionStorage.removeItem('movitex_reserva_data')
    sessionStorage.removeItem('movitex_timer_start')
    sessionStorage.removeItem('movitex_timer_limit')
    sessionStorage.removeItem('movitex_formulario_data')
    
    // Resetear todos los estados a valores iniciales
    setAsientosReservados([])
    setTotalPrecio(0)
    setIdViaje(null)
    setDatosViaje(null)
    setPasajeros([])
    setCorreo('')
    setConfirmacionCorreo('')
    setTelefono('')
    setCodigoPromocional('')
    setMetodoPago('')
    setAceptaPoliticas(false)
    setTiempoRestante(0)
    setMostrarModalTiempo(false)
    setLoadingDNI({})
    setReservaExitosa(null)
    setErrorPago(null)
    setProcesandoPago(false)
    setDatosBoleta(null)
    setErrorBoleta(null)
    setCargandoBoleta(false)
    
    // Marcar como no inicializado para forzar reinicialización
    setInicializado(false)
    
    // Establecer nuevos datos inmediatamente
    setAsientosReservados(nuevosAsientos)
    setTotalPrecio(nuevoTotal)
    setIdViaje(nuevoIdViaje)
    setDatosViaje(nuevoDatosViaje)
    
    // Configurar nuevo cronómetro si se proporciona
    if (nuevoCronometro && nuevoCronometro.timerStart && nuevoCronometro.timerLimit) {
      const ahora = Date.now()
      const limite = nuevoCronometro.timerLimit
      const restante = Math.max(0, limite - ahora)
      
      if (restante <= 0) {
        setMostrarModalTiempo(true)
      } else {
        setTiempoRestante(restante)
      }
    }
    
    // Crear nueva estructura de datos para sessionStorage
    const nuevaReservaCompleta = {
      datosViaje: nuevoDatosViaje,
      asientosSeleccionados: nuevosAsientos,
      totalPrecio: nuevoTotal,
      idViaje: nuevoIdViaje,
      timerStart: nuevoCronometro?.timerStart || null,
      timerLimit: nuevoCronometro?.timerLimit || null,
      formulario: {
        pasajeros: [],
        correo: '',
        confirmacionCorreo: '',
        telefono: '',
        codigoPromocional: '',
        metodoPago: '',
        aceptaPoliticas: false
      }
    }
    
    sessionStorage.setItem('movitex_reserva_completa', JSON.stringify(nuevaReservaCompleta))
    
    console.log('Reserva reiniciada con nuevos datos:', {
      asientos: nuevosAsientos.length,
      total: nuevoTotal,
      viaje: nuevoIdViaje
    })
    
    // Marcar como inicializado después de configurar todo
    setInicializado(true)
  }, [])

  // Función para manejar tiempo agotado
  const handleTiempoAgotado = useCallback(() => {
    limpiarReserva()
    navigate('/pasajes-bus')
  }, [limpiarReserva, navigate])

  // Función para formatear tiempo restante
  const formatTiempo = useCallback((tiempo) => {
    const minutos = Math.floor(tiempo / 60000)
    const segundos = Math.floor((tiempo % 60000) / 1000)
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
  }, [])

  // Función para manejar cambios en pasajeros
  const handlePasajeroChange = (index, field, value) => {
    const newPasajeros = [...pasajeros]

    // Si es el campo de número de documento, manejar la lógica de DNI
    if (field === 'numeroDocumento') {
      const dniAnterior = newPasajeros[index].numeroDocumento

      // Actualizar el DNI inmediatamente
      newPasajeros[index][field] = value
      setPasajeros(newPasajeros)

      // Manejar la búsqueda de DNI
      handleDNIChange(index, value, dniAnterior)
    } else {
      // Para otros campos, actualizar normalmente
      newPasajeros[index][field] = value
      setPasajeros(newPasajeros)
    }
  }

  // Función para manejar cambios en DNI
  const handleDNIChange = (index, dni, dniAnterior) => {
    // Limpiar timeout anterior si existe
    if (timeoutRefs.current[index]) {
      clearTimeout(timeoutRefs.current[index])
    }

    // Limpiar estado de loading si el DNI no es válido
    if (!validateDNI(dni)) {
      setLoadingDNI(prev => ({
        ...prev,
        [index]: false
      }))
      return
    }

    // Si el DNI cambió (y no está vacío), limpiar los campos inmediatamente
    if (dni !== dniAnterior && dni.length > 0) {
      setPasajeros(prev => {
        const newPasajeros = [...prev]
        newPasajeros[index] = {
          ...newPasajeros[index],
          nombre: '',
          apellido: ''
        }
        return newPasajeros
      })
    }

    // Establecer nuevo timeout para la búsqueda solo si el DNI es válido
    if (validateDNI(dni)) {
      timeoutRefs.current[index] = setTimeout(async () => {
        await buscarDNI(index, dni)
      }, 1500)
    }
  }

  // Función para buscar DNI
  const buscarDNI = async (index, dni) => {
    if (!validateDNI(dni)) return

    // Verificar que el DNI actual siga siendo el mismo
    const currentDNI = pasajeros[index]?.numeroDocumento
    if (currentDNI !== dni) {
      return
    }

    try {
      setLoadingDNI(prev => ({
        ...prev,
        [index]: true
      }))

      const result = await getDNIData(dni)

      if (result.success && result.data) {
        // Verificar nuevamente que el DNI no haya cambiado durante la búsqueda
        setPasajeros(prev => {
          const currentDNI = prev[index]?.numeroDocumento
          if (currentDNI === dni) {
            const newPasajeros = [...prev]
            newPasajeros[index] = {
              ...newPasajeros[index],
              nombre: result.data.nombre || '',
              apellido: result.data.apellido || ''
            }
            return newPasajeros
          }
          return prev
        })
      } else {
        // Si no se encontraron datos, limpiar los campos
        setPasajeros(prev => {
          const currentDNI = prev[index]?.numeroDocumento
          if (currentDNI === dni) {
            const newPasajeros = [...prev]
            newPasajeros[index] = {
              ...newPasajeros[index],
              nombre: '',
              apellido: ''
            }
            return newPasajeros
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Error al buscar DNI:', error)
      // En caso de error, limpiar los campos
      setPasajeros(prev => {
        const currentDNI = prev[index]?.numeroDocumento
        if (currentDNI === dni) {
          const newPasajeros = [...prev]
          newPasajeros[index] = {
            ...newPasajeros[index],
            nombre: '',
            apellido: ''
          }
          return newPasajeros
        }
        return prev
      })
    } finally {
      setLoadingDNI(prev => ({
        ...prev,
        [index]: false
      }))
    }
  }

  // Inicialización automática una sola vez
  useEffect(() => {
    if (!inicializado) {
      // Verificar si estamos en una página de confirmación
      const isConfirmationPage = window.location.pathname.includes('/confirmacion/')
      inicializarReserva(isConfirmationPage)
    }
  }, [inicializarReserva, inicializado])

  // Función para detectar y manejar cambios en sessionStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'movitex_reserva_completa' && e.newValue && inicializado) {
        console.log(' Detectado cambio en sessionStorage, reinicializando contexto...')
        setInicializado(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [inicializado])

  // Cronómetro
  useEffect(() => {
    let interval

    if (tiempoRestante > 0) {
      interval = setInterval(() => {
        setTiempoRestante(prev => {
          const nuevo = prev - 1000

          if (nuevo <= 0) {
            setMostrarModalTiempo(true)
            return 0
          }

          return nuevo
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [tiempoRestante])

  // Guardar datos completos de la reserva en sessionStorage
  useEffect(() => {
    if (pasajeros.length > 0 && asientosReservados.length > 0) {
      // Obtener datos existentes o crear estructura nueva
      const existingData = sessionStorage.getItem('movitex_reserva_completa')
      let reservaCompleta = existingData ? JSON.parse(existingData) : {}
      
      // Actualizar con los datos actuales
      reservaCompleta = {
        ...reservaCompleta,
        // Datos del viaje y reserva (solo actualizar si existen)
        datosViaje: datosViaje || reservaCompleta.datosViaje || null,
        asientosSeleccionados: asientosReservados,
        totalPrecio: totalPrecio,
        idViaje: idViaje || reservaCompleta.idViaje || null,
        
        // Datos del cronómetro (mantener los existentes si no hay nuevos)
        timerStart: reservaCompleta.timerStart || null,
        timerLimit: reservaCompleta.timerLimit || null,
        
        // Datos del formulario (siempre actualizar)
        formulario: {
          pasajeros,
          correo,
          confirmacionCorreo,
          telefono,
          codigoPromocional,
          metodoPago,
          aceptaPoliticas
        }
      }

      sessionStorage.setItem('movitex_reserva_completa', JSON.stringify(reservaCompleta))
    }
  }, [pasajeros, correo, confirmacionCorreo, telefono, codigoPromocional, metodoPago, aceptaPoliticas, asientosReservados, totalPrecio, idViaje, datosViaje])

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])

  // funcion para verificar si hay usuario logueado
  const isUserLoggedIn = () => {
    const userData = localStorage.getItem('movitex_user_data')
    return userData !== null
  }

  // funcion principal: crear reserva en el backend
  // maneja dos casos: usuarios logueados y usuarios anonimos
  const crearReserva = useCallback(async () => {
    if (procesandoPago) return // evitar doble procesamiento

    try {
      setProcesandoPago(true)
      setErrorPago(null)

      // obtener id del usuario desde localstorage
      let userId = localStorage.getItem('id_usuario')
      
      // si no hay id_usuario directamente, intentar obtenerlo de movitex_user_data
      if (!userId) {
        const userData = localStorage.getItem('movitex_user_data')
        if (userData) {
          const userInfo = JSON.parse(userData)
          userId = userInfo.id_usuario || userInfo.id
        }
      }

      // determinar si es usuario logueado o anonimo
      const esUsuarioLogueado = !!userId

      // validar que tengamos todos los datos necesarios
      if (!asientosReservados.length || !pasajeros.length) {
        throw new Error('No hay datos de reserva disponibles')
      }

      if (!idViaje) {
        throw new Error('No se ha seleccionado un viaje válido')
      }

      if (!metodoPago) {
        throw new Error('Debe seleccionar un método de pago')
      }

      if (!aceptaPoliticas) {
        throw new Error('Debe aceptar las políticas de privacidad')
      }

      // validar datos de pasajeros
      for (let i = 0; i < pasajeros.length; i++) {
        const pasajero = pasajeros[i]
        if (!pasajero.numeroDocumento || !pasajero.nombre || !pasajero.apellido || 
            !pasajero.fechaNacimiento || !pasajero.genero || !pasajero.id_asiento) {
          throw new Error(`Datos incompletos para el pasajero ${i + 1}`)
        }
      }

      // preparar array de pasajeros en el formato que espera la funcion sql
      const pasajerosParaSQL = pasajeros.map((pasajero, index) => {
        // validar cada campo individualmente
        const pasajeroSQL = {
          numeroDocumento: pasajero.numeroDocumento?.toString() || '',
          nombre: pasajero.nombre?.toString() || '',
          apellido: pasajero.apellido?.toString() || '',
          fechaNacimiento: pasajero.fechaNacimiento?.toString() || '',
          genero: pasajero.genero?.toString() || '',
          id_asiento: parseInt(pasajero.id_asiento) || 0
        }
        
        console.log(` Pasajero ${index + 1}:`, pasajeroSQL)
        return pasajeroSQL
      })

      console.log(' Estructura de pasajeros para SQL:', JSON.stringify(pasajerosParaSQL, null, 2))

      let data, error

      // caso 1: usuarios logueados
      // peticion al backend: ejecutar funcion sql crear_reserva_usuario_logueado
      if (esUsuarioLogueado) {
        console.log(' Creando reserva para usuario logueado:', userId)
        console.log(' Datos de reserva logueado:', {
          userId,
          idViaje,
          totalPrecio,
          pasajeros: pasajerosParaSQL
        })
        
        // el backend: crea reserva, inserta pasajeros, actualiza asientos, genera boleta
        const response = await supabase.rpc('crear_reserva_usuario_logueado', {
          p_id_usuario: userId,
          p_id_viaje: idViaje,
          p_total_pagado: totalPrecio,
          p_pasajeros: pasajerosParaSQL
        })
        
        data = response.data
        error = response.error
      } 
      // caso 2: usuarios anonimos
      // peticion al backend: ejecutar funcion sql crear_reserva_anonima
      else {
        console.log(' Creando reserva para usuario anonimo')
        
        // para anonimos necesitamos correo y telefono obligatorios
        if (!correo || correo.trim() === '') {
          throw new Error('El correo electrónico es obligatorio para continuar con la reserva')
        }

        if (!telefono || telefono.trim() === '') {
          throw new Error('El teléfono es obligatorio para continuar con la reserva')
        }

        console.log(' Datos de reserva anonima:', {
          idViaje,
          totalPrecio,
          pasajeros: pasajerosParaSQL,
          correo: correo.trim(),
          telefono: telefono.trim()
        })

        // el backend: crea reserva, inserta pasajeros, actualiza asientos, genera boleta
        const response = await supabase.rpc('crear_reserva_anonima', {
          p_id_viaje: idViaje,
          p_total_pagado: totalPrecio,
          p_pasajeros: pasajerosParaSQL,
          p_correo: correo.trim(),
          p_telefono: telefono.trim()
        })
        
        data = response.data
        error = response.error
      }

      if (error) {
        console.error(' Error al crear reserva:', error)
        throw new Error(`Error al procesar la reserva: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No se recibió respuesta del servidor')
      }

      const resultado = data[0]
      console.log(' Reserva creada exitosamente:', resultado)

      // guardar datos de la reserva exitosa
      setReservaExitosa({
        id_reserva: resultado.id_reserva,
        mensaje: resultado.mensaje,
        total_pasajeros: resultado.total_pasajeros,
        total_asientos: resultado.total_asientos,
        metodoPago: metodoPago,
        // agregar datos adicionales para la pagina de confirmacion
        correo: correo,
        telefono: telefono,
        datosViaje: datosViaje,
        asientosReservados: asientosReservados,
        totalPrecio: totalPrecio
      })

      console.log(' Navegando a pagina de confirmacion con ID:', resultado.id_reserva)
      
      // limpiar completamente el sessionstorage tras reserva exitosa
      console.log(' Limpiando sessionStorage tras reserva exitosa...')
      sessionStorage.removeItem('movitex_reserva_completa')
      sessionStorage.removeItem('movitex_reserva_data')
      sessionStorage.removeItem('movitex_timer_start')
      sessionStorage.removeItem('movitex_timer_limit')
      sessionStorage.removeItem('movitex_formulario_data')
      console.log(' SessionStorage limpiado completamente')
      
      // redirigir a pagina de confirmacion usando el id de la reserva en la url
      navigate(`/pasajes-bus/confirmacion/${resultado.id_reserva}`)

      return resultado

    } catch (error) {
      console.error(' Error en el proceso de reserva:', error)
      setErrorPago(error.message)
      throw error
    } finally {
      setProcesandoPago(false)
    }
  }, [
    procesandoPago, asientosReservados, pasajeros, idViaje, metodoPago, 
    aceptaPoliticas, totalPrecio, correo, telefono, datosViaje, navigate
  ])

  // funcion principal: procesar pago con Izipay y crear reserva
  // primero abre el checkout de Izipay, luego crea la reserva en BD
  const procesarPagoConIzipay = useCallback(async () => {
    if (procesandoPago || cargandoIzipay) return

    try {
      // ============================================================
      // PASO 1: VALIDACIONES PREVIAS
      // ============================================================
      setProcesandoPago(true)
      setErrorPago(null)

      // Validar que tengamos todos los datos necesarios
      if (!asientosReservados.length || !pasajeros.length) {
        throw new Error('No hay datos de reserva disponibles')
      }

      if (!idViaje) {
        throw new Error('No se ha seleccionado un viaje válido')
      }

      if (!aceptaPoliticas) {
        throw new Error('Debe aceptar las políticas de privacidad')
      }

      // Validar datos de pasajeros
      for (let i = 0; i < pasajeros.length; i++) {
        const pasajero = pasajeros[i]
        if (!pasajero.numeroDocumento || !pasajero.nombre || !pasajero.apellido || 
            !pasajero.fechaNacimiento || !pasajero.genero) {
          throw new Error(`Datos incompletos para el pasajero ${i + 1}`)
        }
      }

      // Validar correos para usuarios anónimos
      const userId = localStorage.getItem('id_usuario')
      const esUsuarioLogueado = !!userId

      if (!esUsuarioLogueado) {
        if (!correo || correo.trim() === '') {
          throw new Error('El correo electrónico es obligatorio')
        }
        if (!telefono || telefono.trim() === '') {
          throw new Error('El teléfono es obligatorio')
        }
        if (correo !== confirmacionCorreo) {
          throw new Error('Los correos electrónicos no coinciden')
        }
      }

      console.log('✅ Validaciones previas completadas')

      // ============================================================
      // PASO 2: GENERAR DATOS DE TRANSACCIÓN
      // ============================================================
      const { transactionId, orderNumber } = generateTransactionId()
      setTransactionData({ transactionId, orderNumber })
      
      console.log('📝 Datos de transacción generados:', { transactionId, orderNumber })

      // ============================================================
      // PASO 3: OBTENER TOKEN DE IZIPAY
      // ============================================================
      setCargandoIzipay(true)
      
      const tokenResponse = await getTokenSession(
        transactionId, 
        totalPrecio.toFixed(2), 
        orderNumber
      )

      if (!tokenResponse.response?.token) {
        throw new Error('No se pudo obtener el token de pago. Intente nuevamente.')
      }

      const token = tokenResponse.response.token
      setIzipayToken(token)
      
      console.log('🔑 Token de Izipay obtenido exitosamente')

      // ============================================================
      // PASO 4: PREPARAR DATOS DE FACTURACIÓN
      // ============================================================
      const primerPasajero = pasajeros[0]
      const billingData = {
        firstName: primerPasajero.nombre || 'Cliente',
        lastName: primerPasajero.apellido || 'Movitex',
        email: correo || 'cliente@movitex.com',
        phoneNumber: telefono || '999999999',
        document: primerPasajero.numeroDocumento || '00000000',
        street: 'Av. Principal',
        city: 'Lima',
        state: 'Lima',
        postalCode: '15001',
      }

      // ============================================================
      // PASO 5: CREAR CONFIGURACIÓN DE IZIPAY
      // ============================================================
      const izipayConfig = createIzipayConfig({
        transactionId,
        orderNumber,
        amount: totalPrecio.toFixed(2),
        billingData,
        productName: `Pasajes ${datosViaje?.ciudadOrigen?.nombre || ''} - ${datosViaje?.ciudadDestino?.nombre || ''}`
      })

      console.log('⚙️ Configuración de Izipay creada')

      // ============================================================
      // PASO 6: CALLBACK DE RESPUESTA DE PAGO
      // ============================================================
      const callbackResponsePayment = async (response) => {
        console.log('💳 === RESPUESTA DE PAGO RECIBIDA ===')
        console.log('Respuesta completa:', response)
        console.log('Código:', response?.code)

        try {
          // Validar que la respuesta no esté vacía
          if (!response) {
            console.error('❌ Respuesta vacía del procesador')
            setErrorPago('No se recibió respuesta del procesador de pagos')
            navigate('/inicio')
            return
          }

          // SOLO código '00' es pago exitoso
          if (isPaymentSuccessful(response)) {
            console.log('✅ PAGO EXITOSO - Procesando reserva...')
            
            setProcesandoPago(true)

            // Crear reserva en la base de datos
            const reservaData = await crearReservaEnBD()
            
            if (!reservaData || !reservaData.id_reserva) {
              throw new Error('Error al crear la reserva en la base de datos')
            }

            console.log('✅ Reserva creada con ID:', reservaData.id_reserva)

            // Guardar transacción de Izipay en BD
            await guardarTransaccion(response, reservaData.id_reserva)
            
            console.log('✅ Transacción de pago guardada')

            // Limpiar sessionStorage
            console.log('🧹 Limpiando sessionStorage...')
            sessionStorage.removeItem('movitex_reserva_completa')
            sessionStorage.removeItem('movitex_reserva_data')
            sessionStorage.removeItem('movitex_timer_start')
            sessionStorage.removeItem('movitex_timer_limit')
            sessionStorage.removeItem('movitex_formulario_data')

            // Redirigir a confirmación
            console.log('🎉 Redirigiendo a página de confirmación...')
            navigate(`/pasajes-bus/confirmacion/${reservaData.id_reserva}`)

          } else {
            // Cualquier otro código es error
            console.log('❌ PAGO NO EXITOSO - Código:', response.code)
            const errorMsg = getPaymentErrorMessage(response)
            console.log('Mensaje de error:', errorMsg)
            
            setErrorPago(errorMsg)
            setProcesandoPago(false)
            setCargandoIzipay(false)
            
            // Redirigir a inicio después de 2 segundos
            setTimeout(() => {
              console.log('🔄 Redirigiendo a inicio...')
              navigate('/inicio')
            }, 2000)
          }

        } catch (error) {
          console.error('❌ Error en callback de pago:', error)
          setErrorPago(error.message || 'Error al procesar el pago')
          setProcesandoPago(false)
          setCargandoIzipay(false)
          
          // Redirigir a inicio
          setTimeout(() => {
            navigate('/inicio')
          }, 2000)
        }
      }

      // ============================================================
      // PASO 7: CARGAR FORMULARIO DE IZIPAY
      // ============================================================
      console.log('🚀 Cargando formulario de pago de Izipay...')
      
      loadIzipayForm(token, izipayConfig, callbackResponsePayment)
      
      setCargandoIzipay(false)
      setProcesandoPago(false)

    } catch (error) {
      console.error('❌ Error al procesar pago con Izipay:', error)
      setErrorPago(error.message)
      setProcesandoPago(false)
      setCargandoIzipay(false)
      throw error
    }
  }, [
    procesandoPago, cargandoIzipay, asientosReservados, pasajeros, idViaje, 
    aceptaPoliticas, totalPrecio, correo, confirmacionCorreo, telefono, 
    datosViaje, navigate
  ])

  // funcion auxiliar: crear reserva en BD (sin Izipay)
  // se llama después de que el pago con Izipay sea exitoso
  const crearReservaEnBD = async () => {
    // obtener id del usuario desde localstorage
    let userId = localStorage.getItem('id_usuario')
    
    // si no hay id_usuario directamente, intentar obtenerlo de movitex_user_data
    if (!userId) {
      const userData = localStorage.getItem('movitex_user_data')
      if (userData) {
        const userInfo = JSON.parse(userData)
        userId = userInfo.id_usuario || userInfo.id
      }
    }

    // determinar si es usuario logueado o anonimo
    const esUsuarioLogueado = !!userId

    // preparar array de pasajeros en el formato que espera la funcion sql
    const pasajerosParaSQL = pasajeros.map((pasajero) => ({
      numeroDocumento: pasajero.numeroDocumento?.toString() || '',
      nombre: pasajero.nombre?.toString() || '',
      apellido: pasajero.apellido?.toString() || '',
      fechaNacimiento: pasajero.fechaNacimiento?.toString() || '',
      genero: pasajero.genero?.toString() || '',
      id_asiento: parseInt(pasajero.id_asiento) || 0
    }))

    let data, error

    // caso 1: usuarios logueados
    if (esUsuarioLogueado) {
      console.log('💾 Creando reserva para usuario logueado:', userId)
      
      const response = await supabase.rpc('crear_reserva_usuario_logueado', {
        p_id_usuario: userId,
        p_id_viaje: idViaje,
        p_total_pagado: totalPrecio,
        p_pasajeros: pasajerosParaSQL
      })
      
      data = response.data
      error = response.error
    } 
    // caso 2: usuarios anonimos
    else {
      console.log('💾 Creando reserva para usuario anónimo')
      
      const response = await supabase.rpc('crear_reserva_anonima', {
        p_id_viaje: idViaje,
        p_total_pagado: totalPrecio,
        p_pasajeros: pasajerosParaSQL,
        p_correo: correo.trim(),
        p_telefono: telefono.trim()
      })
      
      data = response.data
      error = response.error
    }

    if (error) {
      console.error('❌ Error al crear reserva:', error)
      throw new Error(`Error al procesar la reserva: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error('No se recibió respuesta del servidor')
    }

    const resultado = data[0]
    console.log('✅ Reserva creada exitosamente:', resultado)

    return resultado
  }

  // Función para obtener datos de boleta desde el backend
  // Consulta todos los datos de la reserva para mostrar en la boleta
  const obtenerBoletaViaje = useCallback(async (idReserva) => {
    try {
      setCargandoBoleta(true)
      setErrorBoleta(null)

      console.log(' Obteniendo datos de boleta para reserva:', idReserva)

      // Petición al backend: ejecutar función SQL generar_boleta_viaje
      // El backend hace joins entre: reservas, pasajeros, viajes, asientos, ciudades
      const { data, error } = await supabase.rpc('generar_boleta_viaje', {
        p_id_reserva: idReserva
      })

      if (error) {
        console.error(' Error al obtener datos de boleta:', error)
        throw new Error(`Error al obtener datos de la boleta: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No se encontraron datos para esta reserva')
      }

      console.log(' Datos de boleta obtenidos:', data)

      // Estructurar los datos de la boleta para mostrar en la interfaz
      const boletaEstructurada = {
        // Información general del viaje (de cualquier registro, ya que es la misma para todos)
        infoViaje: {
          servicio: data[0].tipo_servicio || data[0].servicio || 'Servicio Premium',
          fecha: data[0].fecha,
          hora_salida: data[0].hora_salida,
          origen: data[0].origen,
          destino: data[0].destino
        },
        // Lista de pasajeros con sus asientos
        pasajeros: data.map(item => ({
          numero_asiento: item.numero_asiento,
          nombres: item.nombres,
          apellidos: item.apellidos,
          dni: item.dni,
          precio: parseFloat(item.precio)
        })),
        // Totales
        totalPasajeros: data.length,
        totalPrecio: data.reduce((sum, item) => sum + parseFloat(item.precio), 0)
      }

      // Guardar datos de la boleta en el estado
      setDatosBoleta(boletaEstructurada)
      return boletaEstructurada

    } catch (error) {
      console.error(' Error al obtener boleta:', error)
      setErrorBoleta(error.message)
      throw error
    } finally {
      setCargandoBoleta(false)
    }
  }, [])

  // funcion especifica para inicializar en paginas de confirmacion (sin sessionstorage)
  const inicializarParaConfirmacion = useCallback(() => {
    if (!inicializado) {
      setInicializado(true)
      return true
    }
    return true
  }, [inicializado])

  // Valor del contexto
  const value = {
    // Estados de reserva
    asientosReservados,
    totalPrecio,
    idViaje,
    datosViaje,
    
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

    // Estados de boleta
    datosBoleta,
    cargandoBoleta,
    errorBoleta,

    // Estados de Izipay
    izipayToken,
    cargandoIzipay,
    transactionData,
    
    // Estado de usuario logueado
    isUserLoggedIn: isUserLoggedIn(),
    
    // Funciones
    inicializarReserva,
    inicializarParaConfirmacion,
    reiniciarReservaConNuevosDatos,
    limpiarReserva,
    handleTiempoAgotado,
    formatTiempo,
    handlePasajeroChange,
    crearReserva,
    procesarPagoConIzipay,
    obtenerBoletaViaje,
    
    // Setters para campos de contacto
    setCorreo,
    setConfirmacionCorreo,
    setTelefono,
    setCodigoPromocional,
    setMetodoPago,
    setAceptaPoliticas,
    setErrorPago
  }

  return (
    <ReservaContext.Provider value={value}>
      {children}
    </ReservaContext.Provider>
  )
}

export default ReservaContext