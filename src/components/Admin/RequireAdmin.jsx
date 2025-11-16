import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

const RequireAdmin = ({ children }) => {
  const { userData, loading } = useAuth()
  const [hasShownToast, setHasShownToast] = useState(false)

  useEffect(() => {
    // Si no está cargando y el usuario no es admin, mostrar toast una sola vez
    if (!loading && userData && userData.rol !== 'admin' && !hasShownToast) {
      toast.error('No tienes permisos para acceder a esta sección')
      setHasShownToast(true)
    }
  }, [loading, userData, hasShownToast])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0251f] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, redirigir al inicio
  if (!userData) {
    return <Navigate to="/inicio" replace />
  }

  // Si el usuario no es admin, redirigir al inicio
  if (userData.rol !== 'admin') {
    return <Navigate to="/inicio" replace />
  }

  // Si es admin, mostrar el contenido
  return children
}

export default RequireAdmin
