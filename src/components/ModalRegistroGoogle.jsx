import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Phone, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ModalRegistroGoogle = ({ isOpen, onClose }) => {
  const { completeGoogleRegistration, loading, user, userData } = useAuth();
  const [formData, setFormData] = useState({
    documento: '',
    telefono: '',
    nombre: '',
    apellido: '',
    email: '',
    foto_url: ''
  });

  // Prellenar datos desde Google cuando se abre el modal
  useEffect(() => {
    if (isOpen && user && userData) {
      // Extraer nombre y apellido del nombre completo de Google
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        documento: '',
        telefono: '',
        nombre: firstName,
        apellido: lastName,
        email: user.email || '',
        foto_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
      });
    }
  }, [isOpen, user, userData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
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

    try {
      // Llamar a la función para completar el registro de Google usando el ID del usuario autenticado
      const result = await completeGoogleRegistration(user.id, formData);
      
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
      
    } catch (error) {
      console.error('Error inesperado al completar registro:', error);
      toast.error('Ocurrió un error inesperado. Por favor intenta nuevamente.');
    }
  };

  const handleBackdropClick = (e) => {
    // Deshabilitado - el usuario debe completar el registro
    // if (e.target === e.currentTarget) {
    //   onClose();
    // }
  };

  // Función para renderizar el contenido del modal/drawer
  const renderModalContent = () => (
    <>
      {/* Header del modal */}
      <div className="relative p-4 md:p-6 border-b border-gray-100">
        <div className="text-center">
          <h2 
            className="text-xl md:text-2xl font-bold text-gray-800 mb-2"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            Completa tu registro
          </h2>
          <p className="text-sm text-gray-600">
            Solo necesitamos algunos datos adicionales para completar tu cuenta
          </p>
          <p className="text-xs text-orange-600 mt-2 font-semibold">
            * Debes completar todos los campos para continuar
          </p>
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
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText size={20} className="text-gray-400" />
              </div>
              <input
                id="documento"
                type="text"
                value={formData.documento}
                onChange={(e) => handleInputChange('documento', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none text-base"
                placeholder="12345678"
                required
              />
            </div>
          </div>

          {/* Campo de teléfono */}
          <div className="space-y-2">
            <label 
              htmlFor="telefono" 
              className="block text-sm font-semibold text-gray-700"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Teléfono <span className="text-red-500">*</span>
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
              Nombre <span className="text-red-500">*</span>
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
              Apellido <span className="text-red-500">*</span>
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

        {/* Fila 3: Correo (columna completa, readonly) */}
        <div className="space-y-2">
          <label 
            htmlFor="email" 
            className="block text-sm font-semibold text-gray-700"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            Correo Electrónico
            <span className="text-sm text-gray-500 ml-2">(desde Google)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={20} className="text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={formData.email}
              readOnly
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed text-base"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        {/* Mostrar foto de perfil si está disponible */}
        {formData.foto_url && (
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                Foto de perfil (desde Google)
              </p>
              <img 
                src={formData.foto_url} 
                alt="Foto de perfil" 
                className="w-16 h-16 rounded-full border-2 border-gray-200 mx-auto"
              />
            </div>
          </div>
        )}

        {/* Botón de completar registro */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#f0251f] cursor-pointer hover:shadow-lg transform hover:scale-[1.02]'
          } text-white`}
          style={{ fontFamily: 'MusticaPro, sans-serif' }}
        >
          {loading ? 'Completando registro...' : 'Completar registro'}
        </button>

        {/* Nota informativa */}
        <div className="text-center text-xs text-gray-500">
          <p>Al completar el registro, aceptas nuestros términos y condiciones</p>
          <p className="text-orange-600 font-semibold mt-1">
            No podrás cerrar este modal hasta completar el registro
          </p>
        </div>
      </form>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Desktop: Modal centrado */}
          <motion.div 
            className="hidden md:flex fixed inset-0 items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
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
              onClick={(e) => e.stopPropagation()}
            >
              {/* Contenido del modal para desktop */}
              {renderModalContent()}
            </motion.div>
          </motion.div>

          {/* Mobile: Drawer desde abajo */}
          <motion.div 
            className="md:hidden fixed inset-x-0 bottom-0 top-20"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring",
              duration: 0.4,
              damping: 25,
              stiffness: 300
            }}
          >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalRegistroGoogle;
