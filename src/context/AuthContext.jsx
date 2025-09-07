import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funciones para manejar localStorage
  const saveUserDataToStorage = (userData) => {
    try {
      console.log('💾 Guardando datos en localStorage:', userData);
      localStorage.setItem('movitex_user_data', JSON.stringify(userData));
      console.log('✅ Datos guardados correctamente en localStorage');
    } catch (error) {
      console.error('Error al guardar datos en localStorage:', error);
    }
  };

  const getUserDataFromStorage = () => {
    try {
      const storedData = localStorage.getItem('movitex_user_data');
      console.log('🔍 Datos en localStorage:', storedData);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error al obtener datos del localStorage:', error);
      return null;
    }
  };

  const clearUserDataFromStorage = () => {
    try {
      localStorage.removeItem('movitex_user_data');
    } catch (error) {
      console.error('Error al limpiar datos del localStorage:', error);
    }
  };

  // Función para registrar un nuevo usuario
  const registerUser = async (userData, captchaToken) => {
    try {
      setLoading(true);
      
      const { documento, telefono, nombre, apellido, email, password } = userData;

      // Paso 1: Crear usuario en Supabase Auth con confirmación de email
      const signUpOptions = {
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      };

      // Agregar captchaToken si está disponible
      if (captchaToken) {
        signUpOptions.options.captchaToken = captchaToken;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp(signUpOptions);

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Error al crear el usuario en la autenticación');
      }

      // Paso 2: Insertar datos del usuario en la tabla usuarios
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert([
          {
            id_usuario: authData.user.id,
            nombre: nombre,
            apellido: apellido,
            dni: documento,
            correo: email,
            telefono: telefono,
            foto_url: null, // Como se especifica, se guarda como null
            fecha_creacion: new Date().toISOString() // Fecha local del cliente
          }
        ]);

      if (dbError) {
        // Si hay error en la base de datos, intentamos limpiar el usuario de auth
        console.error('Error al insertar en la base de datos:', dbError);
        
        // Intentar eliminar el usuario de auth si la inserción falló
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Error al limpiar usuario de auth:', cleanupError);
        }
        
        throw new Error(dbError.message || 'Error al guardar los datos del usuario');
      }

      // Paso 3: NO establecer sesión automáticamente, solo retornar éxito
      // El usuario debe confirmar su email antes de poder iniciar sesión
      
      return {
        success: true,
        message: 'Se ha enviado un correo de confirmación. Revisa tu bandeja de entrada antes de iniciar sesión.',
        user: authData.user,
        needsEmailConfirmation: true
      };

    } catch (error) {
      console.error('Error en el registro:', error);
      
      // Mapear errores comunes a mensajes más amigables
      let errorMessage = error.message;
      
      if (error.message.includes('duplicate key value violates unique constraint "usuarios_dni_key"')) {
        errorMessage = 'El número de documento ya está registrado';
      } else if (error.message.includes('duplicate key value violates unique constraint "usuarios_correo_key"')) {
        errorMessage = 'El correo electrónico ya está registrado';
      } else if (error.message.includes('duplicate key value violates unique constraint "usuarios_telefono_key"')) {
        errorMessage = 'El número de teléfono ya está registrado';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Este correo ya tiene una cuenta registrada';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'El formato del correo electrónico no es válido';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const loginUser = async (email, password, captchaToken) => {
    try {
      setLoading(true);
      
      const signInOptions = {
        email: email,
        password: password,
      };

      // Agregar captchaToken si está disponible
      if (captchaToken) {
        signInOptions.options = { captchaToken };
      }

      const { data, error } = await supabase.auth.signInWithPassword(signInOptions);

      if (error) {
        throw new Error(error.message);
      }

      // Verificar si el email está confirmado
      if (!data.user.email_confirmed_at) {
        // Cerrar sesión automáticamente si el email no está confirmado
        await supabase.auth.signOut();
        return {
          success: false,
          message: 'Debes confirmar tu correo antes de acceder al sistema'
        };
      }

      setUser(data.user);
      
      // Obtener datos completos del usuario desde la tabla usuarios
      const userDataResult = await getUserData(data.user.id);
      
      if (!userDataResult.success) {
        console.warn('No se pudieron obtener los datos completos del usuario:', userDataResult.message);
      }
      
      return {
        success: true,
        message: '¡Inicio de sesión exitoso!',
        user: data.user
      };

    } catch (error) {
      console.error('Error en el login:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Debes confirmar tu correo antes de acceder al sistema';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logoutUser = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Limpiar estados y localStorage
      setUser(null);
      setUserData(null);
      clearUserDataFromStorage();
      
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      };
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return {
        success: false,
        message: 'Error al cerrar sesión'
      };
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener datos completos del usuario desde la base de datos
  const fetchUserDataFromDB = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        userData: data
      };

    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return {
        success: false,
        message: 'Error al obtener los datos del usuario'
      };
    }
  };

  // Función para obtener y establecer datos completos del usuario
  const getUserData = async (userId) => {
    try {
      const result = await fetchUserDataFromDB(userId);
      
      if (result.success) {
        setUserData(result.userData);
        saveUserDataToStorage(result.userData);
        return result;
      }
      
      return result;

    } catch (error) {
      console.error('Error al obtener y establecer datos del usuario:', error);
      return {
        success: false,
        message: 'Error al obtener los datos del usuario'
      };
    }
  };

  // Función para actualizar datos del usuario
  const updateUserData = async (userId, updatedData) => {
    try {
      setLoading(true);

      // Actualizar en la base de datos
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nombre: updatedData.nombre,
          apellido: updatedData.apellido,
          telefono: updatedData.telefono
        })
        .eq('id_usuario', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Actualizar estado local y localStorage
      setUserData(data);
      saveUserDataToStorage(data);

      return {
        success: true,
        message: 'Datos actualizados correctamente',
        userData: data
      };

    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('duplicate key value violates unique constraint "usuarios_telefono_key"')) {
        errorMessage = 'El número de teléfono ya está registrado';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Función para reenviar correo de confirmación
  const resendConfirmationEmail = async (email) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Correo de confirmación reenviado exitosamente'
      };

    } catch (error) {
      console.error('Error reenviando email de confirmación:', error);
      return {
        success: false,
        message: error.message || 'Error al reenviar el correo de confirmación'
      };
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar correo de recuperación de contraseña
  const resetPasswordForEmail = async (email, captchaToken) => {
    try {
      setLoading(true);
      
      const resetOptions = {
        redirectTo: `${window.location.origin}/reset-password`
      };

      // Agregar captchaToken si está disponible
      if (captchaToken) {
        resetOptions.captchaToken = captchaToken;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, resetOptions);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Se ha enviado un enlace a tu correo para restablecer tu contraseña'
      };

    } catch (error) {
      console.error('Error enviando email de recuperación:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('Invalid email')) {
        errorMessage = 'El formato del correo electrónico no es válido';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'No existe una cuenta con este correo electrónico';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar contraseña
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      
      // Verificar que hay una sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No hay una sesión activa para cambiar la contraseña');
      }
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Después de actualizar la contraseña, cerrar la sesión para que el usuario inicie sesión con la nueva contraseña
      await supabase.auth.signOut();
      
      // Limpiar estados locales
      setUser(null);
      setUserData(null);
      clearUserDataFromStorage();

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente. Inicia sesión con tu nueva contraseña.',
        user: data.user
      };

    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('Password should be at least')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.message.includes('No hay una sesión activa')) {
        errorMessage = 'La sesión ha expirado. Solicita un nuevo enlace de recuperación.';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Efecto para manejar cambios en la autenticación
  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      console.log('🚀 Iniciando getInitialSession...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📱 Sesión obtenida:', session?.user?.id || 'Sin sesión');
      
      if (session?.user) {
        // Verificar si el email está confirmado
        if (!session.user.email_confirmed_at) {
          console.log('❌ Email no confirmado, cerrando sesión');
          await supabase.auth.signOut();
          setUser(null);
          setUserData(null);
          clearUserDataFromStorage();
          setLoading(false);
          return;
        }

        setUser(session.user);
        
        // Intentar cargar datos del usuario desde localStorage
        const storedUserData = getUserDataFromStorage();
        console.log('💾 Datos del localStorage:', storedUserData);
        console.log('🔑 ID de usuario actual:', session.user.id);
        
        if (storedUserData && storedUserData.id_usuario === session.user.id) {
          console.log('✅ Datos coinciden, usando localStorage');
          setUserData(storedUserData);
        } else {
          console.log('❌ Datos no coinciden o no existen, obteniendo de DB');
          const userDataResult = await getUserData(session.user.id);
          if (!userDataResult.success) {
            console.warn('No se pudieron obtener los datos del usuario al inicializar:', userDataResult.message);
          }
        }
      } else {
        console.log('❌ Sin sesión, limpiando datos');
        setUser(null);
        setUserData(null);
        clearUserDataFromStorage();
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.id || 'Sin usuario');
        
        if (session?.user) {
          // Verificar si el email está confirmado
          if (!session.user.email_confirmed_at) {
            console.log('❌ Email no confirmado en auth change, cerrando sesión');
            await supabase.auth.signOut();
            setUser(null);
            setUserData(null);
            clearUserDataFromStorage();
            setLoading(false);
            return;
          }

          setUser(session.user);
          
          // Para evitar llamadas innecesarias a la DB, solo verificamos localStorage
          const storedUserData = getUserDataFromStorage();
          if (storedUserData && storedUserData.id_usuario === session.user.id) {
            console.log('✅ Usando datos de localStorage en auth change');
            setUserData(storedUserData);
          } else {
            console.log('🔄 Obteniendo datos de DB en auth change');
            const userDataResult = await getUserData(session.user.id);
            if (!userDataResult.success) {
              console.warn('No se pudieron obtener los datos del usuario:', userDataResult.message);
            }
          }
        } else {
          setUser(null);
          setUserData(null);
          clearUserDataFromStorage();
        }
        setLoading(false);
      }
    );

    // Limpiar suscripción
    return () => subscription?.unsubscribe();
  }, []);

  // Valor del contexto
  const value = {
    user,
    userData,
    loading,
    registerUser,
    loginUser,
    logoutUser,
    getUserData,
    updateUserData,
    resendConfirmationEmail,
    resetPasswordForEmail,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
