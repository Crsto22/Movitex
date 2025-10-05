import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../supabase/supabase';

// Crear el Context
const AsientosContext = createContext();

// Hook personalizado para usar el Context
export const useAsientos = () => {
  const context = useContext(AsientosContext);
  if (!context) {
    throw new Error('useAsientos debe ser usado dentro de un AsientosProvider');
  }
  return context;
};

// Provider del Context
export const AsientosProvider = ({ children }) => {
  const [asientos, setAsientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener asientos por ID de viaje
  const obtenerAsientosPorViaje = useCallback(async (idViaje) => {
    // Validar parámetro de entrada
    if (!idViaje) {
      setError('El ID del viaje es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Llamar a la función SQL usando RPC (Remote Procedure Call)
      const { data, error: supabaseError } = await supabase.rpc('obtener_asientos_por_viaje', {
        p_id_viaje: idViaje
      });

      if (supabaseError) {
        console.error('Error en Supabase:', supabaseError);
        throw supabaseError;
      }

      // Transformar los datos para mejor uso en el frontend
      const asientosFormateados = data?.map(asiento => ({
        idAsiento: asiento.id_asiento,
        numeroAsiento: asiento.numero_asiento,
        piso: asiento.piso,
        anguloReclinacion: asiento.angulo_reclinacion,
        precio: parseFloat(asiento.precio),
        estado: asiento.estado
      })) || [];

      setAsientos(asientosFormateados);
      
    } catch (err) {
      console.error('Error al obtener asientos:', err);
      setError(err.message || 'Error al obtener asientos del viaje');
      setAsientos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para limpiar los asientos
  const limpiarAsientos = useCallback(() => {
    setAsientos([]);
    setError(null);
  }, []);

  // Función para limpiar solo el error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Valor del contexto que se proporcionará a los componentes hijos
  const value = {
    // Estados
    asientos,
    loading,
    error,
    
    // Funciones
    obtenerAsientosPorViaje,
    limpiarAsientos,
    limpiarError
  };

  return (
    <AsientosContext.Provider value={value}>
      {children}
    </AsientosContext.Provider>
  );
};

export default AsientosContext;