// contexto de ciudades - maneja el catalogo de ciudades disponibles
// consulta el backend para obtener, crear, actualizar y eliminar ciudades

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';

const CiudadesContext = createContext();

// Hook personalizado para usar el contexto
export const useCiudades = () => {
  const context = useContext(CiudadesContext);
  if (!context) {
    throw new Error('useCiudades must be used within a CiudadesProvider');
  }
  return context;
};

// proveedor del contexto
export const CiudadesProvider = ({ children }) => {
  // estados para manejar ciudades
  const [ciudades, setCiudades] = useState([]);     // lista de todas las ciudades
  const [loading, setLoading] = useState(true);     // estado de carga
  const [error, setError] = useState(null);         // errores de consulta

  // funcion para obtener todas las ciudades desde el backend
  // consulta: SELECT * FROM ciudades ORDER BY nombre ASC
  const fetchCiudades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // peticion al backend: obtener todas las ciudades ordenadas alfabeticamente
      const { data, error: fetchError } = await supabase
        .from('ciudades')
        .select('*')
        .order('nombre', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // guardar ciudades en el estado
      setCiudades(data || []);


      return {
        success: true,
        data: data || [],
        message: 'Ciudades cargadas correctamente'
      };

    } catch (error) {
      console.error('Error al cargar ciudades:', error);
      setError(error.message);
      
      return {
        success: false,
        message: 'Error al cargar las ciudades',
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // funcion para buscar una ciudad por su id
  // busca en la lista local (no hace peticion al backend)
  const getCiudadById = (id) => {
    return ciudades.find(ciudad => ciudad.id_ciudad === id) || null;
  };

  // funcion para buscar ciudades por nombre
  // filtra la lista local (no hace peticion al backend)
  const searchCiudadesByName = (searchTerm) => {
    if (!searchTerm) return ciudades;
    
    return ciudades.filter(ciudad =>
      ciudad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // funcion para agregar una nueva ciudad al catalogo
  // envia peticion al backend para insertar en la base de datos
  const addCiudad = async (nombreCiudad) => {
    try {
      setLoading(true);
      
      // peticion al backend: INSERT INTO ciudades (nombre) VALUES (?)
      const { data, error } = await supabase
        .from('ciudades')
        .insert([{ nombre: nombreCiudad.trim() }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // actualizar lista local con la nueva ciudad
      setCiudades(prevCiudades => [...prevCiudades, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      
      

      return {
        success: true,
        data: data,
        message: 'Ciudad agregada correctamente'
      };

    } catch (error) {
      console.error('❌ Error al agregar ciudad:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage = 'Esta ciudad ya existe';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // funcion para actualizar el nombre de una ciudad
  // envia peticion al backend para actualizar en la base de datos
  const updateCiudad = async (id, nuevoNombre) => {
    try {
      setLoading(true);
      
      // peticion al backend: UPDATE ciudades SET nombre = ? WHERE id_ciudad = ?
      const { data, error } = await supabase
        .from('ciudades')
        .update({ nombre: nuevoNombre.trim() })
        .eq('id_ciudad', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // actualizar lista local con los nuevos datos
      setCiudades(prevCiudades => 
        prevCiudades.map(ciudad => 
          ciudad.id_ciudad === id ? data : ciudad
        ).sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
      
      

      return {
        success: true,
        data: data,
        message: 'Ciudad actualizada correctamente'
      };

    } catch (error) {
      console.error('❌ Error al actualizar ciudad:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage = 'Ya existe una ciudad con este nombre';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // funcion para eliminar una ciudad del catalogo
  // envia peticion al backend para eliminar de la base de datos
  const deleteCiudad = async (id) => {
    try {
      setLoading(true);
      
      // peticion al backend: DELETE FROM ciudades WHERE id_ciudad = ?
      const { error } = await supabase
        .from('ciudades')
        .delete()
        .eq('id_ciudad', id);

      if (error) {
        throw new Error(error.message);
      }

      // actualizar lista local removiendo la ciudad eliminada
      setCiudades(prevCiudades => prevCiudades.filter(ciudad => ciudad.id_ciudad !== id));
      
      

      return {
        success: true,
        message: 'Ciudad eliminada correctamente'
      };

    } catch (error) {
      console.error('❌ Error al eliminar ciudad:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('violates foreign key constraint')) {
        errorMessage = 'No se puede eliminar esta ciudad porque está siendo utilizada en rutas';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // cargar ciudades automaticamente al iniciar la aplicacion
  useEffect(() => {
    fetchCiudades();
  }, []);

  // valores y funciones que se comparten con toda la aplicacion
  const value = {
    ciudades,                   // lista de ciudades
    loading,                    // estado de carga
    error,                      // mensajes de error
    fetchCiudades,              // obtener ciudades del backend
    getCiudadById,              // buscar ciudad por id
    searchCiudadesByName,       // buscar ciudades por nombre
    addCiudad,                  // agregar nueva ciudad
    updateCiudad,               // actualizar ciudad existente
    deleteCiudad                // eliminar ciudad
  };

  return (
    <CiudadesContext.Provider value={value}>
      {children}
    </CiudadesContext.Provider>
  );
};

export default CiudadesContext;