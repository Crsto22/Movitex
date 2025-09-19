import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Inicio from './pages/Inicio'
import MovitexOne from './pages/MovitexOne'
import MovitexPro from './pages/MovitexPro'
import MovitexUltra from './pages/MovitexUltra'
import Contactos from './pages/Contactos'
import MiCuenta from './pages/MiCuenta'
import ConfirmEmail from './pages/ConfirmEmail'
import ResetPassword from './pages/ResetPassword'
import ScrollToTop from './components/ScrollToTop'
function App() {
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/MovitexOne" element={<MovitexOne />} />
          <Route path="/MovitexPro" element={<MovitexPro />} />
          <Route path="/MovitexUltra" element={<MovitexUltra />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
        
        {/* ScrollToTop disponible en todas las páginas */}
        <ScrollToTop />
        
        {/* Toaster para notificaciones */}
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 2000,
          }}
        />
      </Router>
    </AuthProvider>
  )
}

export default App
