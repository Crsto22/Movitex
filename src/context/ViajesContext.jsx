// contexto de viajes - maneja la busqueda y consulta de viajes disponibles
// consulta el backend para obtener viajes con disponibilidad de asientos

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import ImgIca from "../img/Ica.jpg"
import ImgArequipa from "../img/Arequipa.jpg"
import ImgCusco from "../img/Cuzco.jpg"

// funcion auxiliar para asignar imagenes a cada destino
const obtenerImagenDestino = (destino) => {
  const destinoLower = destino.toLowerCase();
  
  if (destinoLower.includes('arequipa')) {
    return ImgArequipa;
  } else if (destinoLower.includes('ica')) {
    return ImgIca;
  } else if (destinoLower.includes('cusco') || destinoLower.includes('cuzco')) {
    return ImgCusco;
  }
  
  return null; // sin imagen por defecto
};

const ViajesContext = createContext();

// Hook personalizado para usar el Context
export const useViajes = () => {
  const context = useContext(ViajesContext);
  if (!context) {
    throw new Error('useViajes debe ser usado dentro de un ViajesProvider');
  }
  return context;
};

// proveedor del contexto
export const ViajesProvider = ({ children }) => {
  // estados para manejar viajes y busquedas
  const [viajes, setViajes] = useState([]);                 // viajes encontrados en busqueda
  const [rutasUnicas, setRutasUnicas] = useState([]);       // rutas disponibles para mostrar
  const [loading, setLoading] = useState(false);            // carga de busqueda
  const [loadingRutas, setLoadingRutas] = useState(true);   // carga de rutas
  const [error, setError] = useState(null);                 // errores de consulta

  // funcion principal: buscar viajes disponibles
  // envia origen, destino y fecha al backend para buscar viajes
  const buscarViajes = useCallback(async (origen, destino, fecha) => {
    // validar que se proporcionaron todos los datos
    if (!origen || !destino || !fecha) {
      setError('Todos los campos son obligatorios: origen, destino y fecha');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // peticion al backend: ejecutar funcion sql compleja
      // el backend hace joins entre: viajes, ciudades, asientos
      // calcula: precio minimo, asientos disponibles, duracion
      const { data, error: supabaseError } = await supabase.rpc('buscar_viajes_disponibles', {
        p_origen: origen,
        p_destino: destino,
        p_fecha: fecha
      });

      if (supabaseError) {
        console.error('Error en Supabase:', supabaseError);
        throw supabaseError;
      }

      // transformar datos del backend para mostrar en la interfaz
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


      // guardar viajes encontrados en el estado
      setViajes(viajesFormateados);
      
    } catch (err) {
      console.error('Error al buscar viajes:', err);
      setError(err.message || 'Error al buscar viajes disponibles');
      setViajes([]);
      

    } finally {
      setLoading(false);
    }
  }, []);

  // funcion para limpiar resultados de busqueda
  // se usa cuando el usuario hace una nueva busqueda
  const limpiarViajes = useCallback(() => {
    setViajes([]);
    setError(null);
  }, []);

  // funcion para limpiar mensajes de error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // funcion para obtener rutas populares
  // consulta el backend para traer una ruta por cada origen-destino
  const obtenerRutasUnicas = useCallback(async () => {
    try {
      setLoadingRutas(true);
      setError(null);

      // peticion al backend: obtener rutas unicas con precio minimo
      // el backend agrupa viajes por origen-destino
      const { data, error: supabaseError } = await supabase.rpc('obtener_viajes_por_ruta_unica');

      if (supabaseError) {
        console.error('Error en Supabase:', supabaseError);
        throw supabaseError;
      }

      // agregar imagenes a cada ruta segun el destino
      const rutasConImagenes = data?.map(viaje => ({
        ...viaje,
        imagen: obtenerImagenDestino(viaje.destino)
      })) || [];

      // guardar rutas en el estado
      setRutasUnicas(rutasConImagenes);

      // Mostrar en consola para debug
      
      rutasConImagenes.forEach(viaje => {
        
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

  // cargar rutas automaticamente al iniciar la aplicacion
  useEffect(() => {
    obtenerRutasUnicas();
  }, [obtenerRutasUnicas]);

  // valores y funciones que se comparten con toda la aplicacion
  const value = {
    // estados
    viajes,                     // viajes encontrados en busqueda
    rutasUnicas,                // rutas populares disponibles
    loading,                    // carga de busqueda
    loadingRutas,               // carga de rutas
    error,                      // mensajes de error
    
    // funciones
    buscarViajes,               // buscar viajes por origen, destino, fecha
    limpiarViajes,              // limpiar resultados de busqueda
    limpiarError,               // limpiar errores
    obtenerRutasUnicas          // obtener rutas populares
  };

  return (
    <ViajesContext.Provider value={value}>
      {children}
    </ViajesContext.Provider>
  );
};

export default ViajesContext;