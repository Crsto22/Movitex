import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Inicio from './pages/Inicio'
import MovitexOne from './pages/MovitexOne'
import MovitexPro from './pages/MovitexPro'
import MovitexUltra from './pages/MovitexUltra'
import Contactos from './pages/Contactos'
function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/MovitexOne" element={<MovitexOne />} />
        <Route path="/MovitexPro" element={<MovitexPro />} />
        <Route path="/MovitexUltra" element={<MovitexUltra />} />
        <Route path="/contactos" element={<Contactos />} />
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </Router>
  )
}

export default App
