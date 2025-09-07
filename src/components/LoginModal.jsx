import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Movitex from "../assets/Movitex.svg";

const LoginModal = ({ isOpen, onClose, onOpenRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState();
  const [resetCaptchaToken, setResetCaptchaToken] = useState();
  const [loginTurnstileKey, setLoginTurnstileKey] = useState(0);
  const [resetTurnstileKey, setResetTurnstileKey] = useState(0);
  const { loginUser, resendConfirmationEmail, resetPasswordForEmail } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Resetear tokens de captcha cuando se abre el modal
      setCaptchaToken(undefined);
      setResetCaptchaToken(undefined);
      // Incrementar keys para forzar recreación de Turnstile
      setLoginTurnstileKey(prev => prev + 1);
      setResetTurnstileKey(prev => prev + 1);
    } else {
      document.body.style.overflow = 'unset';
      // Limpiar estados cuando se cierra el modal
      setCaptchaToken(undefined);
      setResetCaptchaToken(undefined);
      setShowResendButton(false);
      setShowForgotPassword(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!captchaToken) {
      toast.error('Por favor completa la verificación de seguridad');
      return;
    }

    setIsLoading(true);
    setShowResendButton(false);
    
    try {
      const result = await loginUser(email, password, captchaToken);
      
      if (result.success) {
        toast.success(result.message);
        // Limpiar formulario
        setEmail('');
        setPassword('');
        setCaptchaToken(undefined);
        // Cerrar modal
        onClose();
      } else {
        toast.error(result.message);
        // Mostrar botón de reenvío si el error es de email no confirmado
        if (result.message.includes('confirmar tu correo')) {
          setShowResendButton(true);
        }
        // Resetear captcha después de error para permitir nuevo intento
        setCaptchaToken(undefined);
        setLoginTurnstileKey(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Error inesperado al iniciar sesión');
      // Resetear captcha después de error
      setCaptchaToken(undefined);
      setLoginTurnstileKey(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await resendConfirmationEmail(email);
      
      if (result.success) {
        toast.success(result.message);
        setShowResendButton(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al reenviar el correo de confirmación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!resetCaptchaToken) {
      toast.error('Por favor completa la verificación de seguridad');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await resetPasswordForEmail(resetEmail, resetCaptchaToken);
      
      if (result.success) {
        toast.success(result.message);
        setShowForgotPassword(false);
        setResetEmail('');
        setResetCaptchaToken(undefined);
      } else {
        toast.error(result.message);
        // Resetear captcha después de error para permitir nuevo intento
        setResetCaptchaToken(undefined);
        setResetTurnstileKey(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Error al enviar el correo de recuperación');
      // Resetear captcha después de error
      setResetCaptchaToken(undefined);
      setResetTurnstileKey(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail(email); // Pre-llenar con el email del formulario principal
    // Resetear tokens al cambiar de vista
    setCaptchaToken(undefined);
    setResetCaptchaToken(undefined);
    // Incrementar keys para forzar recreación
    setLoginTurnstileKey(prev => prev + 1);
    setResetTurnstileKey(prev => prev + 1);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    // Resetear tokens al cambiar de vista
    setCaptchaToken(undefined);
    setResetCaptchaToken(undefined);
    // Incrementar keys para forzar recreación
    setLoginTurnstileKey(prev => prev + 1);
    setResetTurnstileKey(prev => prev + 1);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 50 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 50 
            }}
            transition={{ 
              type: "spring",
              duration: 0.4,
              damping: 25,
              stiffness: 300
            }}
          >
            {/* Header del modal */}
            <div className="relative p-6 border-b border-gray-100">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
              
              <div className="text-center">
                <h2 
                  className="text-2xl font-bold text-gray-800 mb-2"
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                 Inicia tu sesión de compra
                </h2>
              </div>
            </div>

            {/* Formulario */}
            {!showForgotPassword ? (
              // Formulario de login
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Campo de email */}
                <div className="space-y-2">
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-semibold text-gray-700"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Campo de contraseña */}
                <div className="space-y-2">
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-semibold text-gray-700"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Contraseña
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
                      placeholder="••••••••"
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

                {/* Recordar sesión y olvidé contraseña */}
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleShowForgotPassword}
                    className="text-[#f0251f] cursor-pointer hover:text-[#fab926] transition-colors duration-200 font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center">
                  <Turnstile
                    key={`login-turnstile-${loginTurnstileKey}`}
                    siteKey="0x4AAAAAAByq8u6lh8h9iU0D"
                    onSuccess={(token) => {
                      setCaptchaToken(token);
                    }}
                    onError={() => {
                      setCaptchaToken(undefined);
                      toast.error('Error en la verificación de seguridad');
                    }}
                    onExpire={() => {
                      setCaptchaToken(undefined);
                      toast.error('La verificación de seguridad ha expirado');
                    }}
                  />
                </div>

                {/* Botón de iniciar sesión */}
                <button
                  type="submit"
                  disabled={isLoading || !captchaToken}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    isLoading || !captchaToken
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#f0251f] cursor-pointer text-white hover:shadow-lg transform hover:scale-[1.02]'
                  }`}
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                {/* Botón de reenvío de confirmación */}
                {showResendButton && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isLoading 
                        ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                    }`}
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    {isLoading ? 'Reenviando...' : 'Reenviar correo de confirmación'}
                  </button>
                )}

                {/* Enlace de registro */}
                <div className="text-center text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="text-[#f0251f] cursor-pointer hover:text-[#fab926] transition-colors duration-200 font-medium"
                  >
                    Regístrate aquí
                  </button>
                </div>
              </form>
            ) : (
              // Formulario de recuperación de contraseña
              <form onSubmit={handleForgotPassword} className="p-6 space-y-6">
                <div className="text-center mb-4">
                  <h3 
                    className="text-lg font-bold text-gray-800 mb-2"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Recuperar contraseña
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                </div>

                {/* Campo de email para recuperación */}
                <div className="space-y-2">
                  <label 
                    htmlFor="resetEmail" 
                    className="block text-sm font-semibold text-gray-700"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Cloudflare Turnstile para recuperación */}
                <div className="flex justify-center">
                  <Turnstile
                    key={`reset-turnstile-${resetTurnstileKey}`}
                    siteKey="0x4AAAAAAByq8u6lh8h9iU0D"
                    onSuccess={(token) => {
                      setResetCaptchaToken(token);
                    }}
                    onError={() => {
                      setResetCaptchaToken(undefined);
                      toast.error('Error en la verificación de seguridad');
                    }}
                    onExpire={() => {
                      setResetCaptchaToken(undefined);
                      toast.error('La verificación de seguridad ha expirado');
                    }}
                  />
                </div>

                {/* Botón de enviar */}
                <button
                  type="submit"
                  disabled={isLoading || !resetCaptchaToken}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    isLoading || !resetCaptchaToken
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#f0251f] cursor-pointer text-white hover:shadow-lg transform hover:scale-[1.02]'
                  }`}
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>

                {/* Botón para volver al login */}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                  Volver al inicio de sesión
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;