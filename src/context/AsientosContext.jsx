// contexto de asientos - maneja la disponibilidad de asientos de los viajes
// consulta el backend para obtener asientos disponibles, ocupados y reservados

import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../supabase/supabase';

const AsientosContext = createContext();

// Hook personalizado para usar el Context
export const useAsientos = () => {
  const context = useContext(AsientosContext);
  if (!context) {
    throw new Error('useAsientos debe ser usado dentro de un AsientosProvider');
  }
  return context;
};

// proveedor del contexto
export const AsientosProvider = ({ children }) => {
  // estados para manejar asientos y carga
  const [asientos, setAsientos] = useState([]);     // lista de asientos del viaje
  const [loading, setLoading] = useState(false);    // estado de carga
  const [error, setError] = useState(null);         // errores de consulta

  // funcion para obtener asientos de un viaje especifico
  // consulta el backend para traer todos los asientos con su estado actual
  const obtenerAsientosPorViaje = useCallback(async (idViaje) => {
    // validar que se proporciono el id del viaje
    if (!idViaje) {
      setError('El ID del viaje es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // peticion al backend: ejecutar funcion sql para obtener asientos
      // el backend consulta: SELECT * FROM asientos WHERE id_viaje = idViaje
      const { data, error: supabaseError } = await supabase.rpc('obtener_asientos_por_viaje', {
        p_id_viaje: idViaje
      });

      if (supabaseError) {
        console.error('Error en Supabase:', supabaseError);
        throw supabaseError;
      }

      // transformar datos del backend para mostrar en la interfaz
      // cada asiento tiene: numero, piso, precio, estado (disponible/ocupado/reservado)
      const asientosFormateados = data?.map(asiento => ({
        idAsiento: asiento.id_asiento,
        numeroAsiento: asiento.numero_asiento,
        piso: asiento.piso,
        anguloReclinacion: asiento.angulo_reclinacion,
        precio: parseFloat(asiento.precio),
        estado: asiento.estado
      })) || [];

      // guardar asientos en el estado
      setAsientos(asientosFormateados);
      
    } catch (err) {
      console.error('Error al obtener asientos:', err);
      setError(err.message || 'Error al obtener asientos del viaje');
      setAsientos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // funcion para limpiar la lista de asientos
  // se usa cuando el usuario cambia de viaje
  const limpiarAsientos = useCallback(() => {
    setAsientos([]);
    setError(null);
  }, []);

  // funcion para limpiar mensajes de error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // valores y funciones que se comparten con toda la aplicacion
  // cualquier componente puede usar estas funciones para consultar asientos
  const value = {
    // estados
    asientos,                       // lista de asientos del viaje
    loading,                        // estado de carga
    error,                          // mensajes de error
    
    // funciones
    obtenerAsientosPorViaje,        // obtener asientos de un viaje
    limpiarAsientos,                // limpiar lista de asientos
    limpiarError                    // limpiar errores
  };

  return (
    <AsientosContext.Provider value={value}>
      {children}
    </AsientosContext.Provider>
  );
};

export default AsientosContext;