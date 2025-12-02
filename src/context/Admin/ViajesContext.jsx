import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import toast from 'react-hot-toast'

const ViajesContext = createContext()

export const useViajes = () => {
  const context = useContext(ViajesContext)
  if (!context) {
    throw new Error('useViajes debe ser usado dentro de ViajesProvider')
  }
  return context
}

export const ViajesProvider = ({ children }) => {
  const [viajes, setViajes] = useState([])
  const [rutas, setRutas] = useState([])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Obtener todos los viajes con JOIN a rutas, buses y servicios
  const fetchViajes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('viajes')
        .select(`
          *,
          ruta:rutas(
            id_ruta,
            ciudad_origen:ciudades!rutas_id_origen_fkey(id_ciudad, nombre),
            ciudad_destino:ciudades!rutas_id_destino_fkey(id_ciudad, nombre),
            duracion_estimada
          ),
          bus:buses(
            id_bus,
            placa,
            servicio:servicios(id_servicio, nombre)
          )
        `)
        .order('fecha', { ascending: false })

      if (error) throw error

      // Formatear los datos para facilitar el uso
      const viajesFormateados = data.map(viaje => ({
        ...viaje,
        origen: viaje.ruta?.ciudad_origen?.nombre || 'N/A',
        destino: viaje.ruta?.ciudad_destino?.nombre || 'N/A',
        placa: viaje.bus?.placa || 'N/A',
        servicio: viaje.bus?.servicio?.nombre || 'N/A'
      }))

      setViajes(viajesFormateados)
    } catch (error) {
      console.error('Error al obtener viajes:', error)
      toast.error('Error al cargar los viajes')
    } finally {
      setLoading(false)
    }
  }

  // Obtener rutas para el dropdown
  const fetchRutas = async () => {
    try {
      const { data, error } = await supabase
        .from('rutas')
        .select(`
          *,
          ciudad_origen:ciudades!rutas_id_origen_fkey(id_ciudad, nombre),
          ciudad_destino:ciudades!rutas_id_destino_fkey(id_ciudad, nombre)
        `)
        .order('id_ruta', { ascending: true })

      if (error) throw error

      const rutasFormateadas = data.map(ruta => ({
        id_ruta: ruta.id_ruta,
        origen: ruta.ciudad_origen?.nombre || 'N/A',
        destino: ruta.ciudad_destino?.nombre || 'N/A',
        duracion_estimada: ruta.duracion_estimada
      }))

      setRutas(rutasFormateadas)
    } catch (error) {
      console.error('Error al obtener rutas:', error)
      toast.error('Error al cargar las rutas')
    }
  }

  // Obtener buses para el dropdown
  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select(`
          *,
          servicio:servicios(id_servicio, nombre)
        `)
        .order('placa', { ascending: true })

      if (error) throw error

      const busesFormateados = data.map(bus => ({
        id_bus: bus.id_bus,
        placa: bus.placa,
        servicio: bus.servicio?.nombre || 'N/A',
        id_servicio: bus.id_servicio,
        capacidad_piso1: bus.capacidad_piso1,
        capacidad_piso2: bus.capacidad_piso2
      }))

      setBuses(busesFormateados)
    } catch (error) {
      console.error('Error al obtener buses:', error)
      toast.error('Error al cargar los buses')
    }
  }

  // Crear nuevo viaje
  const createViaje = async (viajeData) => {
    try {
      setSubmitting(true)

      // Validaciones
      if (!viajeData.id_ruta || !viajeData.id_bus || !viajeData.fecha || 
          !viajeData.hora_salida || !viajeData.precio_base_piso1) {
        toast.error('Todos los campos obligatorios deben ser completados')
        return false
      }

      // Validar que la fecha no sea en el pasado
      const fechaViaje = new Date(viajeData.fecha)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      
      if (fechaViaje < hoy) {
        toast.error('La fecha del viaje no puede ser en el pasado')
        return false
      }

      // Validar precios
      if (parseFloat(viajeData.precio_base_piso1) <= 0) {
        toast.error('El precio del piso 1 debe ser mayor a 0')
        return false
      }

      if (viajeData.precio_base_piso2 && parseFloat(viajeData.precio_base_piso2) <= 0) {
        toast.error('El precio del piso 2 debe ser mayor a 0')
        return false
      }

      // Obtener duración de la ruta para calcular hora de llegada
      const { data: rutaData, error: rutaError } = await supabase
        .from('rutas')
        .select('duracion_estimada')
        .eq('id_ruta', viajeData.id_ruta)
        .single()

      if (rutaError) throw rutaError

      // Calcular hora de llegada
      let horaLlegada = null
      if (rutaData?.duracion_estimada && viajeData.hora_salida) {
        const duracionParts = rutaData.duracion_estimada.split(':')
        const horas = parseInt(duracionParts[0]) || 0
        const minutos = parseInt(duracionParts[1]) || 0
        
        const [horaSalidaHH, horaSalidaMM] = viajeData.hora_salida.split(':')
        const fechaSalida = new Date()
        fechaSalida.setHours(parseInt(horaSalidaHH), parseInt(horaSalidaMM), 0, 0)
        fechaSalida.setHours(fechaSalida.getHours() + horas)
        fechaSalida.setMinutes(fechaSalida.getMinutes() + minutos)
        
        horaLlegada = fechaSalida.toTimeString().slice(0, 8) // HH:MM:SS
      }

      const { data, error } = await supabase
        .from('viajes')
        .insert([{
          id_bus: viajeData.id_bus,
          id_ruta: viajeData.id_ruta,
          fecha: viajeData.fecha,
          hora_salida: viajeData.hora_salida,
          hora_llegada: horaLlegada,
          precio_base_piso1: parseFloat(viajeData.precio_base_piso1),
          precio_base_piso2: viajeData.precio_base_piso2 ? parseFloat(viajeData.precio_base_piso2) : null,
          activo: viajeData.activo !== undefined ? viajeData.activo : true
        }])
        .select()

      if (error) throw error

      toast.success('Viaje creado exitosamente')
      await fetchViajes()
      return true
    } catch (error) {
      console.error('Error al crear viaje:', error)
      
      if (error.code === '23505') {
        toast.error('Ya existe un viaje con estos datos')
      } else {
        toast.error('Error al crear el viaje')
      }
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // Actualizar viaje
  const updateViaje = async (id_viaje, viajeData) => {
    try {
      setSubmitting(true)

      // Validaciones
      if (!viajeData.id_ruta || !viajeData.id_bus || !viajeData.fecha || 
          !viajeData.hora_salida || !viajeData.precio_base_piso1) {
        toast.error('Todos los campos obligatorios deben ser completados')
        return false
      }

      // Validar precios
      if (parseFloat(viajeData.precio_base_piso1) <= 0) {
        toast.error('El precio del piso 1 debe ser mayor a 0')
        return false
      }

      if (viajeData.precio_base_piso2 && parseFloat(viajeData.precio_base_piso2) <= 0) {
        toast.error('El precio del piso 2 debe ser mayor a 0')
        return false
      }

      // Validar que el bus no esté ocupado en la misma fecha (excluyendo el viaje actual)
      const { data: viajesExistentes, error: errorViajesExistentes } = await supabase
        .from('viajes')
        .select('id_viaje, hora_salida, hora_llegada')
        .eq('id_bus', viajeData.id_bus)
        .eq('fecha', viajeData.fecha)
        .neq('id_viaje', id_viaje) // Excluir el viaje actual

      if (errorViajesExistentes) throw errorViajesExistentes

      if (viajesExistentes && viajesExistentes.length > 0) {
        // Obtener información del bus para el mensaje
        const { data: busData } = await supabase
          .from('buses')
          .select('placa')
          .eq('id_bus', viajeData.id_bus)
          .single()

        const placa = busData?.placa || 'este bus'
        toast.error(`El bus ${placa} ya tiene otro viaje programado para esta fecha (${viajeData.fecha}). Por favor, elige otro bus u otra fecha.`)
        return false
      }

      // Obtener duración de la ruta para calcular hora de llegada
      const { data: rutaData, error: rutaError } = await supabase
        .from('rutas')
        .select('duracion_estimada')
        .eq('id_ruta', viajeData.id_ruta)
        .single()

      if (rutaError) throw rutaError

      // Calcular hora de llegada
      let horaLlegada = null
      if (rutaData?.duracion_estimada && viajeData.hora_salida) {
        const duracionParts = rutaData.duracion_estimada.split(':')
        const horas = parseInt(duracionParts[0]) || 0
        const minutos = parseInt(duracionParts[1]) || 0
        
        const [horaSalidaHH, horaSalidaMM] = viajeData.hora_salida.split(':')
        const fechaSalida = new Date()
        fechaSalida.setHours(parseInt(horaSalidaHH), parseInt(horaSalidaMM), 0, 0)
        fechaSalida.setHours(fechaSalida.getHours() + horas)
        fechaSalida.setMinutes(fechaSalida.getMinutes() + minutos)
        
        horaLlegada = fechaSalida.toTimeString().slice(0, 8) // HH:MM:SS
      }

      const { data, error } = await supabase
        .from('viajes')
        .update({
          id_bus: viajeData.id_bus,
          id_ruta: viajeData.id_ruta,
          fecha: viajeData.fecha,
          hora_salida: viajeData.hora_salida,
          hora_llegada: horaLlegada,
          precio_base_piso1: parseFloat(viajeData.precio_base_piso1),
          precio_base_piso2: viajeData.precio_base_piso2 ? parseFloat(viajeData.precio_base_piso2) : null,
          activo: viajeData.activo !== undefined ? viajeData.activo : true
        })
        .eq('id_viaje', id_viaje)
        .select()

      if (error) throw error

      toast.success('Viaje actualizado exitosamente')
      await fetchViajes()
      return true
    } catch (error) {
      console.error('Error al actualizar viaje:', error)
      toast.error('Error al actualizar el viaje')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar viaje
  const deleteViaje = async (id_viaje) => {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('viajes')
        .delete()
        .eq('id_viaje', id_viaje)

      if (error) throw error

      toast.success('Viaje eliminado exitosamente')
      await fetchViajes()
      return true
    } catch (error) {
      console.error('Error al eliminar viaje:', error)
      
      if (error.code === '23503') {
        toast.error('No se puede eliminar el viaje porque tiene reservas asociadas')
      } else {
        toast.error('Error al eliminar el viaje')
      }
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // Buscar viajes
  const searchViajes = async (searchTerm) => {
    if (!searchTerm.trim()) {
      await fetchViajes()
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('viajes')
        .select(`
          *,
          ruta:rutas(
            id_ruta,
            ciudad_origen:ciudades!rutas_id_origen_fkey(id_ciudad, nombre),
            ciudad_destino:ciudades!rutas_id_destino_fkey(id_ciudad, nombre),
            duracion_estimada
          ),
          bus:buses(
            id_bus,
            placa,
            servicio:servicios(id_servicio, nombre)
          )
        `)

      if (error) throw error

      // Filtrar en el cliente
      const viajesFormateados = data.map(viaje => ({
        ...viaje,
        origen: viaje.ruta?.ciudad_origen?.nombre || 'N/A',
        destino: viaje.ruta?.ciudad_destino?.nombre || 'N/A',
        placa: viaje.bus?.placa || 'N/A',
        servicio: viaje.bus?.servicio?.nombre || 'N/A'
      }))

      const filtered = viajesFormateados.filter(viaje =>
        viaje.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viaje.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viaje.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viaje.fecha.includes(searchTerm)
      )

      setViajes(filtered)
    } catch (error) {
      console.error('Error al buscar viajes:', error)
      toast.error('Error al buscar viajes')
    } finally {
      setLoading(false)
    }
  }

  // Formatear duración
  const formatDuracion = (duracion) => {
    if (!duracion) return 'N/A'
    const [hours, minutes] = duracion.split(':')
    return `${hours}h ${minutes}min`
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchViajes()
    fetchRutas()
    fetchBuses()
  }, [])

  const value = {
    viajes,
    rutas,
    buses,
    loading,
    submitting,
    fetchViajes,
    fetchRutas,
    fetchBuses,
    createViaje,
    updateViaje,
    deleteViaje,
    searchViajes,
    formatDuracion
  }

  return (
    <ViajesContext.Provider value={value}>
      {children}
    </ViajesContext.Provider>
  )
}
