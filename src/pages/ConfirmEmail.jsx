import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import toast from 'react-hot-toast';
import Logo from '../assets/Logo.png';

const ConfirmEmail = () => {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Obtener los parámetros de la URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        console.log('URL params:', { token, type });
        
        if (type === 'signup' && token) {
          // Verificar el token de confirmación usando verifyOtp
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          console.log('VerifyOtp result:', { data, error });

          if (error) {
            // Si hay error con verifyOtp, intentar obtener la sesión actual
            // porque es posible que ya se haya verificado
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (sessionData?.session?.user?.email_confirmed_at) {
              // El email ya está confirmado
              setConfirmed(true);
              toast.success('Tu correo ha sido verificado correctamente 🎉');
              
              setTimeout(() => {
                navigate('/inicio');
              }, 3000);
            } else {
              throw error;
            }
          } else if (data?.user) {
            // Verificación exitosa
            setConfirmed(true);
            toast.success('Tu correo ha sido verificado correctamente 🎉');
            
            setTimeout(() => {
              navigate('/inicio');
            }, 3000);
          } else {
            setError('El enlace ha expirado o no es válido.');
          }
        } else {
          // Si llegamos aquí sin token o type, verificar si ya hay sesión confirmada
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session?.user?.email_confirmed_at) {
            setConfirmed(true);
            toast.success('Tu correo ha sido verificado correctamente ');
            
            setTimeout(() => {
              navigate('/inicio');
            }, 2000);
          } else {
            setError('El enlace ha expirado o no es válido.');
          }
        }
      } catch (error) {
        console.error('Error confirmando email:', error);
        setError(error.message || 'El enlace ha expirado o no es válido.');
        toast.error('Error al confirmar el correo electrónico.');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

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

        {loading && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0251f] mx-auto mb-4"></div>
            <h2 
              className="text-xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Confirmando tu correo...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu cuenta.
            </p>
          </div>
        )}

        {confirmed && (
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 
              className="text-xl font-bold text-green-800 mb-2"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Tu correo ha sido verificado correctamente 
            </h2>
            <p className="text-gray-600 mb-4">
              Tu cuenta ha sido verificada. Ya puedes iniciar sesión.
            </p>
            <p className="text-sm text-gray-500">
              Serás redirigido automáticamente en unos segundos...
            </p>
          </div>
        )}

        {error && (
          <div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 
              className="text-xl font-bold text-red-800 mb-2"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Error de confirmación
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={() => navigate('/inicio')}
              className="w-full py-3 px-4 bg-[#f0251f] text-white rounded-xl font-bold hover:opacity-90 transition-all duration-200"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
