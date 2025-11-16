import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Admin/Sidebar'

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 ml-0 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} p-6 bg-gray-50`}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
