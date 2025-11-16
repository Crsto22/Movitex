import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import toast from 'react-hot-toast'

const CiudadesAdminContext = createContext()

export const useCiudadesAdmin = () => {
  const context = useContext(CiudadesAdminContext)
  if (!context) {
    throw new Error('useCiudadesAdmin debe ser usado dentro de CiudadesAdminProvider')
  }
  return context
}

export const CiudadesAdminProvider = ({ children }) => {
  const [ciudades, setCiudades] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar ciudades desde Supabase
  const fetchCiudades = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ciudades')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error

      setCiudades(data || [])
    } catch (error) {
      console.error('Error al cargar ciudades:', error)
      toast.error('Error al cargar ciudades')
    } finally {
      setLoading(false)
    }
  }

  // Cargar ciudades al montar el componente
  useEffect(() => {
    fetchCiudades()
  }, [])

  // Crear ciudad
  const createCiudad = async (ciudadData) => {
    try {
      setSubmitting(true)

      const { data, error } = await supabase
        .from('ciudades')
        .insert([{
          nombre: ciudadData.nombre
        }])
        .select()

      if (error) {
        // Manejo de errores específicos
        if (error.message.includes('duplicate key value violates unique constraint')) {
          throw new Error('Ya existe una ciudad con ese nombre')
        }
        throw error
      }

      toast.success('Ciudad creada exitosamente')
      await fetchCiudades() // Recargar lista
      return { success: true, data }
    } catch (error) {
      console.error('Error al crear ciudad:', error)
      toast.error(error.message || 'Error al crear ciudad')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Actualizar ciudad
  const updateCiudad = async (id_ciudad, ciudadData) => {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('ciudades')
        .update({
          nombre: ciudadData.nombre
        })
        .eq('id_ciudad', id_ciudad)

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          throw new Error('Ya existe una ciudad con ese nombre')
        }
        throw error
      }

      toast.success('Ciudad actualizada exitosamente')
      await fetchCiudades() // Recargar lista
      return { success: true }
    } catch (error) {
      console.error('Error al actualizar ciudad:', error)
      toast.error(error.message || 'Error al actualizar ciudad')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar ciudad
  const deleteCiudad = async (id_ciudad) => {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('ciudades')
        .delete()
        .eq('id_ciudad', id_ciudad)

      if (error) {
        // Si hay rutas asociadas
        if (error.message.includes('foreign key constraint')) {
          throw new Error('No se puede eliminar: existen rutas asociadas a esta ciudad')
        }
        throw error
      }

      toast.success('Ciudad eliminada exitosamente')
      await fetchCiudades() // Recargar lista
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar ciudad:', error)
      toast.error(error.message || 'Error al eliminar ciudad')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Buscar ciudades por término
  const searchCiudades = (ciudades, searchTerm) => {
    if (!searchTerm) return ciudades

    return ciudades.filter(ciudad =>
      ciudad.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const value = {
    ciudades,
    loading,
    submitting,
    fetchCiudades,
    createCiudad,
    updateCiudad,
    deleteCiudad,
    searchCiudades
  }

  return (
    <CiudadesAdminContext.Provider value={value}>
      {children}
    </CiudadesAdminContext.Provider>
  )
}
