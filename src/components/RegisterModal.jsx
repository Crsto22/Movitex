import { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, FileText, Search, Calendar, Users } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../context/AuthContext';
import { getDNIData, validateDNI } from '../services/dniService';
import toast from 'react-hot-toast';

const RegisterModal = ({ isOpen, onClose, onBackToLogin }) => {
  const { registerUser, loading } = useAuth();
  const [formData, setFormData] = useState({
    documento: '',
    telefono: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    fecha_nacimiento: '',
    genero: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState();
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [searchingDNI, setSearchingDNI] = useState(false);

  // Referencias para evitar findDOMNode
  const backdropRef = useRef(null);
  const desktopModalRef = useRef(null);
  const mobileModalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Resetear token de captcha cuando se abre el modal
      setCaptchaToken(undefined);
      // Incrementar key para forzar recreación de Turnstile
      setTurnstileKey(prev => prev + 1);
    } else {
      document.body.style.overflow = 'unset';
      // Limpiar token cuando se cierra el modal
      setCaptchaToken(undefined);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para buscar DNI usando el servicio
  const searchDNI = async () => {
    const dni = formData.documento.trim();
    
    // Validar DNI usando el servicio
    if (!validateDNI(dni)) {
      toast.error('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    setSearchingDNI(true);
    
    try {
      const result = await getDNIData(dni);

      if (result.success) {
        // Autocompletar nombre y apellidos
        setFormData(prev => ({
          ...prev,
          nombre: result.data.nombre,
          apellido: result.data.apellido
        }));
        
        toast.success('Datos encontrados y completados automáticamente');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error inesperado al consultar DNI:', error);
      toast.error('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setSearchingDNI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.documento.trim()) {
      toast.error('El número de documento es requerido');
      return;
    }
    
    if (!formData.telefono.trim()) {
      toast.error('El número de teléfono es requerido');
      return;
    }
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.apellido.trim()) {
      toast.error('El apellido es requerido');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('El correo electrónico es requerido');
      return;
    }
    
    if (!formData.password.trim()) {
      toast.error('La contraseña es requerida');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!captchaToken) {
      toast.error('Por favor completa la verificación de seguridad');
      return;
    }

    try {
      // Llamar a la función de registro con el captcha token
      const result = await registerUser(formData, captchaToken);
      
      if (result.success) {
        // Mostrar toast de éxito
        toast.success(result.message);
        
        // Limpiar formulario
        setFormData({
          documento: '',
          telefono: '',
          nombre: '',
          apellido: '',
          email: '',
          password: ''
        });
        setCaptchaToken(undefined);
        
        // Cerrar modal de registro y abrir modal de login
        onClose();
        onBackToLogin();
        
      } else {
        // Mostrar toast de error
        toast.error(result.message);
        // Resetear captcha después de error para permitir nuevo intento
        setCaptchaToken(undefined);
        setTurnstileKey(prev => prev + 1);
      }
      
    } catch (error) {
      console.error('Error inesperado en el registro:', error);
      toast.error('Ocurrió un error inesperado. Por favor intenta nuevamente.');
      // Resetear captcha después de error
      setCaptchaToken(undefined);
      setTurnstileKey(prev => prev + 1);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Función para renderizar el contenido del modal/drawer
  const renderModalContent = () => (
    <>
      {/* Header del modal */}
      <div className="relative p-4 md:p-6 border-b border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 md:block hidden"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
        <div className="text-center">
          <h2 
            className="text-xl md:text-2xl font-bold text-gray-800 mb-2"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            Crear una cuenta
          </h2>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Fila 1: Número de documento y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo de documento */}
         <div className="space-y-2">
  <label 
    htmlFor="documento" 
    className="block text-sm font-semibold text-gray-700"
    style={{ fontFamily: 'MusticaPro, sans-serif' }}
  >
    Número de Documento
  </label>
  <div className="relative flex">
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FileText size={20} className="text-gray-400" />
      </div>
      <input
        id="documento"
        type="text"
        value={formData.documento}
        onChange={(e) => handleInputChange('documento', e.target.value)}
        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-l-xl border-r-0 focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base focus:z-10"
        placeholder="12345678"
        maxLength="8"
        required
      />
    </div>
    <button
      type="button"
      onClick={searchDNI}
      disabled={searchingDNI || !validateDNI(formData.documento)}
      className={`px-4 py-3 rounded-r-xl border-2 border-l-0 transition-all duration-200 ${
        searchingDNI || !validateDNI(formData.documento)
          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'border-[#f0251f] bg-[#f0251f] text-white hover:bg-[#d11d19] hover:shadow-md'
      }`}
      title="Buscar datos por DNI"
    >
      {searchingDNI ? (
        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
      ) : (
        <Search size={20} />
      )}
    </button>
  </div>
</div>

          {/* Campo de teléfono */}
          <div className="space-y-2">
            <label 
              htmlFor="telefono" 
              className="block text-sm font-semibold text-gray-700"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={20} className="text-gray-400" />
              </div>
              <input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base"
                placeholder="+57 300 123 4567"
                required
              />
            </div>
          </div>
        </div>

        {/* Fila 2: Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo de nombre */}
          <div className="space-y-2">
            <label 
              htmlFor="nombre" 
              className="block text-sm font-semibold text-gray-700"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Nombre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base"
                placeholder="Juan"
                required
              />
            </div>
          </div>

          {/* Campo de apellido */}
          <div className="space-y-2">
            <label 
              htmlFor="apellido" 
              className="block text-sm font-semibold text-gray-700"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Apellido
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                id="apellido"
                type="text"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base"
                placeholder="Pérez"
                required
              />
            </div>
          </div>
        </div>

        {/* Fila 3: Correo (columna completa) */}
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
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        {/* Fila 4: Contraseña (columna completa) */}
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
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base"
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

        {/* Fila 5: Fecha de nacimiento y Género */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo de fecha de nacimiento */}
          <div className="space-y-2">
            <label 
              htmlFor="fecha_nacimiento" 
              className="block text-sm font-semibold text-gray-700"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Fecha de Nacimiento
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={20} className="text-gray-400" />
              </div>
              <input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base"
              />
            </div>
          </div>

          {/* Campo de género */}
          <div className="space-y-2">
            <label 
              htmlFor="genero" 
              className="block text-sm font-semibold text-gray-700"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Género
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users size={20} className="text-gray-400" />
              </div>
              <select
                id="genero"
                value={formData.genero}
                onChange={(e) => handleInputChange('genero', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base appearance-none bg-white"
              >
                <option value="">Seleccionar género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cloudflare Turnstile */}
        <div className="flex justify-center">
          <Turnstile
            key={`register-turnstile-${turnstileKey}`}
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

        {/* Botón de registrar */}
        <button
          type="submit"
          disabled={loading || !captchaToken}
          className={`w-full py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 ${
            loading || !captchaToken
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#f0251f] cursor-pointer hover:shadow-lg transform hover:scale-[1.02]'
          } text-white`}
          style={{ fontFamily: 'MusticaPro, sans-serif' }}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>

        {/* Enlace para volver al login */}
        <div className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-[#f0251f] cursor-pointer hover:text-[#fab926] transition-colors duration-200 font-medium"
          >
            Inicia sesión aquí
          </button>
        </div>
      </form>
    </>
  );

  return (
    <>
      {/* Estilos CSS para las animaciones */}
      <style jsx>{`
        /* Backdrop transitions */
        .modal-backdrop-enter {
          opacity: 0;
        }
        .modal-backdrop-enter-active {
          opacity: 1;
          transition: opacity 300ms ease-out;
        }
        .modal-backdrop-exit {
          opacity: 1;
        }
        .modal-backdrop-exit-active {
          opacity: 0;
          transition: opacity 300ms ease-out;
        }

        /* Desktop modal transitions */
        .modal-desktop-enter {
          opacity: 0;
          transform: scale(0.8) translateY(50px);
        }
        .modal-desktop-enter-active {
          opacity: 1;
          transform: scale(1) translateY(0);
          transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-desktop-exit {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        .modal-desktop-exit-active {
          opacity: 0;
          transform: scale(0.8) translateY(50px);
          transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Mobile drawer transitions */
        .modal-mobile-enter {
          transform: translateY(100%);
        }
        .modal-mobile-enter-active {
          transform: translateY(0);
          transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-mobile-exit {
          transform: translateY(0);
        }
        .modal-mobile-exit-active {
          transform: translateY(100%);
          transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
      
      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="modal-backdrop"
        unmountOnExit
        nodeRef={backdropRef}
      >
        <div 
          ref={backdropRef}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          {/* Desktop: Modal centrado */}
          <div 
            className="hidden md:flex fixed inset-0 items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            <CSSTransition
              in={isOpen}
              timeout={400}
              classNames="modal-desktop"
              unmountOnExit
              nodeRef={desktopModalRef}
            >
              <div 
                ref={desktopModalRef}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Contenido del modal para desktop */}
                {renderModalContent()}
              </div>
            </CSSTransition>
          </div>

          {/* Mobile: Drawer desde abajo */}
          <CSSTransition
            in={isOpen}
            timeout={400}
            classNames="modal-mobile"
            unmountOnExit
            nodeRef={mobileModalRef}
          >
            <div ref={mobileModalRef} className="md:hidden fixed inset-x-0 bottom-0 top-20">
              <div className="bg-white rounded-t-3xl shadow-2xl h-full flex flex-col">
                {/* Handle para indicar que es draggable */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                </div>
                
                {/* Contenido del drawer para mobile */}
                <div className="flex-1 overflow-y-auto">
                  {renderModalContent()}
                </div>
              </div>
            </div>
          </CSSTransition>
        </div>
      </CSSTransition>
    </>
  );
};

export default RegisterModal;
