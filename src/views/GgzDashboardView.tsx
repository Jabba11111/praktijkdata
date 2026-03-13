import { useState, useEffect } from 'react'
import { api, DashboardStats, Afspraak, Client } from '../api'
import {
  Users,
  Calendar,
  Receipt,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)

const typeBadgeColor: Record<Afspraak['type'], string> = {
  intake: 'bg-purple-100 text-purple-800',
  consult: 'bg-blue-100 text-blue-800',
  crisis: 'bg-red-100 text-red-800',
  groep: 'bg-yellow-100 text-yellow-800',
  telefonisch: 'bg-green-100 text-green-800',
  ehealth: 'bg-teal-100 text-teal-800',
}

const zorgtypeLabel: Record<Client['zorgtype'], string> = {
  basis_ggz: 'Basis GGZ',
  specialistisch: 'Specialistisch',
  jeugd: 'Jeugd',
}

const zorgtypeBadgeColor: Record<Client['zorgtype'], string> = {
  basis_ggz: 'bg-sky-100 text-sky-800',
  specialistisch: 'bg-indigo-100 text-indigo-800',
  jeugd: 'bg-amber-100 text-amber-800',
}

const statusLabel: Record<Client['status'], string> = {
  actief: 'Actief',
  inactief: 'Inactief',
  wachtlijst: 'Wachtlijst',
}

const statusBadgeColor: Record<Client['status'], string> = {
  actief: 'bg-green-100 text-green-700',
  inactief: 'bg-gray-100 text-gray-600',
  wachtlijst: 'bg-orange-100 text-orange-700',
}

interface StatCard {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

export default function GgzDashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [afspraken, setAfspraken] = useState<Afspraak[]>([])
  const [clienten, setClienten] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, afsprakenData, clientenData] = await Promise.all([
          api.getStats(),
          api.getAfspraken(),
          api.getClienten(),
        ])
        setStats(statsData)
        setAfspraken(afsprakenData)
        setClienten(clientenData)
      } catch (err) {
        console.error('Fout bij laden dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          <p className="text-gray-500 text-sm">Dashboard laden...</p>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  const afsprakenVandaag = afspraken
    .filter((a) => a.datum === today && a.status !== 'geannuleerd')
    .sort((a, b) => a.starttijd.localeCompare(b.starttijd))

  const recenteClienten = [...clienten]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8)

  const cards: StatCard[] = [
    {
      label: 'Totaal cliënten',
      value: stats?.totaal_clienten ?? 0,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      label: 'Actieve cliënten',
      value: stats?.actieve_clienten ?? 0,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      label: 'Afspraken vandaag',
      value: stats?.afspraken_vandaag ?? 0,
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: 'Afspraken deze week',
      value: stats?.afspraken_week ?? 0,
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      label: 'Openstaande facturen',
      value: stats?.openstaande_facturen ?? 0,
      icon: <Receipt className="h-6 w-6" />,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      label: 'Omzet deze maand',
      value: formatCurrency(stats?.omzet_maand ?? 0),
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      label: 'ROM-metingen deze maand',
      value: stats?.rom_metingen_maand ?? 0,
      icon: <ClipboardList className="h-6 w-6" />,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      label: 'Wachtlijst',
      value: stats?.wachtlijst ?? 0,
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overzicht van uw GGZ-praktijk
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border p-4 flex items-start gap-4 ${card.color}`}
          >
            <div className="shrink-0 mt-0.5">{card.icon}</div>
            <div>
              <p className="text-sm font-medium opacity-80">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Afspraken vandaag */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              Afspraken vandaag
            </h2>
            <span className="text-xs font-medium bg-teal-100 text-teal-700 rounded-full px-2.5 py-0.5">
              {afsprakenVandaag.length}
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {afsprakenVandaag.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                Geen afspraken vandaag
              </p>
            ) : (
              afsprakenVandaag.map((afspraak) => (
                <div
                  key={afspraak.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-mono text-gray-500 shrink-0">
                      {afspraak.starttijd.slice(0, 5)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {afspraak.client_naam ?? `Cliënt ${afspraak.client_id}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadgeColor[afspraak.type]}`}
                    >
                      {afspraak.type}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recente cliënten */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Recente cliënten
            </h2>
            <span className="text-xs font-medium bg-teal-100 text-teal-700 rounded-full px-2.5 py-0.5">
              {recenteClienten.length}
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {recenteClienten.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                Geen cliënten gevonden
              </p>
            ) : (
              recenteClienten.map((client) => (
                <div
                  key={client.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {client.voornaam} {client.achternaam}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${zorgtypeBadgeColor[client.zorgtype]}`}
                    >
                      {zorgtypeLabel[client.zorgtype]}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeColor[client.status]}`}
                    >
                      {statusLabel[client.status]}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
