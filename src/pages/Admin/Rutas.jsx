import { useState } from 'react'
import { Search, Edit, Trash2, Plus, X, Loader2, MapPin, ArrowRight, Clock } from 'lucide-react'
import { useRutas } from '../../context/Admin/RutasContext'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import BusLoadingAnimation from '../../lottiefiles/BusLoading.json'

const Rutas = () => {
  const { 
    rutas, 
    ciudades,
    loading, 
    submitting, 
    createRuta,
    updateRuta, 
    deleteRuta, 
    searchRutas,
    formatDuracion
  } = useRutas()

  const [searchTerm, setSearchTerm] = useState('')
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [selectedRuta, setSelectedRuta] = useState(null)
  const [deleteRutaData, setDeleteRutaData] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    id_origen: '',
    id_destino: '',
    duracion_estimada: ''
  })

  // Estados separados para horas y minutos
  const [horas, setHoras] = useState('')
  const [minutos, setMinutos] = useState('')

  // Filtrar rutas usando la función del context
  const filteredRutas = searchRutas(rutas, searchTerm)

  // Abrir modal para crear
  const openCreateModal = () => {
    setModalMode('create')
    setFormData({ 
      id_origen: '', 
      id_destino: '', 
      duracion_estimada: '' 
    })
    setHoras('')
    setMinutos('')
    document.getElementById('modal_ruta').showModal()
  }

  // Abrir modal para editar
  const openEditModal = (ruta) => {
    setModalMode('edit')
    setSelectedRuta(ruta)
    
    // Extraer horas y minutos de duracion_estimada (formato HH:MM:SS)
    if (ruta.duracion_estimada) {
      const [h, m] = ruta.duracion_estimada.split(':')
      setHoras(h)
      setMinutos(m)
    } else {
      setHoras('')
      setMinutos('')
    }
    
    setFormData({
      id_origen: ruta.id_origen || '',
      id_destino: ruta.id_destino || '',
      duracion_estimada: ruta.duracion_estimada || ''
    })
    document.getElementById('modal_ruta').showModal()
  }

  // Abrir modal de eliminar
  const openDeleteModal = (ruta) => {
    setDeleteRutaData(ruta)
    document.getElementById('modal_delete').showModal()
  }

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar horas y minutos
    if (!horas || !minutos) {
      toast.error('Por favor ingresa las horas y minutos')
      return
    }

    if (!formData.id_origen || !formData.id_destino) {
      toast.error('Por favor completa todos los campos')
      return
    }

    // Construir duracion_estimada en formato HH:MM:00
    const horasPadded = horas.toString().padStart(2, '0')
    const minutosPadded = minutos.toString().padStart(2, '0')
    const duracionFormateada = `${horasPadded}:${minutosPadded}:00`

    // Convertir IDs a números
    const rutaData = {
      id_origen: parseInt(formData.id_origen),
      id_destino: parseInt(formData.id_destino),
      duracion_estimada: duracionFormateada
    }

    let result
    if (modalMode === 'create') {
      result = await createRuta(rutaData)
    } else {
      result = await updateRuta(selectedRuta.id_ruta, rutaData)
    }
    
    if (result.success) {
      document.getElementById('modal_ruta').close()
    }
  }

  // Eliminar ruta
  const handleDelete = async () => {
    const result = await deleteRuta(deleteRutaData.id_ruta)
    
    if (result.success) {
      document.getElementById('modal_delete').close()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="max-w-8xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Rutas</h1>
          <p className="text-gray-600">Administra las rutas de viaje disponibles</p>
        </div>

        {/* Barra de acciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por origen o destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
              />
            </div>

            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f19] transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nueva Ruta</span>
            </button>
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
          /* Tabla de rutas */
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
                      Duración Estimada
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredRutas.length > 0 ? (
                    filteredRutas.map((ruta) => (
                      <tr key={ruta.id_ruta} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            #{ruta.id_ruta}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">
                                {ruta.ciudad_origen?.nombre || 'N/A'}
                              </span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-900">
                                {ruta.ciudad_destino?.nombre || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-[#f0251f]" />
                            <span className="font-medium">{formatDuracion(ruta.duracion_estimada)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(ruta)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" 
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(ruta)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" 
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron rutas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando <span className="font-semibold">{filteredRutas.length}</span> de{' '}
                  <span className="font-semibold">{rutas.length}</span> rutas
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear/Editar Ruta */}
        <dialog id="modal_ruta" className="modal">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#f0251f]" />
                {modalMode === 'create' ? 'Nueva Ruta' : 'Editar Ruta'}
              </h3>
              <button 
                onClick={() => document.getElementById('modal_ruta').close()}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Ciudad de Origen */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad de Origen <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_origen"
                  value={formData.id_origen}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
                >
                  <option value="">Seleccionar ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                      {ciudad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ciudad de Destino */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad de Destino <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_destino"
                  value={formData.id_destino}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
                >
                  <option value="">Seleccionar ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                      {ciudad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duración Estimada */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración Estimada <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Horas */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Horas</label>
                    <input
                      type="number"
                      min="0"
                      max="48"
                      value={horas}
                      onChange={(e) => setHoras(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
                      placeholder="00"
                    />
                  </div>
                  {/* Minutos */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minutos</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutos}
                      onChange={(e) => setMinutos(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
                      placeholder="00"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => document.getElementById('modal_ruta').close()}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f19] transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    modalMode === 'create' ? 'Crear Ruta' : 'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* Modal Eliminar Ruta */}
        <dialog id="modal_delete" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la ruta{' '}
              <span className="font-semibold text-gray-900">
                {deleteRutaData?.ciudad_origen?.nombre} → {deleteRutaData?.ciudad_destino?.nombre}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-6">
              ⚠️ No se podrá eliminar si existen viajes asociados a esta ruta.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => document.getElementById('modal_delete').close()}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Ruta'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  )
}

export default Rutas

