import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AdminRedirect = () => {
  const { userData } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Si el usuario es admin y no está en la sección /admin, redirigir al dashboard
    if (userData?.rol === 'admin') {
      if (!location.pathname.startsWith('/admin')) {
        navigate('/admin/dashboard', { replace: true })
      }
    }
  }, [userData, location.pathname, navigate])

  return null
}

export default AdminRedirect
