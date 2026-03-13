import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  Euro,
  Wrench,
  ClipboardList,
  Menu,
  X,
  HelpCircle,
  Building2,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import GgzDashboardView from './views/GgzDashboardView'
import GgzClientenView from './views/GgzClientenView'
import GgzAgendaView from './views/GgzAgendaView'
import GgzFactureringView from './views/GgzFactureringView'
import GgzRomView from './views/GgzRomView'
import GgzRapportageView from './views/GgzRapportageView'
import EmailView from './views/EmailView'
import ConversatiesView from './views/ConversatiesView'
import BibliotheekView from './views/BibliotheekView'
import OverzichtenView from './views/OverzichtenView'
import FinancienView from './views/FinancienView'
import BeheerView from './views/BeheerView'

const primaryNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/email', label: 'E-mail', icon: Mail },
  { path: '/conversaties', label: 'Conversaties', icon: MessageSquare },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/clienten', label: 'Cli\u00ebnten', icon: Users },
  { path: '/bibliotheek', label: 'Bibliotheek', icon: BookOpen },
  { path: '/overzichten', label: 'Overzichten', icon: BarChart3 },
  { path: '/financien', label: 'Financi\u00ebn', icon: Euro },
  { path: '/beheer', label: 'Beheer', icon: Wrench },
]

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Primary sidebar - narrow icon bar like Praktijkdata */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[72px] bg-[#1a3a5c] flex flex-col transform transition-transform lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-12 border-b border-white/10">
          <span className="text-white font-bold text-xs tracking-wide">Praktijkdata</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col py-1 overflow-y-auto">
          {primaryNav.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 text-center transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Mobile close */}
        <button
          className="lg:hidden flex items-center justify-center p-3 text-white/70 hover:text-white"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-10 bg-white border-b border-gray-200 flex items-center px-4 text-sm shrink-0">
          <button
            className="lg:hidden p-1.5 rounded hover:bg-gray-100 mr-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-gray-500">
            <button className="flex items-center gap-1 hover:text-gray-700">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">ID:1 Demo Praktijk</span>
            </div>
            <button className="flex items-center gap-1 hover:text-gray-700">
              <div className="w-5 h-5 rounded-full bg-ggz-100 flex items-center justify-center">
                <span className="text-ggz-700 font-medium text-[9px]">TD</span>
              </div>
              <span className="hidden sm:inline">Tripje Duck</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<GgzDashboardView />} />
            <Route path="/email" element={<EmailView />} />
            <Route path="/conversaties" element={<ConversatiesView />} />
            <Route path="/agenda" element={<GgzAgendaView />} />
            <Route path="/clienten" element={<GgzClientenView />} />
            <Route path="/bibliotheek" element={<BibliotheekView />} />
            <Route path="/overzichten" element={<OverzichtenView />} />
            <Route path="/financien" element={<FinancienView />} />
            <Route path="/rom" element={<GgzRomView />} />
            <Route path="/rapportage" element={<GgzRapportageView />} />
            <Route path="/beheer" element={<BeheerView />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
