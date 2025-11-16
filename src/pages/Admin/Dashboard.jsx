import { useEffect } from 'react'
import { useDashboard } from '../../context/Admin/DashboardContext'
import { BarChart3, Users, Bus, RefreshCw, TrendingUp, Ticket } from 'lucide-react'
import Lottie from 'lottie-react'
import BusLoadingAnimation from '../../lottiefiles/BusLoading.json'

const StatCard = ({ title, value, icon: Icon, change, color = "bg-red-50" }) => (
	<div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<div className={`${color} p-3 rounded-lg`}>
					<Icon className="w-6 h-6 text-[#f0251f]" strokeWidth={2} />
				</div>
				{change && (
					<div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
						<TrendingUp className="w-3 h-3" />
						<span className="text-xs font-semibold">{change}</span>
					</div>
				)}
			</div>
			<div>
				<p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
				<p className="text-3xl font-bold text-gray-900">{value}</p>
			</div>
		</div>
		<div className="h-1 bg-gradient-to-r from-[#f0251f]/10 via-[#f0251f]/5 to-transparent"></div>
	</div>
)

const Dashboard = () => {
	const {
		loading,
		error,
		stats,
		reservasRecientes,
		rutasPopulares,
		refrescarDatos
	} = useDashboard()

	useEffect(() => {
		// refrescarDatos ya es llamado por el provider, pero aseguramos al montar
		if (refrescarDatos) refrescarDatos()
	}, [])

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
			<div className="max-w-8xl mx-auto p-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
							<p className="text-gray-600">Bienvenido al panel de administración de Movitex</p>
						</div>
						<button
							onClick={refrescarDatos}
							disabled={loading}
							className={`flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#f0251f]/20'}`}
						>
							<RefreshCw className={`w-4 h-4 text-[#f0251f] ${loading ? 'animate-spin' : ''}`} />
							<span className="text-sm font-medium text-gray-700">
								{loading ? 'Actualizando...' : 'Refrescar'}
							</span>
						</button>
					</div>
				</div>

				{/* Estadísticas principales */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<StatCard 
						title="Usuarios Totales" 
						value={stats.totalUsuarios} 
						icon={Users} 
						change={stats.cambioUsuarios}
						color="bg-blue-50"
					/>
					<StatCard 
						title="Reservas Hoy" 
						value={stats.reservasHoy} 
						icon={Ticket} 
						change={stats.cambioReservas}
						color="bg-purple-50"
					/>
					<StatCard 
						title="Ingresos Mensuales" 
						value={`S/ ${Number(stats.ingresosMensuales || 0).toFixed(2)}`} 
						icon={BarChart3} 
						change={stats.cambioIngresos}
						color="bg-green-50"
					/>
					<StatCard 
						title="Buses Activos" 
						value={stats.busesActivos} 
						icon={Bus} 
						change={stats.cambioBuses}
						color="bg-orange-50"
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Reservas recientes */}
					<div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="px-6 py-5 border-b border-gray-100">
							<h2 className="text-lg font-bold text-gray-900">Reservas Recientes</h2>
							<p className="text-sm text-gray-500 mt-1">Últimas transacciones del sistema</p>
						</div>

						{error && (
							<div className="px-6 py-4 bg-red-50 border-l-4 border-red-500">
								<p className="text-sm text-red-700">{error}</p>
							</div>
						)}

						<div className="overflow-x-auto">
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pasajero</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ruta</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{reservasRecientes && reservasRecientes.length > 0 ? (
										reservasRecientes.map(r => (
											<tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
												<td className="px-6 py-4 text-sm font-medium text-gray-900">{r.id}</td>
												<td className="px-6 py-4 text-sm text-gray-700">{r.passenger}</td>
												<td className="px-6 py-4 text-sm text-gray-700">{r.route}</td>
												<td className="px-6 py-4 text-sm text-gray-500">{r.date}</td>
												<td className="px-6 py-4">
													<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														r.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
														r.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
														'bg-red-100 text-red-800'
													}`}>
														{r.status}
													</span>
												</td>
												<td className="px-6 py-4 text-sm font-semibold text-gray-900">{r.amount}</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={6} className="px-6 py-12 text-center">
												<div className="flex flex-col items-center justify-center text-gray-400">
													<Ticket className="w-12 h-12 mb-3 opacity-50" />
													<p className="text-sm font-medium">No hay reservas recientes</p>
												</div>
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>

					{/* Rutas populares */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="px-6 py-5 border-b border-gray-100">
							<h2 className="text-lg font-bold text-gray-900">Rutas Populares</h2>
							<p className="text-sm text-gray-500 mt-1">Top destinos del mes</p>
						</div>
						<div className="p-6">
							<div className="space-y-4">
								{rutasPopulares && rutasPopulares.length > 0 ? (
									rutasPopulares.map((r, idx) => (
										<div key={idx} className="group">
											<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-[#f0251f]/5 transition-all duration-200 border border-transparent hover:border-[#f0251f]/20">
												<div className="flex items-center gap-3">
													<div className="flex items-center justify-center w-8 h-8 bg-[#f0251f]/10 rounded-lg group-hover:bg-[#f0251f]/20 transition-colors">
														<span className="text-sm font-bold text-[#f0251f]">{idx + 1}</span>
													</div>
													<div>
														<p className="font-semibold text-gray-900 text-sm">{r.route}</p>
														<p className="text-xs text-gray-500 mt-0.5">{r.trips} viajes realizados</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm font-bold text-[#f0251f]">{r.revenue}</p>
													<p className="text-xs text-gray-400">ingresos</p>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="flex flex-col items-center justify-center py-8 text-gray-400">
										<Bus className="w-12 h-12 mb-3 opacity-50" />
										<p className="text-sm font-medium">No hay rutas populares</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard

