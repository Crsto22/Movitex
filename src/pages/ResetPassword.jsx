import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabase';
import toast from 'react-hot-toast';
import Logo from '../assets/Logo.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Obtener parámetros de la URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        console.log('Reset password params:', { token, type });
        
        // Primero, verificar si ya hay una sesión activa
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session:', sessionData);
        
        if (sessionData?.session?.user) {
          // Ya hay una sesión activa, permitir cambio de contraseña
          console.log('Session found, allowing password reset');
          setIsValidToken(true);
          toast.success('Puedes cambiar tu contraseña.');
        } else if (type === 'recovery' && token) {
          // Intentar verificar el token
          console.log('Attempting to verify recovery token...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });

          console.log('VerifyOtp result:', { data, error });

          if (error) {
            console.error('Error verificando token:', error);
            
            // Si el error es que el token ya fue usado, verificar la sesión nuevamente
            if (error.message.includes('Token has expired') || error.message.includes('Invalid token')) {
              const { data: newSessionData } = await supabase.auth.getSession();
              if (newSessionData?.session?.user) {
                setIsValidToken(true);
                toast.success('Puedes cambiar tu contraseña.');
              } else {
                toast.error('El enlace ha expirado. Solicita uno nuevo desde el login.');
                setTimeout(() => {
                  navigate('/inicio');
                }, 3000);
              }
            } else {
              toast.error('Enlace de recuperación inválido o expirado');
              setTimeout(() => {
                navigate('/inicio');
              }, 3000);
            }
          } else if (data?.user) {
            // Token válido, usuario puede cambiar contraseña
            console.log('Token verified successfully');
            setIsValidToken(true);
            toast.success('Enlace verificado. Ahora puedes cambiar tu contraseña.');
          } else {
            toast.error('Error al verificar el enlace de recuperación');
            setTimeout(() => {
              navigate('/inicio');
            }, 3000);
          }
        } else {
          toast.error('Enlace de recuperación inválido o expirado');
          setTimeout(() => {
            navigate('/inicio');
          }, 3000);
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        toast.error('Error al verificar el enlace de recuperación');
        setTimeout(() => {
          navigate('/inicio');
        }, 3000);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!password.trim()) {
      toast.error('La contraseña es requerida');
      return;
    }
    
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await updatePassword(password);
      
      if (result.success) {
        toast.success('¡Contraseña actualizada exitosamente!');
        
        // Limpiar formulario
        setPassword('');
        setConfirmPassword('');
        
        // Mostrar mensaje adicional y redirigir
        toast.success('Por favor inicia sesión con tu nueva contraseña');
        
        // Redirigir al inicio después de 3 segundos
        setTimeout(() => {
          navigate('/inicio');
        }, 3000);
        
      } else {
        toast.error(result.message);
      }
      
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      toast.error('Ocurrió un error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <img 
              src={Logo} 
              alt="Movitex Logo" 
              className="h-16 mx-auto object-contain"
            />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0251f] mx-auto mb-4"></div>
          <h2 
            className="text-xl font-bold text-gray-800 mb-2"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            Verificando enlace...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras verificamos tu enlace de recuperación.
          </p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <img 
              src={Logo} 
              alt="Movitex Logo" 
              className="h-16 mx-auto object-contain"
            />
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 
            className="text-xl font-bold text-red-800 mb-2"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            Enlace inválido
          </h2>
          <p className="text-gray-600 mb-4">
            El enlace de recuperación ha expirado o no es válido.
          </p>
          <button
            onClick={() => navigate('/inicio')}
            className="w-full py-3 px-4 bg-[#f0251f] text-white rounded-xl font-bold hover:opacity-90 transition-all duration-200"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
        initial={{ 
          opacity: 0, 
          scale: 0.9, 
          y: 20 
        }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0 
        }}
        transition={{ 
          type: "spring",
          duration: 0.5,
          damping: 25,
          stiffness: 300
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 text-center">
          <div className="mb-4">
            <img 
              src={Logo} 
              alt="Movitex Logo" 
              className="h-12 mx-auto object-contain"
            />
          </div>
          <h2 
            className="text-2xl font-bold text-gray-800 mb-2"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            Nueva contraseña
          </h2>
          <p className="text-sm text-gray-600">
            Ingresa tu nueva contraseña para completar el restablecimiento.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campo de nueva contraseña */}
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold text-gray-700"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none"
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                ) : (
                  <Eye size={20} className="text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                )}
              </button>
            </div>
          </div>

          {/* Campo de confirmar contraseña */}
          <div className="space-y-2">
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-semibold text-gray-700"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none"
                placeholder="Confirma tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} className="text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                ) : (
                  <Eye size={20} className="text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                )}
              </button>
            </div>
          </div>

          {/* Requisitos de contraseña */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Requisitos de la contraseña:</p>
            <ul className="space-y-1">
              <li className={`flex items-center ${password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{password.length >= 6 ? '✓' : '○'}</span>
                Mínimo 6 caracteres
              </li>
              <li className={`flex items-center ${password === confirmPassword && password ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{password === confirmPassword && password ? '✓' : '○'}</span>
                Las contraseñas coinciden
              </li>
            </ul>
          </div>

          {/* Botón de actualizar */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#f0251f] cursor-pointer text-white hover:shadow-lg transform hover:scale-[1.02]'
            }`}
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>

          {/* Enlace para volver */}
          <div className="text-center text-sm text-gray-600">
            <button
              type="button"
              onClick={() => navigate('/inicio')}
              className="text-[#f0251f] cursor-pointer hover:text-[#fab926] transition-colors duration-200 font-medium"
            >
              Volver al inicio
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
