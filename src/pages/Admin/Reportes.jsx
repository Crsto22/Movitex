import { useState } from 'react'
import { Download, TrendingUp, DollarSign, Users, Calendar, FileText } from 'lucide-react'
import { useReportes } from '../../context/Admin/ReportesContext'
import { pdf } from '@react-pdf/renderer'
import ReportePDF from '../../components/ReportePDF'
import ReporteRutasPDF from '../../components/ReporteRutasPDF'
import toast from 'react-hot-toast'
import Lottie from 'lottie-react'
import BusLoadingAnimation from '../../lottiefiles/BusLoading.json'

const Reportes = () => {
  const { loading, metricas, fetchVentasPorFecha, fetchIngresosPorRuta } = useReportes()
  
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [ventas, setVentas] = useState([])
  const [ingresosPorRuta, setIngresosPorRuta] = useState([])
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [mostrarTabla, setMostrarTabla] = useState(false)
  const [mostrarIngresosPorRuta, setMostrarIngresosPorRuta] = useState(false)

  // Buscar ventas
  const handleBuscarVentas = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor selecciona ambas fechas')
      return
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error('La fecha de inicio no puede ser mayor a la fecha fin')
      return
    }

    const ventasData = await fetchVentasPorFecha(fechaInicio, fechaFin)
    
    setVentas(ventasData)
    setMostrarTabla(true)

    if (ventasData.length === 0) {
      toast('No se encontraron ventas en este período', { icon: 'ℹ️' })
    }
  }

  // Buscar ingresos por ruta
  const handleBuscarIngresosPorRuta = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor selecciona ambas fechas')
      return
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error('La fecha de inicio no puede ser mayor a la fecha fin')
      return
    }

    const rutasData = await fetchIngresosPorRuta(fechaInicio, fechaFin)
    setIngresosPorRuta(rutasData)
    setMostrarIngresosPorRuta(true)

    if (rutasData.length === 0) {
      toast('No se encontraron datos en este período', { icon: 'ℹ️' })
    }
  }

  // Generar PDF
  const handleGenerarPDF = async () => {
    if (ventas.length === 0) {
      toast.error('No hay datos para generar el reporte')
      return
    }

    try {
      setGenerandoPDF(true)
      toast.loading('Generando PDF...')

      const blob = await pdf(
        <ReportePDF 
          metricas={metricas} 
          ventas={ventas} 
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Reporte_Ventas_${fechaInicio}_${fechaFin}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success('PDF generado exitosamente')
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.dismiss()
      toast.error('Error al generar el PDF')
    } finally {
      setGenerandoPDF(false)
    }
  }

  // Generar PDF de Ingresos por Ruta
  const handleGenerarPDFRutas = async () => {
    if (ingresosPorRuta.length === 0) {
      toast.error('No hay datos para generar el reporte')
      return
    }

    try {
      setGenerandoPDF(true)
      toast.loading('Generando PDF...')

      const blob = await pdf(
        <ReporteRutasPDF 
          ingresosPorRuta={ingresosPorRuta}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Reporte_Ingresos_Rutas_${fechaInicio}_${fechaFin}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success('PDF generado exitosamente')
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.dismiss()
      toast.error('Error al generar el PDF')
    } finally {
      setGenerandoPDF(false)
    }
  }

  const totalVentas = ventas.reduce((sum, v) => sum + v.total_pagado, 0)

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#f0251f]/10 rounded-lg">
            <FileText className="w-6 h-6 text-[#f0251f]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
            <p className="text-gray-500 mt-1">Análisis de ventas y métricas del sistema</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div style={{width: 300, height: 280, overflow: 'hidden'}}>
            <Lottie animationData={BusLoadingAnimation} style={{width: 300, height: 300}} loop={true} />
          </div>
        </div>
      ) : (
        <>
          {/* Métricas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Reservas</p>
              <p className="text-3xl font-bold text-gray-900">{metricas.totalReservas}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Ingresos</p>
              <p className="text-3xl font-bold text-gray-900">
                S/ {metricas.totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Pasajeros</p>
              <p className="text-3xl font-bold text-gray-900">{metricas.totalPasajeros}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Reservas Hoy</p>
              <p className="text-3xl font-bold text-gray-900">{metricas.reservasHoy}</p>
            </div>
          </div>

          {/* Filtros de Reporte */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Generar Reporte de Ventas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBuscarVentas}
                  disabled={loading}
                  className="flex-1 btn bg-[#f0251f] hover:bg-[#d91f1a] text-white border-none"
                >
                  Buscar
                </button>
                <button
                  onClick={handleGenerarPDF}
                  disabled={generandoPDF || ventas.length === 0}
                  className="flex items-center gap-2 px-4 btn btn-outline border-[#f0251f] text-[#f0251f] hover:bg-[#f0251f] hover:text-white hover:border-[#f0251f]"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Ventas */}
          {mostrarTabla && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  Detalle de Ventas ({ventas.length} registros)
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Período: {new Date(fechaInicio).toLocaleDateString('es-PE')} - {new Date(fechaFin).toLocaleDateString('es-PE')}
                </p>
              </div>

              {ventas.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Pasajero
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Ruta
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Fecha Viaje
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Servicio
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                            Monto
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {ventas.map((venta, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {venta.pasajeros.length > 0 ? (
                                <div className="space-y-1">
                                  {venta.pasajeros.map((pasajero, idx) => (
                                    <div key={idx}>
                                      {pasajero.nombre} {pasajero.apellido}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">Sin pasajeros</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {venta.origen} → {venta.destino}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(venta.fecha_viaje + 'T00:00:00').toLocaleDateString('es-PE')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {venta.servicio}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                              S/ {venta.total_pagado.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                            TOTAL:
                          </td>
                          <td className="px-6 py-4 text-right text-lg font-bold text-[#f0251f]">
                            S/ {totalVentas.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron ventas en este período</p>
                </div>
              )}
            </div>
          )}

          {/* Reporte de Ingresos por Ruta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reporte de Ingresos por Ruta</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBuscarIngresosPorRuta}
                  disabled={loading}
                  className="flex-1 btn bg-[#f0251f] hover:bg-[#d91f1a] text-white border-none"
                >
                  Buscar
                </button>
                <button
                  onClick={handleGenerarPDFRutas}
                  disabled={generandoPDF || ingresosPorRuta.length === 0}
                  className="flex items-center gap-2 px-4 btn btn-outline border-[#f0251f] text-[#f0251f] hover:bg-[#f0251f] hover:text-white hover:border-[#f0251f]"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Ingresos por Ruta */}
          {mostrarIngresosPorRuta && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  Ingresos por Ruta ({ingresosPorRuta.length} rutas)
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Período: {new Date(fechaInicio).toLocaleDateString('es-PE')} - {new Date(fechaFin).toLocaleDateString('es-PE')}
                </p>
              </div>

              {ingresosPorRuta.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Ruta
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Cantidad de Viajes
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Ingresos Totales
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Promedio por Viaje
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {ingresosPorRuta.map((ruta, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {ruta.origen} → {ruta.destino}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {ruta.cantidad}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                            S/ {ruta.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            S/ {(ruta.total / ruta.cantidad).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          TOTAL:
                        </td>
                        <td className="px-6 py-4 text-right text-lg font-bold text-[#f0251f]">
                          S/ {ingresosPorRuta.reduce((sum, r) => sum + r.total, 0).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron datos en este período</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reportes
