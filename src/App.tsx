import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Receipt,
  ClipboardList,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import GgzDashboardView from './views/GgzDashboardView'
import GgzClientenView from './views/GgzClientenView'
import GgzAgendaView from './views/GgzAgendaView'
import GgzFactureringView from './views/GgzFactureringView'
import GgzRomView from './views/GgzRomView'
import GgzRapportageView from './views/GgzRapportageView'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clienten', label: 'Cli\u00ebnten & Dossiers', icon: Users },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/facturering', label: 'Facturering', icon: Receipt },
  { path: '/rom', label: 'ROM & Vragenlijsten', icon: ClipboardList },
  { path: '/rapportage', label: 'Rapportage', icon: BarChart3 },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ggz-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PD</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">PraktijkData</h1>
              <p className="text-xs text-gray-500">GGZ Software</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ggz-50 text-ggz-700 border border-ggz-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-ggz-100 flex items-center justify-center">
              <span className="text-ggz-700 font-medium text-xs">BH</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Behandelaar</p>
              <p className="text-xs text-gray-500 truncate">GGZ Praktijk</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-3"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Verbonden
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<GgzDashboardView />} />
            <Route path="/clienten" element={<GgzClientenView />} />
            <Route path="/agenda" element={<GgzAgendaView />} />
            <Route path="/facturering" element={<GgzFactureringView />} />
            <Route path="/rom" element={<GgzRomView />} />
            <Route path="/rapportage" element={<GgzRapportageView />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
