import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import toast from 'react-hot-toast'

const UsuariosContext = createContext()

export const useUsuarios = () => {
  const context = useContext(UsuariosContext)
  if (!context) {
    throw new Error('useUsuarios debe ser usado dentro de UsuariosProvider')
  }
  return context
}

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar usuarios desde Supabase
  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('fecha_creacion', { ascending: false })

      if (error) throw error

      setUsuarios(data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Actualizar usuario
  const updateUsuario = async (id_usuario, userData) => {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: userData.nombre,
          apellido: userData.apellido,
          dni: userData.dni,
          correo: userData.correo,
          telefono: userData.telefono,
          fecha_nacimiento: userData.fecha_nacimiento || null,
          genero: userData.genero || null,
          rol: userData.rol
        })
        .eq('id_usuario', id_usuario)

      if (error) {
        // Manejo de errores específicos
        if (error.message.includes('duplicate key value violates unique constraint "usuarios_dni_key"')) {
          throw new Error('El DNI ya está registrado')
        } else if (error.message.includes('duplicate key value violates unique constraint "usuarios_correo_key"')) {
          throw new Error('El correo ya está registrado')
        } else if (error.message.includes('duplicate key value violates unique constraint "usuarios_telefono_key"')) {
          throw new Error('El teléfono ya está registrado')
        }
        throw error
      }

      toast.success('Usuario actualizado exitosamente')
      await fetchUsuarios() // Recargar lista
      return { success: true }
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      toast.error(error.message || 'Error al actualizar usuario')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar usuario
  const deleteUsuario = async (id_usuario) => {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id_usuario', id_usuario)

      if (error) throw error

      toast.success('Usuario eliminado exitosamente')
      await fetchUsuarios() // Recargar lista
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast.error('Error al eliminar usuario')
      return { success: false, error }
    } finally {
      setSubmitting(false)
    }
  }

  // Buscar usuarios por término
  const searchUsuarios = (usuarios, searchTerm) => {
    if (!searchTerm) return usuarios

    return usuarios.filter(usuario =>
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.dni?.includes(searchTerm)
    )
  }

  const value = {
    usuarios,
    loading,
    submitting,
    fetchUsuarios,
    updateUsuario,
    deleteUsuario,
    searchUsuarios
  }

  return (
    <UsuariosContext.Provider value={value}>
      {children}
    </UsuariosContext.Provider>
  )
}
