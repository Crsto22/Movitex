import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';

// Crear el contexto
const CiudadesContext = createContext();

// Hook personalizado para usar el contexto
export const useCiudades = () => {
  const context = useContext(CiudadesContext);
  if (!context) {
    throw new Error('useCiudades must be used within a CiudadesProvider');
  }
  return context;
};

// Proveedor del contexto
export const CiudadesProvider = ({ children }) => {
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener todas las ciudades
  const fetchCiudades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('ciudades')
        .select('*')
        .order('nombre', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setCiudades(data || []);
      console.log('✅ Ciudades cargadas correctamente:', data?.length || 0);

      return {
        success: true,
        data: data || [],
        message: 'Ciudades cargadas correctamente'
      };

    } catch (error) {
      console.error('❌ Error al cargar ciudades:', error);
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

  // Función para obtener una ciudad por ID
  const getCiudadById = (id) => {
    return ciudades.find(ciudad => ciudad.id_ciudad === id) || null;
  };

  // Función para buscar ciudades por nombre
  const searchCiudadesByName = (searchTerm) => {
    if (!searchTerm) return ciudades;
    
    return ciudades.filter(ciudad =>
      ciudad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Función para agregar una nueva ciudad (opcional para funcionalidades futuras)
  const addCiudad = async (nombreCiudad) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ciudades')
        .insert([{ nombre: nombreCiudad.trim() }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Actualizar el estado local
      setCiudades(prevCiudades => [...prevCiudades, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      
      console.log('✅ Ciudad agregada correctamente:', data);

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

  // Función para actualizar una ciudad (opcional para funcionalidades futuras)
  const updateCiudad = async (id, nuevoNombre) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ciudades')
        .update({ nombre: nuevoNombre.trim() })
        .eq('id_ciudad', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Actualizar el estado local
      setCiudades(prevCiudades => 
        prevCiudades.map(ciudad => 
          ciudad.id_ciudad === id ? data : ciudad
        ).sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
      
      console.log('✅ Ciudad actualizada correctamente:', data);

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

  // Función para eliminar una ciudad (opcional para funcionalidades futuras)
  const deleteCiudad = async (id) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('ciudades')
        .delete()
        .eq('id_ciudad', id);

      if (error) {
        throw new Error(error.message);
      }

      // Actualizar el estado local
      setCiudades(prevCiudades => prevCiudades.filter(ciudad => ciudad.id_ciudad !== id));
      
      console.log('✅ Ciudad eliminada correctamente');

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

  // Cargar ciudades al montar el componente
  useEffect(() => {
    fetchCiudades();
  }, []);

  // Valor del contexto
  const value = {
    ciudades,
    loading,
    error,
    fetchCiudades,
    getCiudadById,
    searchCiudadesByName,
    addCiudad,
    updateCiudad,
    deleteCiudad
  };

  return (
    <CiudadesContext.Provider value={value}>
      {children}
    </CiudadesContext.Provider>
  );
};

export default CiudadesContext;