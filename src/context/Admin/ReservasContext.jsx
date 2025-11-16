// context for Reservas (Admin) - maneja CRUD completo de reservas
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../../supabase/supabase'

const ReservasAdminContext = createContext()

export const useReservasAdmin = () => {
  const context = useContext(ReservasAdminContext)
  if (!context) {
    throw new Error('useReservasAdmin must be used within a ReservasAdminProvider')
  }
  return context
}

export const ReservasAdminProvider = ({ children }) => {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Listas para dropdowns
  const [viajes, setViajes] = useState([])
  const [usuarios, setUsuarios] = useState([])

  // Función para obtener todas las reservas con JOINs
  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // SELECT con JOINs a viajes (con rutas, ciudades, buses, servicios) y usuarios
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          viaje:viajes!reservas_id_viaje_fkey(
            id_viaje,
            fecha,
            hora_salida,
            hora_llegada,
            ruta:rutas!viajes_id_ruta_fkey(
              id_ruta,
              ciudad_origen:ciudades!rutas_id_origen_fkey(nombre),
              ciudad_destino:ciudades!rutas_id_destino_fkey(nombre)
            ),
            bus:buses!viajes_id_bus_fkey(
              id_bus,
              placa,
              servicio:servicios!buses_id_servicio_fkey(
                id_servicio,
                nombre
              )
            )
          ),
          usuario:usuarios!reservas_id_usuario_fkey(
            id_usuario,
            nombre,
            apellido,
            correo
          )
        `)
        .order('fecha_reserva', { ascending: false })

      if (error) throw error

      console.log('✅ Reservas cargadas:', data)
      setReservas(data || [])
    } catch (err) {
      console.error('❌ Error al cargar reservas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para obtener viajes disponibles (para dropdown)
  const fetchViajes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('viajes')
        .select(`
          id_viaje,
          fecha,
          hora_salida,
          ruta:rutas!viajes_id_ruta_fkey(
            ciudad_origen:ciudades!rutas_id_origen_fkey(nombre),
            ciudad_destino:ciudades!rutas_id_destino_fkey(nombre)
          ),
          bus:buses!viajes_id_bus_fkey(
            placa,
            servicio:servicios!buses_id_servicio_fkey(nombre)
          )
        `)
        .eq('activo', true)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true })

      if (error) throw error

      setViajes(data || [])
    } catch (err) {
      console.error('❌ Error al cargar viajes:', err)
    }
  }, [])

  // Función para obtener usuarios (para dropdown)
  const fetchUsuarios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id_usuario, nombre, apellido, correo, dni')
        .order('nombre', { ascending: true })

      if (error) throw error

      setUsuarios(data || [])
    } catch (err) {
      console.error('❌ Error al cargar usuarios:', err)
    }
  }, [])

  // Función para actualizar estado de reserva
  const updateEstadoReserva = useCallback(async (idReserva, nuevoEstado) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('reservas')
        .update({ estado: nuevoEstado })
        .eq('id_reserva', idReserva)

      if (error) throw error

      console.log('✅ Estado de reserva actualizado')
      await fetchReservas()
      return { success: true }
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [fetchReservas])

  // Función para eliminar reserva
  const deleteReserva = useCallback(async (idReserva) => {
    try {
      setLoading(true)
      setError(null)

      // Primero eliminar pasajeros relacionados (CASCADE debe manejarlo, pero por si acaso)
      const { error: pasajerosError } = await supabase
        .from('pasajeros')
        .delete()
        .eq('id_reserva', idReserva)

      if (pasajerosError && pasajerosError.code !== '42P01') {
        console.warn('⚠️ Error al eliminar pasajeros:', pasajerosError)
      }

      // Eliminar reserva
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id_reserva', idReserva)

      if (error) {
        if (error.code === '23503') {
          throw new Error('No se puede eliminar la reserva porque tiene datos relacionados')
        }
        throw error
      }

      console.log('✅ Reserva eliminada')
      await fetchReservas()
      return { success: true }
    } catch (err) {
      console.error('❌ Error al eliminar reserva:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [fetchReservas])

  // Función para buscar reservas
  const searchReservas = useCallback(async (filters) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('reservas')
        .select(`
          *,
          viaje:viajes!reservas_id_viaje_fkey(
            id_viaje,
            fecha,
            hora_salida,
            hora_llegada,
            ruta:rutas!viajes_id_ruta_fkey(
              id_ruta,
              ciudad_origen:ciudades!rutas_id_origen_fkey(nombre),
              ciudad_destino:ciudades!rutas_id_destino_fkey(nombre)
            ),
            bus:buses!viajes_id_bus_fkey(
              id_bus,
              placa,
              servicio:servicios!buses_id_servicio_fkey(
                id_servicio,
                nombre
              )
            )
          ),
          usuario:usuarios!reservas_id_usuario_fkey(
            id_usuario,
            nombre,
            apellido,
            correo
          )
        `)

      // Aplicar filtros
      if (filters.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado)
      }

      if (filters.fechaInicio) {
        query = query.gte('fecha_reserva', filters.fechaInicio)
      }

      if (filters.fechaFin) {
        query = query.lte('fecha_reserva', filters.fechaFin)
      }

      if (filters.correo) {
        // Buscar en correo de usuario o correo anónimo
        query = query.or(`correo_anonimo.ilike.%${filters.correo}%`)
      }

      const { data, error } = await query.order('fecha_reserva', { ascending: false })

      if (error) throw error

      console.log('✅ Búsqueda completada:', data?.length, 'resultados')
      setReservas(data || [])
    } catch (err) {
      console.error('❌ Error en búsqueda:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para obtener detalles de pasajeros de una reserva
  const fetchPasajeros = useCallback(async (idReserva) => {
    try {
      // Paso 1: Obtener relación reserva-pasajero
      const { data: reservaPasajeros, error: errorRP } = await supabase
        .from('reserva_pasajero')
        .select(`
          id_pasajero,
          pasajero:pasajeros!reserva_pasajero_id_pasajero_fkey(
            id_pasajero,
            dni,
            nombres,
            apellidos,
            fecha_nacimiento,
            genero
          )
        `)
        .eq('id_reserva', idReserva)

      if (errorRP) throw errorRP

      if (!reservaPasajeros || reservaPasajeros.length === 0) {
        return []
      }

      // Paso 2: Para cada pasajero, obtener su asiento
      const pasajerosConAsientos = await Promise.all(
        reservaPasajeros.map(async (rp) => {
          // Obtener asiento del pasajero desde detalle_pasajero_asiento
          const { data: detalleAsiento, error: errorDA } = await supabase
            .from('detalle_pasajero_asiento')
            .select(`
              id_asiento,
              asiento:asientos!detalle_pasajero_asiento_id_asiento_fkey(
                numero_asiento,
                piso
              )
            `)
            .eq('id_reserva', idReserva)
            .eq('id_pasajero', rp.id_pasajero)
            .single()

          if (errorDA) {
            console.warn('⚠️ No se encontró asiento para pasajero:', rp.id_pasajero)
          }

          // Obtener precio del asiento desde detalle_reserva
          const { data: detalleReserva, error: errorDR } = await supabase
            .from('detalle_reserva')
            .select('precio_asiento')
            .eq('id_reserva', idReserva)
            .eq('id_asiento', detalleAsiento?.id_asiento)
            .single()

          if (errorDR) {
            console.warn('⚠️ No se encontró precio para asiento:', detalleAsiento?.id_asiento)
          }

          return {
            id_pasajero: rp.pasajero.id_pasajero,
            dni: rp.pasajero.dni,
            nombre: rp.pasajero.nombres,
            apellido: rp.pasajero.apellidos,
            fecha_nacimiento: rp.pasajero.fecha_nacimiento,
            genero: rp.pasajero.genero,
            asiento: {
              numero_asiento: detalleAsiento?.asiento?.numero_asiento || 'N/A',
              piso: detalleAsiento?.asiento?.piso || 1,
              precio: detalleReserva?.precio_asiento || 0
            }
          }
        })
      )

      return pasajerosConAsientos
    } catch (err) {
      console.error('❌ Error al cargar pasajeros:', err)
      return []
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    fetchReservas()
    fetchViajes()
    fetchUsuarios()
  }, [fetchReservas, fetchViajes, fetchUsuarios])

  const value = {
    reservas,
    loading,
    error,
    viajes,
    usuarios,
    fetchReservas,
    fetchViajes,
    fetchUsuarios,
    updateEstadoReserva,
    deleteReserva,
    searchReservas,
    fetchPasajeros
  }

  return (
    <ReservasAdminContext.Provider value={value}>
      {children}
    </ReservasAdminContext.Provider>
  )
}

export default ReservasAdminContext
