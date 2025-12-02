import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bus, 
  Route as RouteIcon, 
  Ticket,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import Logo from '../../assets/Logo.png';
import Movitex from "../../assets/Movitex.svg"
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { logoutUser, userData } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      title: 'Usuarios',
      icon: Users,
      path: '/admin/usuarios',
    },
    {
      title: 'Ciudades',
      icon: MapPin,
      path: '/admin/ciudades',
    },
    {
      title: 'Buses',
      icon: Bus,
      path: '/admin/buses',
    },
    {
      title: 'Rutas',
      icon: RouteIcon,
      path: '/admin/rutas',
    },
    {
      title: 'Viajes',
      icon: Calendar,
      path: '/admin/viajes',
    },
    {
      title: 'Reservas',
      icon: Ticket,
      path: '/admin/reservas',
    },
    {
      title: 'Reportes',
      icon: FileText,
      path: '/admin/reportes',
    }
  ];

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        toast.success('Sesión cerrada correctamente');
      }
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden hover:bg-gray-100 transition-all duration-200"
      >
        <Menu className="w-6 h-6 text-[#f0251f]" />
      </button>

      {/* Backdrop para móvil */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-50 flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="Movitex Admin" className="h-8 object-contain" />
          </div>
        )}
        {isCollapsed && (
          <div 
            className="flex justify-center w-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsCollapsed(false)}
            title="Expandir sidebar"
          >
            <img src={Movitex} alt="Movitex Admin" className="h-10 object-contain" />
          </div>
        )}
        
        {/* Botón cerrar en móvil */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <X className="w-5 h-5 text-[#f0251f]" />
        </button>

        {/* Botón colapsar en desktop */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-[#f0251f]" />
          </button>
        )}
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {/* Título Overview */}
        {!isCollapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 " style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
            Overview
          </p>
        )}
        
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-4 rounded-full transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#f0251f] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.title : ''}
                >
                  {!isCollapsed && (
                    <ChevronRight 
                      className={`w-4 h-4 transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      } mr-2`}
                    />
                  )}
                  <Icon 
                    strokeWidth={2.7} className={` transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-[#f0251f]'
                    } ${isCollapsed ? 'mx-auto' : ''}`}
                  />
                  {!isCollapsed && (
                    <span 
                      className={`ml-3 font-semibold transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-gray-700 group-hover:text-[#f0251f]'
                      }`}
                      style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                    >
                      {item.title}
                    </span>
                  )}
                  
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sección Account - Cerrar Sesión */}
      <div className="border-t border-gray-200 mt-auto">
        {/* Título Account */}
        {!isCollapsed && (
          <p className="px-7 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
            Account
          </p>
        )}
        
        {/* Información del Admin con botón de logout */}
        {userData && (
          <div className="px-4 pb-4">
            {isCollapsed ? (
              <div className="space-y-3 flex flex-col items-center">
                {/* Avatar */}
                <div 
                  className="w-10 h-10 rounded-full bg-[#f0251f] flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                  title={`${userData.nombre} ${userData.apellido}`}
                >
                  {userData.nombre?.charAt(0) || 'A'}
                </div>
                {/* Botón logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                {/* Info del usuario */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#f0251f] flex items-center justify-center text-white font-bold shadow-lg">
                    {userData.nombre?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                      {userData.nombre} {userData.apellido}
                    </p>
                    <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                      Administrador
                    </p>
                  </div>
                </div>
                {/* Botón logout al lado */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 ml-2"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Sidebar;
