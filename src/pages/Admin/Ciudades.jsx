import { useState } from 'react'
import { Search, Edit, Trash2, Plus, X, Loader2, MapPin } from 'lucide-react'
import { useCiudadesAdmin } from '../../context/Admin/CiudadesAdminContext'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import BusLoadingAnimation from '../../lottiefiles/BusLoading.json'

const Ciudades = () => {
  const { 
    ciudades, 
    loading, 
    submitting, 
    createCiudad,
    updateCiudad, 
    deleteCiudad, 
    searchCiudades 
  } = useCiudadesAdmin()

  const [searchTerm, setSearchTerm] = useState('')
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [selectedCiudad, setSelectedCiudad] = useState(null)
  const [deleteCiudadData, setDeleteCiudadData] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    nombre: ''
  })

  // Filtrar ciudades usando la función del context
  const filteredCiudades = searchCiudades(ciudades, searchTerm)

  // Abrir modal para crear
  const openCreateModal = () => {
    setModalMode('create')
    setFormData({ nombre: '' })
    document.getElementById('modal_ciudad').showModal()
  }

  // Abrir modal para editar
  const openEditModal = (ciudad) => {
    setModalMode('edit')
    setSelectedCiudad(ciudad)
    setFormData({
      nombre: ciudad.nombre || ''
    })
    document.getElementById('modal_ciudad').showModal()
  }

  // Abrir modal de eliminar
  const openDeleteModal = (ciudad) => {
    setDeleteCiudadData(ciudad)
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

    if (!formData.nombre.trim()) {
      toast.error('Por favor ingresa el nombre de la ciudad')
      return
    }

    let result
    if (modalMode === 'create') {
      result = await createCiudad(formData)
    } else {
      result = await updateCiudad(selectedCiudad.id_ciudad, formData)
    }
    
    if (result.success) {
      document.getElementById('modal_ciudad').close()
    }
  }

  // Eliminar ciudad
  const handleDelete = async () => {
    const result = await deleteCiudad(deleteCiudadData.id_ciudad)
    
    if (result.success) {
      document.getElementById('modal_delete').close()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Ciudades</h1>
          <p className="text-gray-600">Administra las ciudades disponibles en el sistema</p>
        </div>

        {/* Barra de búsqueda y botón crear */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
              />
            </div>

            {/* Botón nueva ciudad */}
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f19] transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nueva Ciudad</span>
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
          /* Grid de ciudades */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCiudades.length > 0 ? (
              filteredCiudades.map((ciudad) => (
                <div 
                  key={ciudad.id_ciudad} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#f0251f]/10 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-[#f0251f]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ciudad.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {ciudad.id_ciudad}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => openEditModal(ciudad)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" 
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    <button 
                      onClick={() => openDeleteModal(ciudad)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" 
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No se encontraron ciudades</p>
              </div>
            )}
          </div>
        )}

        {/* Contador */}
        {!loading && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando <span className="font-semibold">{filteredCiudades.length}</span> de{' '}
            <span className="font-semibold">{ciudades.length}</span> ciudades
          </div>
        )}

        {/* Modal Crear/Editar Ciudad */}
        <dialog id="modal_ciudad" className="modal">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#f0251f]" />
                {modalMode === 'create' ? 'Nueva Ciudad' : 'Editar Ciudad'}
              </h3>
              <button 
                onClick={() => document.getElementById('modal_ciudad').close()}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Nombre */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0251f]/20 focus:border-[#f0251f]"
                  placeholder="Ej: Lima, Arequipa, Cusco..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => document.getElementById('modal_ciudad').close()}
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
                    modalMode === 'create' ? 'Crear Ciudad' : 'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* Modal Eliminar Ciudad */}
        <dialog id="modal_delete" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la ciudad{' '}
              <span className="font-semibold text-gray-900">
                {deleteCiudadData?.nombre}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-6">
              ⚠️ No se podrá eliminar si existen rutas asociadas a esta ciudad.
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
                  'Eliminar Ciudad'
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

export default Ciudades
