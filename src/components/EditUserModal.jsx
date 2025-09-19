import { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { X, User, Phone, FileText, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, userData }) => {
  const { updateUserData } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);

  // Referencias para evitar findDOMNode
  const backdropRef = useRef(null);
  const modalRef = useRef(null);

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        telefono: userData.telefono || ''
      });
    }
  }, [isOpen, userData]);

  // Controlar overflow del body
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
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    
    if (!formData.apellido.trim()) {
      toast.error('El apellido es obligatorio');
      return;
    }
    
    if (!formData.telefono.trim()) {
      toast.error('El teléfono es obligatorio');
      return;
    }

    setLoading(true);
    
    try {
      const result = await updateUserData(userData.id_usuario, formData);
      
      if (result.success) {
        toast.success('Datos actualizados correctamente');
        onClose();
      } else {
        toast.error(result.message || 'Error al actualizar los datos');
      }
    } catch (error) {
      toast.error('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <CSSTransition
            in={isOpen}
            timeout={400}
            classNames="modal-desktop"
            unmountOnExit
            nodeRef={modalRef}
          >
            <div 
              ref={modalRef}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg"
            >
              {/* Header del modal */}
              <div className="relative p-6 border-b border-gray-100">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                >
                  <X size={20} className="text-gray-500" />
                </button>
                
                <div className="text-center">
                  <h2 
                    className="text-2xl font-bold text-gray-800 mb-2"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Editar Perfil
                  </h2>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Fila 1: Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo de nombre */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="nombre" 
                      className="block text-sm font-semibold text-gray-700"
                      style={{ fontFamily: 'MusticaPro, sans-serif' }}
                    >
                      Nombre *
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
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Juan"
                        maxLength={50}
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
                      Apellido *
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
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Pérez"
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Fila 2: DNI y Correo (Solo lectura) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo de DNI - Solo lectura */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="dni" 
                      className="block text-sm font-semibold text-gray-700"
                      style={{ fontFamily: 'MusticaPro, sans-serif' }}
                    >
                      DNI (No editable)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText size={20} className="text-gray-400" />
                      </div>
                      <input
                        id="dni"
                        type="text"
                        value={userData?.dni || 'No disponible'}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Campo de correo - Solo lectura */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="correo" 
                      className="block text-sm font-semibold text-gray-700"
                      style={{ fontFamily: 'MusticaPro, sans-serif' }}
                    >
                      Correo (No editable)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={20} className="text-gray-400" />
                      </div>
                      <input
                        id="correo"
                        type="email"
                        value={userData?.correo || 'No disponible'}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Fila 3: Teléfono (columna completa) */}
                <div className="space-y-2">
                  <label 
                    htmlFor="telefono" 
                    className="block text-sm font-semibold text-gray-700"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Teléfono *
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
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f0251f] focus:ring-0 transition-colors duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="+57 300 123 4567"
                      maxLength={20}
                      required
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#f0251f] cursor-pointer hover:shadow-lg transform hover:scale-[1.02]'
                    } text-white`}
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </CSSTransition>
        </div>
      </CSSTransition>
    </>
  );
};

export default EditUserModal;
