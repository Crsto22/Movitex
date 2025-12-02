import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../supabase/supabase'
import toast from 'react-hot-toast'

const ReportesContext = createContext()

export const useReportes = () => {
  const context = useContext(ReportesContext)
  if (!context) {
    throw new Error('useReportes debe ser usado dentro de ReportesProvider')
  }
  return context
}

export const ReportesProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [metricas, setMetricas] = useState({
    totalReservas: 0,
    totalIngresos: 0,
    totalPasajeros: 0,
    reservasHoy: 0
  })

  // Obtener métricas generales
  const fetchMetricas = async () => {
    try {
      setLoading(true)

      // Total de reservas completadas
      const { count: totalReservas } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completada')

      // Total ingresos
      const { data: reservasData } = await supabase
        .from('reservas')
        .select('total_pagado')
        .eq('estado', 'completada')

      const totalIngresos = reservasData?.reduce((sum, r) => sum + parseFloat(r.total_pagado || 0), 0) || 0

      // Total pasajeros
      const { count: totalPasajeros } = await supabase
        .from('reserva_pasajero')
        .select('*', { count: 'exact', head: true })

      // Reservas de hoy
      const hoy = new Date().toISOString().split('T')[0]
      const { count: reservasHoy } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_reserva', `${hoy}T00:00:00`)
        .lte('fecha_reserva', `${hoy}T23:59:59`)

      setMetricas({
        totalReservas: totalReservas || 0,
        totalIngresos: totalIngresos || 0,
        totalPasajeros: totalPasajeros || 0,
        reservasHoy: reservasHoy || 0
      })
    } catch (error) {
      console.error('Error al obtener métricas:', error)
      toast.error('Error al cargar las métricas')
    } finally {
      setLoading(false)
    }
  }

  // Obtener ventas por fecha
  const fetchVentasPorFecha = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          id_reserva,
          fecha_reserva,
          total_pagado,
          estado,
          viaje:viajes(
            fecha,
            hora_salida,
            ruta:rutas(
              ciudad_origen:ciudades!rutas_id_origen_fkey(nombre),
              ciudad_destino:ciudades!rutas_id_destino_fkey(nombre)
            ),
            bus:buses(
              placa,
              servicio:servicios(nombre)
            )
          ),
          reserva_pasajero!reserva_pasajero_id_reserva_fkey(
            pasajero:pasajeros!reserva_pasajero_id_pasajero_fkey(
              dni,
              nombres,
              apellidos
            )
          )
        `)
        .gte('fecha_reserva', `${fechaInicio}T00:00:00`)
        .lte('fecha_reserva', `${fechaFin}T23:59:59`)
        .eq('estado', 'completada')
        .order('fecha_reserva', { ascending: false })

      if (error) throw error

      const ventasFormateadas = data?.map(reserva => ({
        id_reserva: reserva.id_reserva,
        fecha_reserva: reserva.fecha_reserva,
        total_pagado: parseFloat(reserva.total_pagado || 0),
        origen: reserva.viaje?.ruta?.ciudad_origen?.nombre || 'N/A',
        destino: reserva.viaje?.ruta?.ciudad_destino?.nombre || 'N/A',
        servicio: reserva.viaje?.bus?.servicio?.nombre || 'N/A',
        fecha_viaje: reserva.viaje?.fecha || 'N/A',
        pasajeros: reserva.reserva_pasajero?.map(rp => ({
          dni: rp.pasajero?.dni,
          nombre: rp.pasajero?.nombres,
          apellido: rp.pasajero?.apellidos
        })) || []
      })) || []

      return ventasFormateadas
    } catch (error) {
      console.error('Error al obtener ventas:', error)
      toast.error('Error al cargar las ventas')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Obtener ingresos por ruta
  const fetchIngresosPorRuta = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          total_pagado,
          viaje:viajes(
            fecha,
            ruta:rutas(
              id_ruta,
              ciudad_origen:ciudades!rutas_id_origen_fkey(nombre),
              ciudad_destino:ciudades!rutas_id_destino_fkey(nombre)
            )
          )
        `)
        .gte('fecha_reserva', `${fechaInicio}T00:00:00`)
        .lte('fecha_reserva', `${fechaFin}T23:59:59`)
        .eq('estado', 'completada')

      if (error) throw error

      const rutas = {}
      data?.forEach(reserva => {
        const origen = reserva.viaje?.ruta?.ciudad_origen?.nombre || 'N/A'
        const destino = reserva.viaje?.ruta?.ciudad_destino?.nombre || 'N/A'
        const rutaKey = `${origen} - ${destino}`

        if (!rutas[rutaKey]) {
          rutas[rutaKey] = {
            origen,
            destino,
            total: 0,
            cantidad: 0
          }
        }
        rutas[rutaKey].total += parseFloat(reserva.total_pagado || 0)
        rutas[rutaKey].cantidad += 1
      })

      return Object.values(rutas).sort((a, b) => b.total - a.total)
    } catch (error) {
      console.error('Error al obtener ingresos por ruta:', error)
      toast.error('Error al cargar ingresos por ruta')
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetricas()
  }, [])

  const value = {
    loading,
    metricas,
    fetchMetricas,
    fetchVentasPorFecha,
    fetchIngresosPorRuta
  }

  return (
    <ReportesContext.Provider value={value}>
      {children}
    </ReportesContext.Provider>
  )
}
