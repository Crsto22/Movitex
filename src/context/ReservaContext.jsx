import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDNIData, validateDNI } from '../services/dniService'
import { supabase } from '../supabase/supabase'

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

  // Estados para cronómetro
  const [tiempoRestante, setTiempoRestante] = useState(0)
  const [mostrarModalTiempo, setMostrarModalTiempo] = useState(false)

  // Estados para datos de reserva
  const [asientosReservados, setAsientosReservados] = useState([])
  const [totalPrecio, setTotalPrecio] = useState(0)
  const [idViaje, setIdViaje] = useState(null)
  const [datosViaje, setDatosViaje] = useState(null)

  // Estados del formulario
  const [pasajeros, setPasajeros] = useState([])
  const [correo, setCorreo] = useState('')
  const [confirmacionCorreo, setConfirmacionCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [codigoPromocional, setCodigoPromocional] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false)

  // Estados para manejo de DNI
  const [loadingDNI, setLoadingDNI] = useState({})
  const [inicializado, setInicializado] = useState(false)
  const timeoutRefs = useRef({})

  // Estados para proceso de pago
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [errorPago, setErrorPago] = useState(null)
  const [reservaExitosa, setReservaExitosa] = useState(null)

  // Estados para datos de boleta
  const [datosBoleta, setDatosBoleta] = useState(null)
  const [cargandoBoleta, setCargandoBoleta] = useState(false)
  const [errorBoleta, setErrorBoleta] = useState(null)

  // Función para inicializar reserva desde sessionStorage
  const inicializarReserva = useCallback((allowEmpty = false, forzarReinicio = false, nuevosAsientos = null, nuevoIdViaje = null, nuevoDatosViaje = null, nuevoTotal = null, nuevoCronometro = null) => {
    // Si hay datos nuevos que requieren reinicio, usar la función de reinicio
    if (forzarReinicio && nuevosAsientos && nuevoIdViaje !== null) {
      console.log('🔄 Forzando reinicio con nuevos datos de asientos')
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
        console.log('🎯 Datos del viaje cargados:', data.datosViaje)
        setDatosViaje(data.datosViaje)
      } else {
        console.log('⚠️ No se encontraron datos del viaje en la reserva')
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
          console.log('👤 Datos del usuario encontrados:', userInfo)
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
    
    console.log('✅ Reserva reiniciada con nuevos datos:', {
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
        console.log('🔄 Detectado cambio en sessionStorage, reinicializando contexto...')
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

  // Función para verificar si hay usuario logueado
  const isUserLoggedIn = () => {
    const userData = localStorage.getItem('movitex_user_data')
    return userData !== null
  }

  // Función para crear reserva completa (logueado o anónimo)
  const crearReserva = useCallback(async () => {
    if (procesandoPago) return // Evitar doble procesamiento

    try {
      setProcesandoPago(true)
      setErrorPago(null)

      // Obtener ID del usuario desde localStorage
      let userId = localStorage.getItem('id_usuario')
      
      // Si no hay id_usuario directamente, intentar obtenerlo de movitex_user_data
      if (!userId) {
        const userData = localStorage.getItem('movitex_user_data')
        if (userData) {
          const userInfo = JSON.parse(userData)
          userId = userInfo.id_usuario || userInfo.id
        }
      }

      // Determinar si es usuario logueado o anónimo
      const esUsuarioLogueado = !!userId

      // Validar que tengamos todos los datos necesarios
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

      // Validar datos de pasajeros
      for (let i = 0; i < pasajeros.length; i++) {
        const pasajero = pasajeros[i]
        if (!pasajero.numeroDocumento || !pasajero.nombre || !pasajero.apellido || 
            !pasajero.fechaNacimiento || !pasajero.genero || !pasajero.id_asiento) {
          throw new Error(`Datos incompletos para el pasajero ${i + 1}`)
        }
      }

      // Preparar array de pasajeros en el formato que espera la función SQL
      const pasajerosParaSQL = pasajeros.map((pasajero, index) => {
        // Validar cada campo individualmente
        const pasajeroSQL = {
          numeroDocumento: pasajero.numeroDocumento?.toString() || '',
          nombre: pasajero.nombre?.toString() || '',
          apellido: pasajero.apellido?.toString() || '',
          fechaNacimiento: pasajero.fechaNacimiento?.toString() || '',
          genero: pasajero.genero?.toString() || '',
          id_asiento: parseInt(pasajero.id_asiento) || 0
        }
        
        console.log(`👤 Pasajero ${index + 1}:`, pasajeroSQL)
        return pasajeroSQL
      })

      console.log('� Estructura de pasajeros para SQL:', JSON.stringify(pasajerosParaSQL, null, 2))

      let data, error

      // ✅ USUARIOS LOGUEADOS: Usar función crear_reserva_usuario_logueado
      if (esUsuarioLogueado) {
        console.log('🔐 Creando reserva para usuario logueado:', userId)
        console.log('🚀 Datos de reserva logueado:', {
          userId,
          idViaje,
          totalPrecio,
          pasajeros: pasajerosParaSQL
        })
        
        const response = await supabase.rpc('crear_reserva_usuario_logueado', {
          p_id_usuario: userId,
          p_id_viaje: idViaje,
          p_total_pagado: totalPrecio,
          p_pasajeros: pasajerosParaSQL
        })
        
        data = response.data
        error = response.error
      } 
      // ✅ USUARIOS ANÓNIMOS: Usar función crear_reserva_anonima
      else {
        console.log('� Creando reserva para usuario anónimo')
        
        // Para anónimos necesitamos correo y teléfono obligatorios
        if (!correo || correo.trim() === '') {
          throw new Error('El correo electrónico es obligatorio para continuar con la reserva')
        }

        if (!telefono || telefono.trim() === '') {
          throw new Error('El teléfono es obligatorio para continuar con la reserva')
        }

        console.log('🚀 Datos de reserva anónima:', {
          idViaje,
          totalPrecio,
          pasajeros: pasajerosParaSQL,
          correo: correo.trim(),
          telefono: telefono.trim()
        })

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

      // Guardar datos de la reserva exitosa
      setReservaExitosa({
        id_reserva: resultado.id_reserva,
        mensaje: resultado.mensaje,
        total_pasajeros: resultado.total_pasajeros,
        total_asientos: resultado.total_asientos,
        metodoPago: metodoPago,
        // Agregar datos adicionales para la página de confirmación
        correo: correo,
        telefono: telefono,
        datosViaje: datosViaje,
        asientosReservados: asientosReservados,
        totalPrecio: totalPrecio
      })

      console.log('🎯 Navegando a página de confirmación con ID:', resultado.id_reserva)
      
      // ✅ LIMPIAR COMPLETAMENTE EL SESSIONSTORAGE TRAS RESERVA EXITOSA
      console.log('🧹 Limpiando sessionStorage tras reserva exitosa...')
      sessionStorage.removeItem('movitex_reserva_completa')
      sessionStorage.removeItem('movitex_reserva_data') // Por compatibilidad
      sessionStorage.removeItem('movitex_timer_start') // Por compatibilidad
      sessionStorage.removeItem('movitex_timer_limit') // Por compatibilidad  
      sessionStorage.removeItem('movitex_formulario_data') // Por compatibilidad
      console.log('✅ SessionStorage limpiado completamente')
      
      // Redirigir a página de confirmación usando el ID de la reserva en la URL
      navigate(`/pasajes-bus/confirmacion/${resultado.id_reserva}`)

      return resultado

    } catch (error) {
      console.error('❌ Error en el proceso de reserva:', error)
      setErrorPago(error.message)
      throw error
    } finally {
      setProcesandoPago(false)
    }
  }, [
    procesandoPago, asientosReservados, pasajeros, idViaje, metodoPago, 
    aceptaPoliticas, totalPrecio, correo, telefono, limpiarReserva, navigate
  ])

  // Función para obtener datos de boleta usando el ID de reserva
  const obtenerBoletaViaje = useCallback(async (idReserva) => {
    try {
      setCargandoBoleta(true)
      setErrorBoleta(null)

      console.log('🎫 Obteniendo datos de boleta para reserva:', idReserva)

      // Llamar a la función SQL generar_boleta_viaje
      const { data, error } = await supabase.rpc('generar_boleta_viaje', {
        p_id_reserva: idReserva
      })

      if (error) {
        console.error('❌ Error al obtener datos de boleta:', error)
        throw new Error(`Error al obtener datos de la boleta: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No se encontraron datos para esta reserva')
      }

      console.log('✅ Datos de boleta obtenidos:', data)

      // Estructurar los datos de la boleta
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

      setDatosBoleta(boletaEstructurada)
      return boletaEstructurada

    } catch (error) {
      console.error('❌ Error al obtener boleta:', error)
      setErrorBoleta(error.message)
      throw error
    } finally {
      setCargandoBoleta(false)
    }
  }, []) // Sin dependencias para evitar recreaciones

  // Función específica para inicializar en páginas de confirmación (sin sessionStorage)
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