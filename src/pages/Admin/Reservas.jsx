import { useState, useEffect } from 'react'
import { Search, Eye, Download, Filter, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react'
import { useReservasAdmin } from '../../context/Admin/ReservasContext'
import Lottie from 'lottie-react'
import BusLoadingAnimation from '../../lottiefiles/BusLoading.json'

// Importar imágenes de servicios
import FontMovitexOne from '../../assets/services/MovitexOne/MovitexOne-Font.png'
import FontMovitexPro from '../../assets/services/MovitexPro/MovitexPro-Font.png'
import FontMovitexUltra from '../../assets/services/MovitexUltra/MovitexUltra-Font.png'

const Reservas = () => {
  const {
    reservas,
    loading,
    error,
    fetchReservas,
    updateEstadoReserva,
    deleteReserva,
    searchReservas,
    fetchPasajeros
  } = useReservasAdmin()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('')
  const [filtroFechaFin, setFiltroFechaFin] = useState('')
  
  // Modal de detalles
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false)
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null)
  const [pasajerosReserva, setPasajerosReserva] = useState([])
  const [cargandoPasajeros, setCargandoPasajeros] = useState(false)

  // Función para obtener datos del servicio (imagen y badge)
  const getServicioData = (nombreServicio) => {
    const servicioNormalizado = nombreServicio?.toLowerCase().replace(/\s+/g, '_') || 'movitex_one'
    const servicios = {
      movitex_one: {
        imagen: FontMovitexOne,
        alt: 'Movitex One',
        badgeClass: 'bg-[#fab926]'
      },
      movitex_pro: {
        imagen: FontMovitexPro,
        alt: 'Movitex Pro',
        badgeClass: 'bg-[#fab926]'
      },
      movitex_ultra: {
        imagen: FontMovitexUltra,
        alt: 'Movitex Ultra',
        badgeClass: 'bg-black'
      }
    }
    return servicios[servicioNormalizado] || servicios.movitex_one
  }

  // Filtrar reservas localmente
  const reservasFiltradas = reservas.filter(reserva => {
    const matchesSearch = 
      reserva.id_reserva?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.correo_anonimo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.usuario?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.usuario?.correo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'todos' || reserva.estado === filterStatus

    return matchesSearch && matchesStatus
  })

  // Función para abrir modal de detalles
  const handleVerDetalles = async (reserva) => {
    setReservaSeleccionada(reserva)
    setModalDetallesAbierto(true)
    setCargandoPasajeros(true)
    
    try {
      const pasajeros = await fetchPasajeros(reserva.id_reserva)
      setPasajerosReserva(pasajeros)
    } catch (err) {
      console.error('Error al cargar pasajeros:', err)
    } finally {
      setCargandoPasajeros(false)
    }
  }

  // Función para cambiar estado de reserva
  const handleCambiarEstado = async (idReserva, nuevoEstado) => {
    if (window.confirm(`¿Cambiar estado de la reserva a "${nuevoEstado}"?`)) {
      const result = await updateEstadoReserva(idReserva, nuevoEstado)
      if (result.success) {
        alert('Estado actualizado correctamente')
      } else {
        alert(`Error: ${result.error}`)
      }
    }
  }

  // Función para eliminar reserva
  const handleEliminar = async (idReserva) => {
    if (window.confirm('¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.')) {
      const result = await deleteReserva(idReserva)
      if (result.success) {
        alert('Reserva eliminada correctamente')
      } else {
        alert(`Error: ${result.error}`)
      }
    }
  }

  // Función para aplicar filtros
  const handleBuscar = () => {
    searchReservas({
      estado: filterStatus,
      fechaInicio: filtroFechaInicio,
      fechaFin: filtroFechaFin,
      correo: searchTerm
    })
  }

  // Función para limpiar filtros
  const handleLimpiarFiltros = () => {
    setSearchTerm('')
    setFilterStatus('todos')
    setFiltroFechaInicio('')
    setFiltroFechaFin('')
    fetchReservas()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="max-w-8xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Reservas</h1>
          <p className="text-gray-600">Administra todas las reservas del sistema</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Barra de filtros avanzados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Búsqueda */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, correo o pasajero..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
              />
            </div>

            {/* Fecha inicio */}
            <div>
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f] text-sm"
                placeholder="Fecha inicio"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f] text-sm"
                placeholder="Fecha fin"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* Estado */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f] text-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="completada">Completadas</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={handleBuscar}
                className="flex items-center gap-2 px-4 py-2 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f1a] transition-all duration-200"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">Buscar</span>
              </button>
              
              <button
                onClick={handleLimpiarFiltros}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Limpiar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div style={{width: 300, height: 250, overflow: 'hidden'}}>
              <Lottie animationData={BusLoadingAnimation} style={{width: 300, height: 300}} loop={true} />
            </div>
          </div>
        ) : (
          /* Tabla de reservas */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usuario/Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Viaje
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha Reserva
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <p className="text-gray-500">No se encontraron reservas</p>
                    </td>
                  </tr>
                ) : (
                  reservasFiltradas.map((reserva) => {
                    const servicioData = getServicioData(reserva.viaje?.bus?.servicio?.nombre)
                    const esAnonima = !reserva.id_usuario
                    
                    return (
                      <tr key={reserva.id_reserva} className="hover:bg-gray-50 transition-colors duration-150">
                        {/* ID corto */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono text-[#f0251f]">
                            {reserva.id_reserva.substring(0, 8)}...
                          </span>
                        </td>

                        {/* Usuario o Contacto */}
                        <td className="px-6 py-4">
                          {esAnonima ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">Anónimo</span>
                              <span className="text-xs text-gray-500">{reserva.correo_anonimo}</span>
                              <span className="text-xs text-gray-500">{reserva.telefono_anonimo}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {reserva.usuario?.nombre} {reserva.usuario?.apellido}
                              </span>
                              <span className="text-xs text-gray-500">{reserva.usuario?.correo}</span>
                            </div>
                          )}
                        </td>

                        {/* Viaje (ruta) */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {reserva.viaje?.ruta?.ciudad_origen?.nombre} → {reserva.viaje?.ruta?.ciudad_destino?.nombre}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(reserva.viaje?.fecha).toLocaleDateString('es-ES')} - {reserva.viaje?.hora_salida}
                            </span>
                          </div>
                        </td>

                        {/* Servicio con badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${servicioData.badgeClass}`}>
                              <img 
                                src={servicioData.imagen} 
                                alt={servicioData.alt}
                                className="h-4 object-contain"
                              />
                            </div>
                          </div>
                        </td>

                        {/* Fecha reserva */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>

                        {/* Monto */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">
                            S/ {parseFloat(reserva.total_pagado).toFixed(2)}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {reserva.estado === 'completada' ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Completada</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Pendiente</span>
                            </div>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleVerDetalles(reserva)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {reserva.estado === 'pendiente' && (
                              <button
                                onClick={() => handleCambiarEstado(reserva.id_reserva, 'completada')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                title="Marcar como completada"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleEliminar(reserva.id_reserva)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            </div>

            {/* Información */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando <span className="font-semibold">{reservasFiltradas.length}</span> de <span className="font-semibold">{reservas.length}</span> reservas
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {modalDetallesAbierto && reservaSeleccionada && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-xl mb-4 text-gray-900">
              Detalles de Reserva
            </h3>

            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">ID Reserva</p>
                <p className="text-sm font-mono text-gray-900">{reservaSeleccionada.id_reserva}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha de Reserva</p>
                <p className="text-sm text-gray-900">
                  {new Date(reservaSeleccionada.fecha_reserva).toLocaleString('es-ES', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Usuario</p>
                {reservaSeleccionada.id_usuario ? (
                  <p className="text-sm text-gray-900">
                    {reservaSeleccionada.usuario?.nombre} {reservaSeleccionada.usuario?.apellido}
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-900">Anónimo</p>
                    <p className="text-xs text-gray-600">{reservaSeleccionada.correo_anonimo}</p>
                    <p className="text-xs text-gray-600">{reservaSeleccionada.telefono_anonimo}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Pagado</p>
                <p className="text-lg font-bold text-[#f0251f]">
                  S/ {parseFloat(reservaSeleccionada.total_pagado).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Información del viaje */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Información del Viaje</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ruta</p>
                  <p className="text-sm font-medium text-gray-900">
                    {reservaSeleccionada.viaje?.ruta?.ciudad_origen?.nombre} → {reservaSeleccionada.viaje?.ruta?.ciudad_destino?.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha y Hora</p>
                  <p className="text-sm text-gray-900">
                    {new Date(reservaSeleccionada.viaje?.fecha).toLocaleDateString('es-ES')} - {reservaSeleccionada.viaje?.hora_salida}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bus</p>
                  <p className="text-sm text-gray-900">
                    Placa: {reservaSeleccionada.viaje?.bus?.placa}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Servicio</p>
                  <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${getServicioData(reservaSeleccionada.viaje?.bus?.servicio?.nombre).badgeClass}`}>
                    <img 
                      src={getServicioData(reservaSeleccionada.viaje?.bus?.servicio?.nombre).imagen}
                      alt={getServicioData(reservaSeleccionada.viaje?.bus?.servicio?.nombre).alt}
                      className="h-5 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de pasajeros */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Pasajeros</h4>
              
              {cargandoPasajeros ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f0251f]"></div>
                </div>
              ) : pasajerosReserva.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No se encontraron pasajeros</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Asiento</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">DNI</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Apellido</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Género</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">F. Nacimiento</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pasajerosReserva.map((pasajero, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-[#f0251f] text-white rounded-full text-xs font-bold">
                              {pasajero.asiento?.numero_asiento || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{pasajero.dni || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{pasajero.nombre || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{pasajero.apellido || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 capitalize">{pasajero.genero || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {pasajero.fecha_nacimiento ? new Date(pasajero.fecha_nacimiento).toLocaleDateString('es-ES') : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                            S/ {parseFloat(pasajero.asiento?.precio || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="6" className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                          Total:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-[#f0251f]">
                          S/ {pasajerosReserva.reduce((sum, p) => sum + parseFloat(p.asiento?.precio || 0), 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="modal-action">
              <button
                onClick={() => {
                  setModalDetallesAbierto(false)
                  setReservaSeleccionada(null)
                  setPasajerosReserva([])
                }}
                className="btn btn-ghost"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservas
