import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Bus, Calendar, Clock, MapPin, DollarSign, Users, X, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useViajes } from '../../context/Admin/ViajesContext'
import Lottie from 'lottie-react'
import BusLoadingAnimation from '../../lottiefiles/BusLoading.json'
import MovitexOne from '../../assets/services/MovitexOne/MovitexOne.png'
import MovitexPro from '../../assets/services/MovitexPro/MovitexPro.png'
import MovitexUltra from '../../assets/services/MovitexUltra/MovitexUltra.png'
import FontMovitexOne from '../../assets/services/MovitexOne/MovitexOne-Font.png'
import FontMovitexPro from '../../assets/services/MovitexPro/MovitexPro-Font.png'
import FontMovitexUltra from '../../assets/services/MovitexUltra/MovitexUltra-Font.png'

const Viajes = () => {
  const { 
    viajes, 
    rutas, 
    buses, 
    loading, 
    submitting, 
    createViaje, 
    updateViaje, 
    deleteViaje, 
    searchViajes,
    formatDuracion 
  } = useViajes()

  // Estado del buscador
  const [searchTerm, setSearchTerm] = useState('')

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' o 'edit'
  const [selectedViaje, setSelectedViaje] = useState(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    id_ruta: '',
    id_bus: '',
    fecha: '',
    hora_salida: '',
    hora_llegada: '',
    precio_base_piso1: '',
    precio_base_piso2: '',
    activo: true
  })

  // Filtrar viajes por búsqueda
  const filteredViajes = viajes.filter(viaje =>
    viaje.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viaje.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viaje.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viaje.fecha?.includes(searchTerm)
  )

  // Abrir modal para crear
  const handleOpenCreateModal = () => {
    setModalMode('create')
    setFormData({
      id_ruta: '',
      id_bus: '',
      fecha: '',
      hora_salida: '',
      hora_llegada: '',
      precio_base_piso1: '',
      precio_base_piso2: '',
      activo: true
    })
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleOpenEditModal = (viaje) => {
    setModalMode('edit')
    setSelectedViaje(viaje)
    setFormData({
      id_ruta: viaje.id_ruta,
      id_bus: viaje.id_bus,
      fecha: viaje.fecha,
      hora_salida: viaje.hora_salida,
      hora_llegada: viaje.hora_llegada || '',
      precio_base_piso1: viaje.precio_base_piso1,
      precio_base_piso2: viaje.precio_base_piso2 || '',
      activo: viaje.activo
    })
    setIsModalOpen(true)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedViaje(null)
    setFormData({
      id_ruta: '',
      id_bus: '',
      fecha: '',
      hora_salida: '',
      hora_llegada: '',
      precio_base_piso1: '',
      precio_base_piso2: '',
      activo: true
    })
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    let success = false
    if (modalMode === 'create') {
      success = await createViaje(formData)
    } else {
      success = await updateViaje(selectedViaje.id_viaje, formData)
    }
    
    if (success) {
      handleCloseModal()
    }
  }

  // Eliminar viaje
  const handleDelete = async (id_viaje) => {
    if (!confirm('¿Estás seguro de eliminar este viaje? Esta acción no se puede deshacer.')) {
      return
    }

    await deleteViaje(id_viaje)
  }

  // Manejar búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value)
    if (value.trim()) {
      searchViajes(value)
    }
  }

  // Obtener imagen del servicio con badge
  const getServicioData = (nombreServicio) => {
    if (!nombreServicio) return null
    
    const nombre = nombreServicio.toLowerCase()
    if (nombre.includes('one')) {
      return { imagen: FontMovitexOne, alt: 'Movitex One', badgeClass: 'bg-[#fab926]' }
    }
    if (nombre.includes('pro')) {
      return { imagen: FontMovitexPro, alt: 'Movitex Pro', badgeClass: 'bg-[#fab926]' }
    }
    if (nombre.includes('ultra')) {
      return { imagen: FontMovitexUltra, alt: 'Movitex Ultra', badgeClass: 'bg-black' }
    }
    return null
  }

  // Obtener bus seleccionado con su servicio
  const busSeleccionado = buses.find(bus => bus.id_bus === parseInt(formData.id_bus))

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#f0251f]/10 rounded-lg">
            <Bus className="w-6 h-6 text-[#f0251f]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Viajes</h1>
            <p className="text-gray-500 mt-1">Administra los viajes programados</p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Buscador */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por origen, destino, placa o fecha..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f] transition-all"
            />
          </div>

          {/* Botón Nuevo Viaje */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f1a] transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nuevo Viaje</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div style={{width: 300, height: 280, overflow: 'hidden'}}>
            <Lottie animationData={BusLoadingAnimation} style={{width: 300, height: 300}} loop={true} />
          </div>
        </div>
      ) : (
        /* Tabla de viajes */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ruta
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bus
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Precios
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredViajes.length > 0 ? (
                filteredViajes.map((viaje) => (
                  <tr key={viaje.id_viaje} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{viaje.id_viaje}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#f0251f]" />
                        <span className="text-sm text-gray-900">
                          {viaje.origen} → {viaje.destino}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col  ">
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{viaje.placa}</span>
                        </div>
                        {getServicioData(viaje.servicio) && (
                          <div className={`inline-flex  px-3 py-1 rounded-full w-max ${getServicioData(viaje.servicio).badgeClass}`}>
                            <img 
                              src={getServicioData(viaje.servicio).imagen} 
                              alt={getServicioData(viaje.servicio).alt}
                              className="h-3 object-contain "
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(viaje.fecha + 'T00:00:00').toLocaleDateString('es-PE')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {viaje.hora_salida}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Piso 1:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            S/ {parseFloat(viaje.precio_base_piso1).toFixed(2)}
                          </span>
                        </div>
                        {viaje.precio_base_piso2 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Piso 2:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              S/ {parseFloat(viaje.precio_base_piso2).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {viaje.activo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" />
                            Inactivo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(viaje)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar viaje"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(viaje.id_viaje)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar viaje"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Bus className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        {searchTerm ? 'No se encontraron viajes' : 'No hay viajes registrados'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza creando un nuevo viaje'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Nuevo Viaje' : 'Editar Viaje'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ruta */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Ruta *</span>
                </label>
                <select
                  name="id_ruta"
                  value={formData.id_ruta}
                  onChange={handleInputChange}
                  required
                  className="select select-bordered w-full"
                >
                  <option value="">Selecciona una ruta</option>
                  {rutas.map(ruta => (
                    <option key={ruta.id_ruta} value={ruta.id_ruta}>
                      {ruta.origen} → {ruta.destino}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bus con imagen del servicio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Bus *</span>
                </label>
                <select
                  name="id_bus"
                  value={formData.id_bus}
                  onChange={handleInputChange}
                  required
                  className="select select-bordered w-full"
                >
                  <option value="">Selecciona un bus</option>
                  {buses.map(bus => (
                    <option key={bus.id_bus} value={bus.id_bus}>
                      {bus.placa} - {bus.servicio}
                    </option>
                  ))}
                </select>
                
                {/* Mostrar imagen del servicio cuando se selecciona un bus */}
                {busSeleccionado && getServicioData(busSeleccionado.servicio) && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Servicio seleccionado:</p>
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center justify-center px-4 py-2 rounded-full ${getServicioData(busSeleccionado.servicio).badgeClass}`}>
                        <img 
                          src={getServicioData(busSeleccionado.servicio).imagen} 
                          alt={getServicioData(busSeleccionado.servicio).alt}
                          className="h-6 object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Placa: {busSeleccionado.placa}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fecha */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Fecha del Viaje *</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full"
                />
              </div>

              {/* Horas de Salida y Llegada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Hora de Salida *</span>
                  </label>
                  <input
                    type="time"
                    name="hora_salida"
                    value={formData.hora_salida}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Hora de Llegada</span>
                  </label>
                  <input
                    type="time"
                    name="hora_llegada"
                    value={formData.hora_llegada}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Precios por Piso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Precio Piso 1 (S/) *</span>
                  </label>
                  <input
                    type="number"
                    name="precio_base_piso1"
                    value={formData.precio_base_piso1}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Precio Piso 2 (S/)</span>
                  </label>
                  <input
                    type="number"
                    name="precio_base_piso2"
                    value={formData.precio_base_piso2}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Estado Activo */}
              <div className="form-control">
                <label className="label cursor-pointer bg-gray-50 rounded-lg px-4">
                  <div className="flex flex-col">
                    <span className="label-text font-semibold">Viaje Activo</span>
                    <span className="label-text-alt text-gray-500">
                      Los viajes inactivos no aparecerán en las búsquedas de usuarios
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                    className="checkbox checkbox-error"
                  />
                </label>
              </div>

              {/* Botones */}
              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-[#f0251f] hover:bg-[#d91f1a] text-white border-none"
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Guardando...
                    </>
                  ) : (
                    modalMode === 'create' ? 'Crear Viaje' : 'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
        </div>
      )}
    </div>
  )
}

export default Viajes
