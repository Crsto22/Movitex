import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Bus as BusIcon, X, Loader2, Users } from 'lucide-react'
import { useBuses } from '../../context/Admin/BusesContext'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import BusLoadingAnimation from '../../lottiefiles/BusLoading.json'

const Buses = () => {
  const { 
    buses, 
    servicios,
    loading, 
    submitting, 
    createBus,
    updateBus, 
    deleteBus, 
    searchBuses,
    getCapacidadTotal,
    getNombreServicioFormateado
  } = useBuses()

  const [searchTerm, setSearchTerm] = useState('')
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [selectedBus, setSelectedBus] = useState(null)
  const [deleteBusData, setDeleteBusData] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    id_servicio: '',
    placa: '',
    capacidad_piso1: '',
    capacidad_piso2: ''
  })

  // Filtrar buses usando la función del context
  const filteredBuses = searchBuses(buses, searchTerm)

  // Abrir modal para crear
  const openCreateModal = () => {
    setModalMode('create')
    setFormData({ 
      id_servicio: '', 
      placa: '', 
      capacidad_piso1: '',
      capacidad_piso2: ''
    })
    document.getElementById('modal_bus').showModal()
  }

  // Abrir modal para editar
  const openEditModal = (bus) => {
    setModalMode('edit')
    setSelectedBus(bus)
    setFormData({
      id_servicio: bus.id_servicio || '',
      placa: bus.placa || '',
      capacidad_piso1: bus.capacidad_piso1 || '',
      capacidad_piso2: bus.capacidad_piso2 || ''
    })
    document.getElementById('modal_bus').showModal()
  }

  // Abrir modal de eliminar
  const openDeleteModal = (bus) => {
    setDeleteBusData(bus)
    document.getElementById('modal_delete').showModal()
  }

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Si cambia el servicio, resetear capacidad piso 2
    if (name === 'id_servicio') {
      const servicioSeleccionado = servicios.find(s => s.id_servicio === parseInt(value))
      const esMovitexOne = servicioSeleccionado?.nombre?.toLowerCase().includes('one')
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        capacidad_piso2: esMovitexOne ? '0' : prev.capacidad_piso2
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }
  
  // Verificar si el servicio seleccionado es Movitex One
  const esMovitexOne = () => {
    if (!formData.id_servicio) return false
    const servicioSeleccionado = servicios.find(s => s.id_servicio === parseInt(formData.id_servicio))
    return servicioSeleccionado?.nombre?.toLowerCase().includes('one')
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.id_servicio || !formData.placa || !formData.capacidad_piso1) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    // Validar que Movitex One solo tenga 1 piso
    if (esMovitexOne()) {
      if (formData.capacidad_piso2 && parseInt(formData.capacidad_piso2) > 0) {
        toast.error('El servicio Movitex One solo puede tener 1 piso')
        return
      }
    }

    // Convertir capacidades a números
    const busData = {
      id_servicio: parseInt(formData.id_servicio),
      placa: formData.placa,
      capacidad_piso1: parseInt(formData.capacidad_piso1),
      capacidad_piso2: esMovitexOne() ? 0 : (formData.capacidad_piso2 ? parseInt(formData.capacidad_piso2) : 0)
    }

    let result
    if (modalMode === 'create') {
      result = await createBus(busData)
    } else {
      result = await updateBus(selectedBus.id_bus, busData)
    }
    
    if (result.success) {
      document.getElementById('modal_bus').close()
    }
  }

  // Eliminar bus
  const handleDelete = async () => {
    const result = await deleteBus(deleteBusData.id_bus)
    
    if (result.success) {
      document.getElementById('modal_delete').close()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="max-w-8xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Buses</h1>
          <p className="text-gray-600">Administra la flota de buses de Movitex</p>
        </div>

        {/* Barra de acciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por placa o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
              />
            </div>

            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f19] transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuevo Bus</span>
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
          /* Grid de buses */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus) => (
                <div key={bus.id_bus} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="p-6">
                    {/* Header de la card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#f0251f]/10 rounded-lg">
                          <BusIcon className="w-6 h-6 text-[#f0251f]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{bus.placa}</h3>
                          <p className="text-sm text-gray-500">
                            {getNombreServicioFormateado(bus.servicio?.nombre)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Capacidades */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Piso 1</span>
                        <span className="text-sm font-bold text-gray-900">
                          {bus.capacidad_piso1} asientos
                        </span>
                      </div>
                      {bus.capacidad_piso2 > 0 && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Piso 2</span>
                          <span className="text-sm font-bold text-gray-900">
                            {bus.capacidad_piso2} asientos
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-[#f0251f]/5 rounded-lg border border-[#f0251f]/20">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#f0251f]" />
                          <span className="text-sm font-medium text-gray-600">Capacidad Total</span>
                        </div>
                        <span className="text-sm font-bold text-[#f0251f]">
                          {getCapacidadTotal(bus)} asientos
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => openEditModal(bus)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-medium">Editar</span>
                      </button>
                      <button 
                        onClick={() => openDeleteModal(bus)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <BusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron buses</h3>
                <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>
        )}

        {/* Contador */}
        {!loading && filteredBuses.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando <span className="font-semibold">{filteredBuses.length}</span> de{' '}
            <span className="font-semibold">{buses.length}</span> buses
          </div>
        )}

        {/* Modal Crear/Editar Bus */}
        <dialog id="modal_bus" className="modal">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <BusIcon className="w-5 h-5 text-[#f0251f]" />
                {modalMode === 'create' ? 'Nuevo Bus' : 'Editar Bus'}
              </h3>
              <button 
                onClick={() => document.getElementById('modal_bus').close()}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Servicio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Servicio <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_servicio"
                  value={formData.id_servicio}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
                >
                  <option value="">Seleccionar servicio</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id_servicio} value={servicio.id_servicio}>
                      {getNombreServicioFormateado(servicio.nombre)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Placa */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f] uppercase"
                  placeholder="ONE-1001, PRO-2001, ULTRA-3001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: XXX-XXXX (ej: ONE-1001)
                </p>
              </div>

              {/* Capacidades */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Capacidad Piso 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad Piso 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacidad_piso1"
                    value={formData.capacidad_piso1}
                    onChange={handleChange}
                    required
                    min="1"
                    max="100"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
                    placeholder="40"
                  />
                </div>

                {/* Capacidad Piso 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad Piso 2 {esMovitexOne() && <span className="text-xs text-gray-500">(No disponible)</span>}
                  </label>
                  <input
                    type="number"
                    name="capacidad_piso2"
                    value={formData.capacidad_piso2}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    disabled={esMovitexOne()}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={esMovitexOne() ? "No disponible" : "0"}
                  />
                </div>
              </div>

                  

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => document.getElementById('modal_bus').close()}
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
                    modalMode === 'create' ? 'Crear Bus' : 'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* Modal Eliminar Bus */}
        <dialog id="modal_delete" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el bus{' '}
              <span className="font-semibold text-gray-900">
                {deleteBusData?.placa}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-6">
              ⚠️ No se podrá eliminar si existen viajes asociados a este bus.
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
                  'Eliminar Bus'
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

export default Buses

