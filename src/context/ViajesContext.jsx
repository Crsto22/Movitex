import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import ImgIca from "../img/Ica.jpg"
import ImgArequipa from "../img/Arequipa.jpg"
import ImgCusco from "../img/Cuzco.jpg"

// Función para obtener imagen según el destino
const obtenerImagenDestino = (destino) => {
  const destinoLower = destino.toLowerCase();
  
  if (destinoLower.includes('arequipa')) {
    return ImgArequipa;
  } else if (destinoLower.includes('ica')) {
    return ImgIca;
  } else if (destinoLower.includes('cusco') || destinoLower.includes('cuzco')) {
    return ImgCusco;
  }
  
  return null; // Sin imagen por defecto
};

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
  const [rutasUnicas, setRutasUnicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRutas, setLoadingRutas] = useState(true);
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

  // Función para obtener viajes por ruta única
  const obtenerRutasUnicas = useCallback(async () => {
    try {
      setLoadingRutas(true);
      setError(null);

      // Llamar a la función SQL usando RPC
      const { data, error: supabaseError } = await supabase.rpc('obtener_viajes_por_ruta_unica');

      if (supabaseError) {
        console.error('Error en Supabase:', supabaseError);
        throw supabaseError;
      }

      // Agregar imágenes según el destino
      const rutasConImagenes = data?.map(viaje => ({
        ...viaje,
        imagen: obtenerImagenDestino(viaje.destino)
      })) || [];

      // Guardar en el estado
      setRutasUnicas(rutasConImagenes);

      // Mostrar en consola para debug
      console.log('✅ Rutas únicas cargadas:', rutasConImagenes.length);
      rutasConImagenes.forEach(viaje => {
        console.log(`${viaje.origen} → ${viaje.destino} (${viaje.fecha})`);
      });

      return rutasConImagenes;
      
    } catch (err) {
      console.error('❌ Error al obtener rutas únicas:', err);
      setError(err.message || 'Error al obtener rutas disponibles');
      return [];
    } finally {
      setLoadingRutas(false);
    }
  }, []);

  // Cargar rutas únicas al montar el componente (solo una vez)
  useEffect(() => {
    obtenerRutasUnicas();
  }, [obtenerRutasUnicas]);

  // Valor del contexto que se proporcionará a los componentes hijos
  const value = {
    // Estados
    viajes,
    rutasUnicas,
    loading,
    loadingRutas,
    error,
    
    // Funciones
    buscarViajes,
    limpiarViajes,
    limpiarError,
    obtenerRutasUnicas
  };

  return (
    <ViajesContext.Provider value={value}>
      {children}
    </ViajesContext.Provider>
  );
};

export default ViajesContext;