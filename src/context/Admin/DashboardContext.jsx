import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabase';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe ser usado dentro de DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para las estadísticas
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    reservasHoy: 0,
    ingresosMensuales: 0,
    busesActivos: 0,
    cambioUsuarios: '+0%',
    cambioReservas: '+0%',
    cambioIngresos: '+0%',
    cambioBuses: '0'
  });

  const [reservasRecientes, setReservasRecientes] = useState([]);
  const [rutasPopulares, setRutasPopulares] = useState([]);

  // Función para obtener estadísticas principales
  const obtenerEstadisticas = async () => {
    try {
      // Obtener total de usuarios
      const { data: totalUsuarios, error: errorUsuarios } = await supabase
        .rpc('obtener_total_usuarios');
      
      if (errorUsuarios) throw errorUsuarios;

      // Obtener reservas de hoy
      const { data: reservasHoy, error: errorReservas } = await supabase
        .rpc('obtener_reservas_hoy');
      
      if (errorReservas) throw errorReservas;

      // Obtener ingresos mensuales
      const { data: ingresosMensuales, error: errorIngresos } = await supabase
        .rpc('obtener_ingresos_mensuales');
      
      if (errorIngresos) throw errorIngresos;

      // Obtener buses activos
      const { data: busesActivos, error: errorBuses } = await supabase
        .rpc('obtener_buses_activos');
      
      if (errorBuses) throw errorBuses;

      // Actualizar estado con los datos obtenidos
      setStats(prev => ({
        ...prev,
        totalUsuarios: totalUsuarios || 0,
        reservasHoy: reservasHoy || 0,
        ingresosMensuales: ingresosMensuales || 0,
        busesActivos: busesActivos || 0
      }));

    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError(err.message);
    }
  };

  // Función para obtener reservas recientes
  const obtenerReservasRecientes = async () => {
    try {
      const { data, error } = await supabase
        .rpc('obtener_reservas_recientes');
      
      if (error) throw error;

      // Formatear los datos para el componente
      const reservasFormateadas = data?.map((reserva, index) => ({
        id: index + 1,
        passenger: reserva.pasajero,
        route: reserva.ruta,
        date: new Date(reserva.fecha).toLocaleDateString('es-ES'),
        status: formatearEstado(reserva.estado),
        amount: `S/ ${reserva.monto.toFixed(2)}`
      })) || [];

      setReservasRecientes(reservasFormateadas);

    } catch (err) {
      console.error('Error al obtener reservas recientes:', err);
      setError(err.message);
    }
  };

  // Función para obtener rutas populares
  const obtenerRutasPopulares = async () => {
    try {
      const { data, error } = await supabase
        .rpc('obtener_rutas_populares');
      
      if (error) throw error;

      // Formatear los datos para el componente
      const rutasFormateadas = data?.map(ruta => ({
        route: ruta.ruta,
        trips: ruta.viajes_count,
        revenue: `S/ ${ruta.ingresos.toFixed(2)}`
      })) || [];

      setRutasPopulares(rutasFormateadas);

    } catch (err) {
      console.error('Error al obtener rutas populares:', err);
      setError(err.message);
    }
  };

  // Función auxiliar para formatear el estado
  const formatearEstado = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'completada': 'Confirmado',
      'cancelada': 'Cancelado'
    };
    return estados[estado] || estado;
  };

  // Función para refrescar todos los datos
  const refrescarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        obtenerEstadisticas(),
        obtenerReservasRecientes(),
        obtenerRutasPopulares()
      ]);
    } catch (err) {
      console.error('Error al refrescar datos del dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    refrescarDatos();

    // Opcional: Actualizar datos cada 5 minutos
    const interval = setInterval(() => {
      refrescarDatos();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  const value = {
    // Estados
    loading,
    error,
    stats,
    reservasRecientes,
    rutasPopulares,
    
    // Funciones
    refrescarDatos,
    obtenerEstadisticas,
    obtenerReservasRecientes,
    obtenerRutasPopulares
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
