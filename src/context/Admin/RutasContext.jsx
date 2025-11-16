import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import toast from 'react-hot-toast'

const RutasContext = createContext()

export const useRutas = () => {
  const context = useContext(RutasContext)
  if (!context) {
    throw new Error('useRutas debe ser usado dentro de RutasProvider')
  }
  return context
}

export const RutasProvider = ({ children }) => {
  const [rutas, setRutas] = useState([])
  const [ciudades, setCiudades] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar ciudades para los selects
  const fetchCiudades = async () => {
    try {
      const { data, error } = await supabase
        .from('ciudades')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      setCiudades(data || [])
    } catch (error) {
      console.error('Error al cargar ciudades:', error)
    }
  }

  // Cargar rutas con nombres de ciudades (JOIN)
  const fetchRutas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rutas')
        .select(`
          *,
          ciudad_origen:ciudades!rutas_id_origen_fkey(id_ciudad, nombre),
          ciudad_destino:ciudades!rutas_id_destino_fkey(id_ciudad, nombre)
        `)
        .order('id_ruta', { ascending: true })

      if (error) throw error

      setRutas(data || [])
    } catch (error) {
      console.error('Error al cargar rutas:', error)
      toast.error('Error al cargar rutas')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchCiudades()
    fetchRutas()
  }, [])

  // Crear ruta
  const createRuta = async (rutaData) => {
    try {
      setSubmitting(true)

      // Validar que origen y destino no sean iguales
      if (rutaData.id_origen === rutaData.id_destino) {
        throw new Error('El origen y destino no pueden ser la misma ciudad')
      }

      const { data, error } = await supabase
        .from('rutas')
        .insert([{
          id_origen: rutaData.id_origen,
          id_destino: rutaData.id_destino,
          duracion_estimada: rutaData.duracion_estimada
        }])
        .select()

      if (error) {
        // Manejo de errores específicos
        if (error.message.includes('duplicate key')) {
          throw new Error('Ya existe una ruta con ese origen y destino')
        }
        throw error
      }

      toast.success('Ruta creada exitosamente')
      await fetchRutas() // Recargar lista
      return { success: true, data }
    } catch (error) {
      console.error('Error al crear ruta:', error)
      toast.error(error.message || 'Error al crear ruta')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Actualizar ruta
  const updateRuta = async (id_ruta, rutaData) => {
    try {
      setSubmitting(true)

      // Validar que origen y destino no sean iguales
      if (rutaData.id_origen === rutaData.id_destino) {
        throw new Error('El origen y destino no pueden ser la misma ciudad')
      }

      const { error } = await supabase
        .from('rutas')
        .update({
          id_origen: rutaData.id_origen,
          id_destino: rutaData.id_destino,
          duracion_estimada: rutaData.duracion_estimada
        })
        .eq('id_ruta', id_ruta)

      if (error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('Ya existe una ruta con ese origen y destino')
        }
        throw error
      }

      toast.success('Ruta actualizada exitosamente')
      await fetchRutas() // Recargar lista
      return { success: true }
    } catch (error) {
      console.error('Error al actualizar ruta:', error)
      toast.error(error.message || 'Error al actualizar ruta')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar ruta
  const deleteRuta = async (id_ruta) => {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('rutas')
        .delete()
        .eq('id_ruta', id_ruta)

      if (error) {
        // Si hay viajes asociados
        if (error.message.includes('foreign key constraint')) {
          throw new Error('No se puede eliminar: existen viajes asociados a esta ruta')
        }
        throw error
      }

      toast.success('Ruta eliminada exitosamente')
      await fetchRutas() // Recargar lista
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar ruta:', error)
      toast.error(error.message || 'Error al eliminar ruta')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Buscar rutas por término (origen o destino)
  const searchRutas = (rutas, searchTerm) => {
    if (!searchTerm) return rutas

    return rutas.filter(ruta =>
      ruta.ciudad_origen?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.ciudad_destino?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Formatear duración de HH:MM:SS a formato legible
  const formatDuracion = (duracion) => {
    if (!duracion) return 'N/A'
    
    const [horas, minutos] = duracion.split(':')
    const h = parseInt(horas)
    const m = parseInt(minutos)
    
    if (h === 0 && m === 0) return 'Menos de 1 hora'
    if (h === 0) return `${m} min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
  }

  const value = {
    rutas,
    ciudades,
    loading,
    submitting,
    fetchRutas,
    createRuta,
    updateRuta,
    deleteRuta,
    searchRutas,
    formatDuracion
  }

  return (
    <RutasContext.Provider value={value}>
      {children}
    </RutasContext.Provider>
  )
}
