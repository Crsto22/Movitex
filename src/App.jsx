import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CiudadesProvider } from "./context/CiudadesContext";
import { ViajesProvider } from "./context/ViajesContext";
import { AsientosProvider } from "./context/AsientosContext";
import { ReservaProvider } from "./context/ReservaContext";
import { DashboardProvider } from "./context/Admin/DashboardContext";
import { UsuariosProvider } from "./context/Admin/UsuariosContext";
import { CiudadesAdminProvider } from "./context/Admin/CiudadesAdminContext";
import { RutasProvider } from "./context/Admin/RutasContext";
import { BusesProvider } from "./context/Admin/BusesContext";
import { ViajesProvider as ViajesAdminProvider } from "./context/Admin/ViajesContext";
import { ReservasAdminProvider } from "./context/Admin/ReservasContext";
import Inicio from "./pages/Inicio";
import MovitexOne from "./pages/MovitexOne";
import MovitexPro from "./pages/MovitexPro";
import MovitexUltra from "./pages/MovitexUltra";
import Contactos from "./pages/Contactos";
import MiCuenta from "./pages/MiCuenta";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import ScrollToTop from "./components/ScrollToTop";
import PasajesBus from "./pages/Pasajes-bus";
import Reserva from "./pages/Reserva";
import Confirmacion from "./pages/Confirmacion";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Usuarios from "./pages/Admin/Usuarios";
import Ciudades from "./pages/Admin/Ciudades";
import Buses from "./pages/Admin/Buses";
import Rutas from "./pages/Admin/Rutas";
import Viajes from "./pages/Admin/Viajes";
import Reservas from "./pages/Admin/Reservas";
import AdminRedirect from "./components/Admin/AdminRedirect";
import RequireAdmin from "./components/Admin/RequireAdmin";
function App() {
  return (
    <AuthProvider>
      <CiudadesProvider>
        <ViajesProvider>
          <AsientosProvider>
            <Router>
              {/* Comprueba si el usuario es admin y redirige automáticamente al dashboard */}
              <AdminRedirect />

              <Routes>
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/MovitexOne" element={<MovitexOne />} />
                <Route path="/MovitexPro" element={<MovitexPro />} />
                <Route path="/MovitexUltra" element={<MovitexUltra />} />
                <Route path="/contactos" element={<Contactos />} />
                <Route path="/mi-cuenta" element={<MiCuenta />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/pasajes-bus" element={<PasajesBus />} />
                <Route
                  path="/pasajes-bus/:origen/:destino"
                  element={<PasajesBus />}
                />
                <Route path="/pasajes-bus/reserva" element={
                  <ReservaProvider>
                    <Reserva />
                  </ReservaProvider>
                } />
                <Route path="/pasajes-bus/confirmacion/:id" element={
                  <ReservaProvider>
                    <Confirmacion />
                  </ReservaProvider>
                } />
                {/* Rutas Admin - Solo accesibles para usuarios con rol admin */}
                <Route path="/admin" element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }>
                  <Route path="dashboard" element={
                    <DashboardProvider>
                      <Dashboard />
                    </DashboardProvider>
                  } />
                  <Route path="usuarios" element={
                    <UsuariosProvider>
                      <Usuarios />
                    </UsuariosProvider>
                  } />
                  <Route path="ciudades" element={
                    <CiudadesAdminProvider>
                      <Ciudades />
                    </CiudadesAdminProvider>
                  } />
                  <Route path="buses" element={
                    <BusesProvider>
                      <Buses />
                    </BusesProvider>
                  } />
                  <Route path="rutas" element={
                    <RutasProvider>
                      <Rutas />
                    </RutasProvider>
                  } />
                  <Route path="viajes" element={
                    <ViajesAdminProvider>
                      <Viajes />
                    </ViajesAdminProvider>
                  } />
                  <Route path="reservas" element={
                    <ReservasAdminProvider>
                      <Reservas />
                    </ReservasAdminProvider>
                  } />
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                </Route>
                <Route path="/" element={<Navigate to="/inicio" replace />} />
                <Route path="*" element={<Navigate to="/inicio" replace />} />
              </Routes>

              {/* ScrollToTop disponible en todas las páginas */}
              <ScrollToTop />

              {/* Toaster para notificaciones */}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 2000,
                }}
              />
            </Router>
          </AsientosProvider>
        </ViajesProvider>
      </CiudadesProvider>
    </AuthProvider>
  );
}

export default App;
