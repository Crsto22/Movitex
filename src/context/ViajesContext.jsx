import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../supabase/supabase';

// Crear el Context
const ViajesContext = createContext();

// Hook personalizado para usar el Context
export const useViajes = () => {
  const context = useContext(ViajesContext);
  if (!context) {
    throw new Error('useViajes debe ser usado dentro de un ViajesProvider');
  }
  return context;
};

// Provider del Context
export const ViajesProvider = ({ children }) => {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para buscar viajes disponibles
  const buscarViajes = useCallback(async (origen, destino, fecha) => {
    // Validar parámetros de entrada
    if (!origen || !destino || !fecha) {
      setError('Todos los campos son obligatorios: origen, destino y fecha');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Llamar a la función SQL usando RPC (Remote Procedure Call)
      const { data, error: supabaseError } = await supabase.rpc('buscar_viajes_disponibles', {
        p_origen: origen,
        p_destino: destino,
        p_fecha: fecha
      });

      if (supabaseError) {
        console.error('Error en Supabase:', supabaseError);
        throw supabaseError;
      }

      // Transformar los datos para mejor uso en el frontend
      const viajesFormateados = data?.map(viaje => ({
        idViaje: viaje.id_viaje,
        tipoServicio: viaje.tipo_servicio,
        fechaIda: viaje.fecha_ida,
        horaSalida: viaje.hora_salida,
        duracionEstimada: viaje.duracion_estimada,
        anguloPiso1: viaje.angulo_piso1,
        anguloPiso2: viaje.angulo_piso2,
        precioMinimo: parseFloat(viaje.precio_minimo),
        asientosDisponibles: parseInt(viaje.asientos_disponibles),
        ciudadOrigen: viaje.origen,
        ciudadDestino: viaje.destino,
      })) || [];


      setViajes(viajesFormateados);
      
    } catch (err) {
      console.error('Error al buscar viajes:', err);
      setError(err.message || 'Error al buscar viajes disponibles');
      setViajes([]);
      

    } finally {
      setLoading(false);
    }
  }, []);

  // Función para limpiar los resultados
  const limpiarViajes = useCallback(() => {
    setViajes([]);
    setError(null);
  }, []);

  // Función para limpiar solo el error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Valor del contexto que se proporcionará a los componentes hijos
  const value = {
    // Estados
    viajes,
    loading,
    error,
    
    // Funciones
    buscarViajes,
    limpiarViajes,
    limpiarError
  };

  return (
    <ViajesContext.Provider value={value}>
      {children}
    </ViajesContext.Provider>
  );
};

export default ViajesContext;