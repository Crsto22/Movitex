import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import toast from 'react-hot-toast'

const BusesContext = createContext()

export const useBuses = () => {
  const context = useContext(BusesContext)
  if (!context) {
    throw new Error('useBuses debe ser usado dentro de BusesProvider')
  }
  return context
}

export const BusesProvider = ({ children }) => {
  const [buses, setBuses] = useState([])
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar servicios para los selects
  const fetchServicios = async () => {
    try {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .order('id_servicio', { ascending: true })

      if (error) throw error
      setServicios(data || [])
    } catch (error) {
      console.error('Error al cargar servicios:', error)
    }
  }

  // Cargar buses con JOIN a servicios
  const fetchBuses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('buses')
        .select(`
          *,
          servicio:servicios(id_servicio, nombre, descripcion, angulo_piso1, angulo_piso2)
        `)
        .order('id_bus', { ascending: true })

      if (error) throw error

      setBuses(data || [])
    } catch (error) {
      console.error('Error al cargar buses:', error)
      toast.error('Error al cargar buses')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchServicios()
    fetchBuses()
  }, [])

  // Crear bus
  const createBus = async (busData) => {
    try {
      setSubmitting(true)

      const { data, error } = await supabase
        .from('buses')
        .insert([{
          id_servicio: busData.id_servicio,
          placa: busData.placa.toUpperCase(),
          capacidad_piso1: busData.capacidad_piso1,
          capacidad_piso2: busData.capacidad_piso2 || 0
        }])
        .select()

      if (error) {
        // Manejo de errores específicos
        if (error.message.includes('duplicate key value violates unique constraint "buses_placa_key"')) {
          throw new Error('Ya existe un bus con esa placa')
        }
        throw error
      }

      toast.success('Bus creado exitosamente')
      await fetchBuses() // Recargar lista
      return { success: true, data }
    } catch (error) {
      console.error('Error al crear bus:', error)
      toast.error(error.message || 'Error al crear bus')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Actualizar bus
  const updateBus = async (id_bus, busData) => {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('buses')
        .update({
          id_servicio: busData.id_servicio,
          placa: busData.placa.toUpperCase(),
          capacidad_piso1: busData.capacidad_piso1,
          capacidad_piso2: busData.capacidad_piso2 || 0
        })
        .eq('id_bus', id_bus)

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint "buses_placa_key"')) {
          throw new Error('Ya existe un bus con esa placa')
        }
        throw error
      }

      toast.success('Bus actualizado exitosamente')
      await fetchBuses() // Recargar lista
      return { success: true }
    } catch (error) {
      console.error('Error al actualizar bus:', error)
      toast.error(error.message || 'Error al actualizar bus')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar bus
  const deleteBus = async (id_bus) => {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('buses')
        .delete()
        .eq('id_bus', id_bus)

      if (error) {
        // Si hay viajes asociados
        if (error.message.includes('foreign key constraint')) {
          throw new Error('No se puede eliminar: existen viajes asociados a este bus')
        }
        throw error
      }

      toast.success('Bus eliminado exitosamente')
      await fetchBuses() // Recargar lista
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar bus:', error)
      toast.error(error.message || 'Error al eliminar bus')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Buscar buses por término (placa o servicio)
  const searchBuses = (buses, searchTerm) => {
    if (!searchTerm) return buses

    return buses.filter(bus =>
      bus.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.servicio?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Obtener capacidad total del bus
  const getCapacidadTotal = (bus) => {
    return (bus.capacidad_piso1 || 0) + (bus.capacidad_piso2 || 0)
  }

  // Obtener nombre del servicio formateado
  const getNombreServicioFormateado = (nombre) => {
    if (!nombre) return 'N/A'
    
    // Convertir movitex_one -> Movitex One, movitex_pro -> Movitex Pro
    return nombre
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const value = {
    buses,
    servicios,
    loading,
    submitting,
    fetchBuses,
    createBus,
    updateBus,
    deleteBus,
    searchBuses,
    getCapacidadTotal,
    getNombreServicioFormateado
  }

  return (
    <BusesContext.Provider value={value}>
      {children}
    </BusesContext.Provider>
  )
}
