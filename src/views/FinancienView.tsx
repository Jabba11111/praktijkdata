import { useState } from 'react'
import {
  Euro,
  TrendingUp,
  Receipt,
  CreditCard,
  AlertCircle,
  Download,
  Filter,
  PieChart,
} from 'lucide-react'

type TabKey = 'overzicht' | 'declaraties' | 'betalingen' | 'bankrekeningen'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overzicht', label: 'Overzicht' },
  { key: 'declaraties', label: 'Declaraties' },
  { key: 'betalingen', label: 'Betalingen' },
  { key: 'bankrekeningen', label: 'Bankrekeningen' },
]

interface KPI {
  label: string
  waarde: string
  icon: React.ReactNode
  kleur: string
  trend?: string
}

const kpis: KPI[] = [
  {
    label: 'Omzet YTD',
    waarde: '€ 78.250',
    icon: <Euro className="w-6 h-6" />,
    kleur: 'bg-green-50 text-green-600',
    trend: '+12% t.o.v. vorig jaar',
  },
  {
    label: 'Openstaand',
    waarde: '€ 15.050',
    icon: <AlertCircle className="w-6 h-6" />,
    kleur: 'bg-orange-50 text-orange-600',
    trend: '23 facturen',
  },
  {
    label: 'Betaald deze maand',
    waarde: '€ 8.200',
    icon: <CreditCard className="w-6 h-6" />,
    kleur: 'bg-blue-50 text-blue-600',
    trend: '14 betalingen',
  },
  {
    label: 'Gemiddeld per cliënt',
    waarde: '€ 1.245',
    icon: <PieChart className="w-6 h-6" />,
    kleur: 'bg-purple-50 text-purple-600',
    trend: '63 actieve cliënten',
  },
]

const maandOverzicht = [
  { maand: 'Januari 2026', gedeclareerd: '€ 28.450', betaald: '€ 26.200', openstaand: '€ 2.250', verschil: '€ 0' },
  { maand: 'Februari 2026', gedeclareerd: '€ 31.200', betaald: '€ 28.800', openstaand: '€ 2.400', verschil: '€ 0' },
  { maand: 'Maart 2026', gedeclareerd: '€ 18.600', betaald: '€ 8.200', openstaand: '€ 10.400', verschil: '€ 0' },
]

const declaraties = [
  { id: 'D-2026-0145', client: 'Mw. A. Jansen', prestatie: 'Basis GGZ Kort', bedrag: '€ 522,13', verzekeraar: 'Zilveren Kruis', status: 'Goedgekeurd', datum: '10 mrt 2026' },
  { id: 'D-2026-0144', client: 'Dhr. R. Bakker', prestatie: 'SGGZ Consult', bedrag: '€ 128,95', verzekeraar: 'CZ', status: 'Ingediend', datum: '09 mrt 2026' },
  { id: 'D-2026-0143', client: 'Mw. S. de Vries', prestatie: 'SGGZ Consult', bedrag: '€ 128,95', verzekeraar: 'VGZ', status: 'Betaald', datum: '08 mrt 2026' },
  { id: 'D-2026-0142', client: 'Dhr. K. Yilmaz', prestatie: 'Basis GGZ Middel', bedrag: '€ 1.434,96', verzekeraar: 'Menzis', status: 'Ingediend', datum: '07 mrt 2026' },
  { id: 'D-2026-0141', client: 'Mw. L. Visser', prestatie: 'SGGZ Consult', bedrag: '€ 128,95', verzekeraar: 'Zilveren Kruis', status: 'Afgewezen', datum: '06 mrt 2026' },
  { id: 'D-2026-0140', client: 'Dhr. J. Hendriks', prestatie: 'Basis GGZ Intensief', bedrag: '€ 1.903,54', verzekeraar: 'CZ', status: 'Goedgekeurd', datum: '05 mrt 2026' },
  { id: 'D-2026-0139', client: 'Mw. F. Bosman', prestatie: 'SGGZ Consult', bedrag: '€ 128,95', verzekeraar: 'VGZ', status: 'Betaald', datum: '04 mrt 2026' },
]

const betalingen = [
  { datum: '12 mrt 2026', client: 'Mw. S. de Vries', bedrag: '€ 128,95', methode: 'Verzekeraar', referentie: 'VGZ-2026-84521' },
  { datum: '11 mrt 2026', client: 'Mw. F. Bosman', bedrag: '€ 128,95', methode: 'Verzekeraar', referentie: 'VGZ-2026-84490' },
  { datum: '10 mrt 2026', client: 'Dhr. P. Smits', bedrag: '€ 95,00', methode: 'iDEAL', referentie: 'IDL-2026-33201' },
  { datum: '09 mrt 2026', client: 'Zilveren Kruis (batch)', bedrag: '€ 4.280,00', methode: 'Verzekeraar', referentie: 'ZK-2026-BATCH-0312' },
  { datum: '08 mrt 2026', client: 'Mw. D. Mulder', bedrag: '€ 45,00', methode: 'Eigen bijdrage', referentie: 'EB-2026-0089' },
  { datum: '07 mrt 2026', client: 'CZ (batch)', bedrag: '€ 3.550,00', methode: 'Verzekeraar', referentie: 'CZ-2026-BATCH-0311' },
]

const bankrekeningen = [
  {
    naam: 'Zakelijke rekening',
    iban: 'NL91 ABNA 0417 1643 00',
    saldo: '€ 42.380,55',
    laatsteSynchronisatie: '13 mrt 2026, 07:00',
    bank: 'ABN AMRO',
  },
  {
    naam: 'Spaarrekening',
    iban: 'NL20 ABNA 0585 9904 12',
    saldo: '€ 85.000,00',
    laatsteSynchronisatie: '13 mrt 2026, 07:00',
    bank: 'ABN AMRO',
  },
  {
    naam: 'Belastingreservering',
    iban: 'NL53 RABO 0315 5836 79',
    saldo: '€ 18.750,00',
    laatsteSynchronisatie: '12 mrt 2026, 23:00',
    bank: 'Rabobank',
  },
]

const statusKleur: Record<string, string> = {
  Ingediend: 'bg-yellow-100 text-yellow-800',
  Goedgekeurd: 'bg-blue-100 text-blue-800',
  Afgewezen: 'bg-red-100 text-red-800',
  Betaald: 'bg-green-100 text-green-800',
}

export default function FinancienView() {
  const [actieveTab, setActieveTab] = useState<TabKey>('overzicht')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financiën</h1>
          <p className="text-gray-500 mt-1">Financieel overzicht en declaratiebeheer</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">
            <Download className="w-4 h-4" />
            Exporteer
          </button>
        </div>
      </div>

      {/* KPI kaarten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-gray-200 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.kleur}`}>{kpi.icon}</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpi.waarde}</div>
            {kpi.trend && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{kpi.trend}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActieveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              actieveTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {actieveTab === 'overzicht' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Maandelijks omzetoverzicht</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Maand</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Gedeclareerd</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Betaald</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Openstaand</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Verschil</th>
                </tr>
              </thead>
              <tbody>
                {maandOverzicht.map((rij, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{rij.maand}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{rij.gedeclareerd}</td>
                    <td className="px-6 py-3 text-sm text-green-700">{rij.betaald}</td>
                    <td className="px-6 py-3 text-sm text-orange-600">{rij.openstaand}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{rij.verschil}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                  <td className="px-6 py-3 text-sm text-gray-900">Totaal YTD</td>
                  <td className="px-6 py-3 text-sm text-gray-900">€ 78.250</td>
                  <td className="px-6 py-3 text-sm text-green-700">€ 63.200</td>
                  <td className="px-6 py-3 text-sm text-orange-600">€ 15.050</td>
                  <td className="px-6 py-3 text-sm text-gray-900">€ 0</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {actieveTab === 'declaraties' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Declaraties</h3>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Vecozo-status</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Declaratie-ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Cliënt</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Prestatie</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Bedrag</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Verzekeraar</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Datum</th>
                </tr>
              </thead>
              <tbody>
                {declaraties.map((decl, i) => (
                  <tr key={decl.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-3 text-sm font-mono text-gray-600">{decl.id}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{decl.client}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{decl.prestatie}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">{decl.bedrag}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{decl.verzekeraar}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusKleur[decl.status] || 'bg-gray-100 text-gray-600'}`}>
                        {decl.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{decl.datum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {actieveTab === 'betalingen' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recente betalingen</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Datum</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Cliënt</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Bedrag</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Methode</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Referentie</th>
                </tr>
              </thead>
              <tbody>
                {betalingen.map((bet, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-3 text-sm text-gray-700">{bet.datum}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{bet.client}</td>
                    <td className="px-6 py-3 text-sm text-green-700 font-medium">{bet.bedrag}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{bet.methode}</td>
                    <td className="px-6 py-3 text-sm font-mono text-gray-500">{bet.referentie}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {actieveTab === 'bankrekeningen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankrekeningen.map((rek, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">{rek.bank}</span>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Verbonden
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{rek.naam}</h3>
              <p className="text-sm text-gray-500 font-mono mb-4">{rek.iban}</p>
              <div className="border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Saldo</span>
                <p className="text-2xl font-bold text-gray-900">{rek.saldo}</p>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Laatst gesynchroniseerd: {rek.laatsteSynchronisatie}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
