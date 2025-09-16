// Servicio para consultas de DNI usando la API de APIS Perú
const DNI_API_BASE_URL = 'https://dniruc.apisperu.com/api/v1';
const DNI_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFydHVybzIwMDUxMkBnbWFpbC5jb20ifQ.weOFvvtMjsV79-RU4aecV7RzyAfU9eC5SzkPh4XwRnI';

/**
 * Valida si un DNI tiene el formato correcto
 * @param {string} dni - Número de DNI a validar
 * @returns {boolean} - True si el DNI es válido
 */
export const validateDNI = (dni) => {
  if (!dni || typeof dni !== 'string') return false;
  return /^\d{8}$/.test(dni.trim());
};

/**
 * Consulta los datos de una persona por su DNI
 * @param {string} dni - Número de DNI de 8 dígitos
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de la persona
 */
export const searchByDNI = async (dni) => {
  // Validar DNI antes de hacer la consulta
  if (!validateDNI(dni)) {
    throw new Error('El DNI debe tener exactamente 8 dígitos');
  }

  const cleanDNI = dni.trim();
  
  try {
    const response = await fetch(
      `${DNI_API_BASE_URL}/dni/${cleanDNI}?token=${DNI_API_TOKEN}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    // Verificar estructura de respuesta
    if (typeof data !== 'object' || data === null) {
      throw new Error('Respuesta inválida del servidor');
    }

    return data;
  } catch (error) {
    // Manejar diferentes tipos de errores
    if (error.name === 'AbortError') {
      throw new Error('La consulta tardó demasiado tiempo. Intenta nuevamente.');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    
    throw error;
  }
};

/**
 * Procesa la respuesta de la API y extrae los datos relevantes
 * @param {Object} apiResponse - Respuesta de la API
 * @returns {Object} - Datos procesados para el formulario
 */
export const processPersonData = (apiResponse) => {
  if (!apiResponse.success) {
    return {
      success: false,
      message: apiResponse.message || 'No se encontraron resultados para este DNI'
    };
  }

  // Combinar apellidos
  const apellidoCompleto = [
    apiResponse.apellidoPaterno,
    apiResponse.apellidoMaterno
  ]
    .filter(apellido => apellido && apellido.trim())
    .join(' ')
    .trim();

  return {
    success: true,
    data: {
      dni: apiResponse.dni,
      nombre: apiResponse.nombres || '',
      apellido: apellidoCompleto,
      codigoVerifica: apiResponse.codVerifica,
      codigoVerificaLetra: apiResponse.codVerificaLetra
    }
  };
};

/**
 * Función principal para buscar y procesar datos de DNI
 * @param {string} dni - Número de DNI
 * @returns {Promise<Object>} - Datos procesados listos para usar en el formulario
 */
export const getDNIData = async (dni) => {
  try {
    const apiResponse = await searchByDNI(dni);
    return processPersonData(apiResponse);
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Exportación por defecto del servicio principal
export default {
  validateDNI,
  searchByDNI,
  processPersonData,
  getDNIData
};
