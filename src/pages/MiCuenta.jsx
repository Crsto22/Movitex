import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import User from '../assets/User.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Maletas from '../assets/icons/Maletas.png';
import EditUserModal from '../components/EditUserModal';
const MiCuenta = () => {
    const { user, userData, logoutUser, obtenerReservasCompletadas } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('mi-cuenta'); // Estado para manejar la sección activa
    const [reservas, setReservas] = useState([]);
    const [loadingReservas, setLoadingReservas] = useState(false);
    const [errorReservas, setErrorReservas] = useState(null);

    const handleLogout = async () => {
        try {
            const result = await logoutUser();
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Error al cerrar sesión');
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    // Función para cargar las reservas del usuario
    const cargarReservas = async () => {
        try {
            setLoadingReservas(true);
            setErrorReservas(null);
            
            const resultado = await obtenerReservasCompletadas();
            
            if (resultado.success) {
                setReservas(resultado.reservas);
                console.log('✅ Reservas cargadas:', resultado.reservas);
            } else {
                setErrorReservas(resultado.message);
                console.error('❌ Error al cargar reservas:', resultado.message);
            }
        } catch (error) {
            console.error('❌ Error inesperado al cargar reservas:', error);
            setErrorReservas('Error inesperado al cargar las reservas');
        } finally {
            setLoadingReservas(false);
        }
    };

    // Cargar reservas SOLO cuando se selecciona la sección "mis-viajes"
    useEffect(() => {
        if (activeSection === 'mis-viajes' && user && userData) {
            // Solo cargar si no hay reservas cargadas o si no está cargando
            if (reservas.length === 0 && !loadingReservas) {
                console.log('👤 Usuario ha ingresado a "Mis viajes", cargando reservas...');
                cargarReservas();
            }
        } else if (activeSection !== 'mis-viajes' && reservas.length > 0) {
            // Limpiar reservas cuando sale de la sección para forzar recarga fresca la próxima vez
            console.log('👋 Usuario salió de "Mis viajes", limpiando cache de reservas');
            setReservas([]);
            setErrorReservas(null);
        }
    }, [activeSection, user, userData]);

    // Función para renderizar el contenido según la sección activa
    const renderContent = () => {
        switch (activeSection) {
            case 'mi-cuenta':
                return (
                    <>
                        {/* Título principal */}
                        <h2
                            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2"
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            Mi cuenta
                        </h2>

                        {/* Subtítulo descriptivo */}
                        <p
                            className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg"
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            Tus viajes, gastos, estadísticas y más.
                        </p>

                        {/* Card cuadrado */}
                        <div className="inline-block">
                            <button
                                onClick={() => setActiveSection('mis-viajes')}
                                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gray-200 rounded-2xl sm:rounded-3xl lg:rounded-4xl shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                            >
                                {/* Icono de maleta */}
                                <img src={Maletas} alt="Maletas" className="w-12 sm:w-16 lg:w-24 mb-2 sm:mb-3 lg:mb-4" />

                                {/* Texto */}
                                <span
                                    className="text-[#f0251f] font-bold text-sm sm:text-base lg:text-lg"
                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                >
                                    Mis viajes
                                </span>
                            </button>
                        </div>
                    </>
                );
            case 'mis-viajes':
                return (
                    <>
                        {/* Título principal */}
                        <h2
                            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2"
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            Mis viajes
                        </h2>

                        {/* Subtítulo descriptivo */}
                        <p
                            className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg"
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            Historial de todos tus viajes realizados.
                        </p>

                        {/* Estado de carga */}
                        {loadingReservas && (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full border-4 border-gray-300 border-t-[#f0251f] w-8 h-8 mb-4"></div>
                                <p
                                    className="text-gray-600"
                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                >
                                    Cargando tus viajes...
                                </p>
                            </div>
                        )}

                        {/* Error al cargar */}
                        {errorReservas && !loadingReservas && (
                            <div className="text-center py-8">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                    <p style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                                        {errorReservas}
                                    </p>
                                </div>
                                <button
                                    onClick={cargarReservas}
                                    className="bg-[#f0251f] text-white px-4 py-2 rounded-lg hover:bg-[#d91f1a] transition-colors"
                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        )}

                        {/* Lista de reservas */}
                        {!loadingReservas && !errorReservas && (
                            <>
                                {reservas.length === 0 ? (
                                    /* Mensaje cuando no hay viajes */
                                    <div className="text-center py-8 sm:py-12 lg:py-16">
                                        {/* Mensaje principal */}
                                        <h3
                                            className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-3 sm:mb-4"
                                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                        >
                                            No hay viajes aún
                                        </h3>

                                        {/* Mensaje descriptivo */}
                                        <p
                                            className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4"
                                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                        >
                                            Cuando realices tu primer viaje con Movitex, aparecerá aquí tu historial completo.
                                        </p>
                                    </div>
                                ) : (
                                    /* Lista de reservas */
                                    <div className="space-y-4">
                                        {reservas.map((reserva, index) => (
                                                <div key={reserva.idReserva} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                                    {/* Header de la tarjeta */}
                                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-[#f0251f] rounded-full flex items-center justify-center text-white font-bold">
                                                                    {index + 1}
                                                                </div>
                                                                <div>
                                                                    <h3 
                                                                        className="font-bold text-gray-800 text-lg"
                                                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                    >
                                                                        {reserva.origen} → {reserva.destino}
                                                                    </h3>
                                                                    <p 
                                                                        className="text-sm text-gray-600"
                                                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                    >
                                                                        {reserva.fechaViajeFormateada}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 sm:mt-0 text-right">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Completado
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Contenido de la tarjeta */}
                                                    <div className="p-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            {/* Fecha y hora */}
                                                            <div className="space-y-1">
                                                                <p 
                                                                    className="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                >
                                                                    Fecha y Hora
                                                                </p>
                                                                <p 
                                                                    className="text-sm font-semibold text-gray-800"
                                                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                >
                                                                    {reserva.horaSalidaFormateada}
                                                                </p>
                                                            </div>

                                                            {/* Servicio */}
                                                            <div className="space-y-1">
                                                                <p 
                                                                    className="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                >
                                                                    Servicio
                                                                </p>
                                                                <p 
                                                                    className="text-sm font-semibold text-[#f0251f]"
                                                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                >
                                                                    {reserva.tipoServicioFormateado}
                                                                </p>
                                                            </div>

                                                            {/* Pasajeros */}
                                                            <div className="space-y-1">
                                                                <p 
                                                                    className="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                >
                                                                    Pasajeros
                                                                </p>
                                                                <p 
                                                                    className="text-sm font-semibold text-gray-800"
                                                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                >
                                                                    {reserva.totalPasajeros} {reserva.totalPasajeros === 1 ? 'persona' : 'personas'}
                                                                </p>
                                                            </div>

                                                            {/* Total pagado */}
                                                            <div className="space-y-1">
                                                                <p 
                                                                    className="text-xs font-medium text-gray-500 uppercase tracking-wide"
                                                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                >
                                                                    Total Pagado
                                                                </p>
                                                                <p 
                                                                    className="text-lg font-bold text-green-600"
                                                                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                >
                                                                    S/. {reserva.totalPagado.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Footer con fecha de reserva */}
                                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                                                                        Reservado el {reserva.fechaReservaFormateada}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2 sm:mt-0">
                                                                    <span 
                                                                        className="text-xs text-gray-500 font-mono"
                                                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                                                    >
                                                                        ID: {reserva.idReserva.slice(0, 8)}...
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                );
            case 'promociones':
                return (
                    <>
                        {/* Título principal */}
                        <h2
                            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2"
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            Promociones
                        </h2>

                        {/* Subtítulo descriptivo */}
                        <p
                            className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg"
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            Ofertas especiales y descuentos exclusivos.
                        </p>

                        {/* Contenido de promociones */}
                        <div className="text-center py-8 sm:py-12 lg:py-16">
                            {/* Mensaje principal */}
                            <h3
                                className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-3 sm:mb-4"
                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                            >
                                Muy pronto habrá promociones
                            </h3>

                            {/* Mensaje descriptivo */}
                            <p
                                className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4"
                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                            >
                                Estamos preparando ofertas especiales y descuentos exclusivos para nuestros usuarios. ¡Mantente atento!
                            </p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-16 px-4">
                    <div className="text-center max-w-md mx-auto">
                        <h2 
                            className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4" 
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            Debes iniciar sesión para ver tu cuenta
                        </h2>
                        <p 
                            className="text-sm sm:text-base text-gray-600" 
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            Por favor, inicia sesión para acceder a tu perfil
                        </p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Banner panorámico con imagen de fondo */}
                <div
                    className="relative w-full h-48 sm:h-64 lg:h-80 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1531968455001-5c5272a41129?fm=jpg')`
                    }}
                >
                    {/* Texto de bienvenida */}
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <h1
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white text-center drop-shadow-lg"
                            style={{ fontFamily: 'MusticaPro, sans-serif' }}
                        >
                            ¡Hola {userData?.nombre || 'Usuario'}!
                        </h1>
                    </div>
                </div>

                {/* Contenedor principal */}
                <div className="relative -mt-16 sm:-mt-24 lg:-mt-32 px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Tarjeta de perfil flotante */}
                        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 relative">
                            {/* Iconos de acción en la parte superior derecha */}
                            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex space-x-2 sm:space-x-3">
                                {/* Icono de editar */}
                                <button
                                    onClick={handleEdit}
                                    className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                                    title="Editar perfil"
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                </button>

                                {/* Icono de cerrar sesión */}
                                <button
                                    onClick={handleLogout}
                                    className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                                    title="Cerrar sesión"
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Contenido principal de la tarjeta */}
                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                                {/* Foto de perfil circular */}
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full">
                                        <div className="w-full h-full rounded-full bg-[#f0251f] flex items-center justify-center">
                                            {userData?.foto_url ? (
                                                <img
                                                    src={userData.foto_url}
                                                    alt="Foto de perfil"
                                                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={User}
                                                    alt="Usuario"
                                                    className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Datos del usuario */}
                                <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left">
                                    {/* Nombre completo */}
                                    <h2
                                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800"
                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                    >
                                        {userData ? `${userData.nombre} ${userData.apellido}` : user.email}
                                    </h2>

                                    {/* Grid de información */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {/* Documento */}
                                        <div className="space-y-1">
                                            <p
                                                className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide"
                                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                            >
                                                Documento (DNI)
                                            </p>
                                            <p
                                                className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800"
                                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                            >
                                                {userData?.dni || 'No disponible'}
                                            </p>
                                        </div>

                                        {/* Correo electrónico */}
                                        <div className="space-y-1">
                                            <p
                                                className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide"
                                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                            >
                                                Correo Electrónico
                                            </p>
                                            <p
                                                className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 truncate"
                                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                            >
                                                {userData?.correo || user.email}
                                            </p>
                                        </div>

                                        {/* Teléfono */}
                                        <div className="space-y-1">
                                            <p
                                                className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide"
                                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                            >
                                                Teléfono
                                            </p>
                                            <p
                                                className="text-sm sm:text-base lg:text-lg font-semibold text-blue-600"
                                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                            >
                                                {userData?.telefono || 'No disponible'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fecha de registro */}
                                    {userData?.fecha_creacion && (
                                        <div className="pt-3 sm:pt-4 border-t border-gray-200">
                                            <p
                                                className="text-xs sm:text-sm text-gray-500"
                                                style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                            >
                                                Miembro desde: {new Date(userData.fecha_creacion).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="-mt-4 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden mx-4 mb-6">
                    {/* Navegación en pestañas (móvil) y sidebar (desktop) */}
                    <div className="flex flex-col lg:flex-row min-h-[700px]">
                        {/* Pestañas horizontales para móvil */}
                        <div className="lg:hidden border-b border-gray-200">
                            <div className="flex overflow-x-auto scrollbar-hide">
                                {/* Pestaña Mi cuenta */}
                                <button 
                                    onClick={() => setActiveSection('mi-cuenta')}
                                    className={`flex-shrink-0 px-4 py-3 flex flex-col items-center justify-center min-w-[100px] transition-colors duration-200 ${
                                        activeSection === 'mi-cuenta' 
                                            ? 'bg-[#f0251f] text-white border-b-2 border-[#f0251f]' 
                                            : 'bg-white text-gray-600 hover:bg-red-50'
                                    }`}
                                >
                                    <svg
                                        className="w-5 h-5 mb-1"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                                    </svg>
                                    <span
                                        className="font-semibold text-xs"
                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                    >
                                        Mi cuenta
                                    </span>
                                </button>

                                {/* Pestaña Mis viajes */}
                                <button 
                                    onClick={() => setActiveSection('mis-viajes')}
                                    className={`flex-shrink-0 px-4 py-3 flex flex-col items-center justify-center min-w-[100px] transition-colors duration-200 ${
                                        activeSection === 'mis-viajes' 
                                            ? 'bg-[#f0251f] text-white border-b-2 border-[#f0251f]' 
                                            : 'bg-white text-gray-600 hover:bg-red-50'
                                    }`}
                                >
                                    <svg
                                        className="w-5 h-5 mb-1"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20,8h-3V4H3C1.89,4 1,4.89 1,6v12c0,1.11 0.89,2 2,2h16c1.11,0 2,-0.89 2,-2V10C21,8.89 20.11,8 20,8z M20,18H3V6h12v4h5V18z" />
                                    </svg>
                                    <span
                                        className="font-semibold text-xs"
                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                    >
                                        Mis viajes
                                    </span>
                                </button>

                                {/* Pestaña Promociones */}
                                <button 
                                    onClick={() => setActiveSection('promociones')}
                                    className={`flex-shrink-0 px-4 py-3 flex flex-col items-center justify-center min-w-[100px] transition-colors duration-200 ${
                                        activeSection === 'promociones' 
                                            ? 'bg-[#f0251f] text-white border-b-2 border-[#f0251f]' 
                                            : 'bg-white text-gray-600 hover:bg-red-50'
                                    }`}
                                >
                                    <svg
                                        className="w-5 h-5 mb-1"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                                    </svg>
                                    <span
                                        className="font-semibold text-xs"
                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                    >
                                        Promociones
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Barra lateral para desktop */}
                        <div className="hidden lg:flex w-64 bg-white flex-col">
                            {/* Navegación */}
                            <div className="flex flex-col h-full">
                                {/* Botón Mi cuenta */}
                                <button 
                                    onClick={() => setActiveSection('mi-cuenta')}
                                    className={`flex-1 w-full flex items-center justify-start px-6 transition-colors duration-200 ${
                                        activeSection === 'mi-cuenta' 
                                            ? 'bg-[#f0251f] text-white' 
                                            : 'bg-white text-gray-600 hover:bg-red-100'
                                    }`}
                                >
                                    <svg
                                        className="w-7 h-7 mr-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                                    </svg>
                                    <span
                                        className="font-semibold text-lg"
                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                    >
                                        Mi cuenta
                                    </span>
                                </button>

                                {/* Botón Mis viajes */}
                                <button 
                                    onClick={() => setActiveSection('mis-viajes')}
                                    className={`flex-1 w-full flex items-center justify-start px-6 transition-colors duration-200 ${
                                        activeSection === 'mis-viajes' 
                                            ? 'bg-[#f0251f] text-white' 
                                            : 'bg-white text-gray-600 hover:bg-red-100'
                                    }`}
                                >
                                    <svg
                                        className="w-7 h-7 mr-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20,8h-3V4H3C1.89,4 1,4.89 1,6v12c0,1.11 0.89,2 2,2h16c1.11,0 2,-0.89 2,-2V10C21,8.89 20.11,8 20,8z M20,18H3V6h12v4h5V18z" />
                                    </svg>
                                    <span
                                        className="font-semibold text-lg"
                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                    >
                                        Mis viajes
                                    </span>
                                </button>

                                {/* Botón Promociones */}
                                <button 
                                    onClick={() => setActiveSection('promociones')}
                                    className={`flex-1 w-full flex items-center justify-start px-6 transition-colors duration-200 ${
                                        activeSection === 'promociones' 
                                            ? 'bg-[#f0251f] text-white' 
                                            : 'bg-white text-gray-600 hover:bg-red-100'
                                    }`}
                                >
                                    <svg
                                        className="w-7 h-7 mr-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                                    </svg>
                                    <span
                                        className="font-semibold text-lg"
                                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                                    >
                                        Promociones
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Sección de contenido */}
                        <div className="flex-1 p-4 sm:p-6 overflow-auto max-h-[650px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            
            {/* Modal de edición */}
            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                userData={userData}
            />
        </>
    );
};

export default MiCuenta;