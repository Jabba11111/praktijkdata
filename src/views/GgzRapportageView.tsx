import { useState, useEffect } from 'react'
import { api, Client, Factuur, RomMeting, Afspraak } from '../api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { BarChart3, TrendingUp, Users, Euro, Calendar, Download } from 'lucide-react'

type Periode = 'maand' | 'kwartaal' | 'jaar' | 'alles'

const COLORS = ['#0054b4', '#059669', '#d97706', '#dc2626']

const MAAND_NAMEN = [
  'Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec',
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)

function getMaandSleutel(datum: string): string {
  const d = new Date(datum)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMaandLabel(sleutel: string): string {
  const [jaar, maand] = sleutel.split('-')
  return `${MAAND_NAMEN[parseInt(maand, 10) - 1]} ${jaar}`
}

function filterOpPeriode<T extends { datum?: string; aanmelddatum?: string; created_at?: string }>(
  items: T[],
  periode: Periode,
): T[] {
  if (periode === 'alles') return items
  const nu = new Date()
  let start: Date
  switch (periode) {
    case 'maand':
      start = new Date(nu.getFullYear(), nu.getMonth(), 1)
      break
    case 'kwartaal':
      start = new Date(nu.getFullYear(), Math.floor(nu.getMonth() / 3) * 3, 1)
      break
    case 'jaar':
      start = new Date(nu.getFullYear(), 0, 1)
      break
  }
  return items.filter((item) => {
    const datumStr = item.datum || item.aanmelddatum || item.created_at || ''
    if (!datumStr) return false
    return new Date(datumStr) >= start
  })
}

interface AfsprakenPerMaand {
  maand: string
  intake: number
  consult: number
  crisis: number
  groep: number
  telefonisch: number
  ehealth: number
}

interface OmzetPerMaand {
  maand: string
  omzet: number
}

interface ZorgtypeVerdeling {
  name: string
  value: number
}

interface RomScorePerMaand {
  maand: string
  'PHQ-9': number | null
  'GAD-7': number | null
}

interface PrestatieRegel {
  prestatiecode: string
  omschrijving: string
  aantal: number
  totaal: number
}

interface DeclaratieOverzicht {
  type: string
  aantal: number
  totaal: number
}

export default function GgzRapportageView() {
  const [periode, setPeriode] = useState<Periode>('kwartaal')
  const [clienten, setClienten] = useState<Client[]>([])
  const [facturen, setFacturen] = useState<Factuur[]>([])
  const [romMetingen, setRomMetingen] = useState<RomMeting[]>([])
  const [afspraken, setAfspraken] = useState<Afspraak[]>([])
  const [laden, setLaden] = useState(true)
  const [fout, setFout] = useState<string | null>(null)

  useEffect(() => {
    async function laadData() {
      setLaden(true)
      setFout(null)
      try {
        const [cl, fa, rom, af] = await Promise.all([
          api.getClienten(),
          api.getFacturen(),
          api.getRomMetingen(),
          api.getAfspraken(),
        ])
        setClienten(cl)
        setFacturen(fa)
        setRomMetingen(rom)
        setAfspraken(af)
      } catch (e: unknown) {
        setFout(e instanceof Error ? e.message : 'Er is een fout opgetreden bij het laden van de data.')
      } finally {
        setLaden(false)
      }
    }
    laadData()
  }, [])

  // Filtered data
  const gefilterdeClienten = filterOpPeriode(
    clienten.map((c) => ({ ...c, datum: c.aanmelddatum })),
    periode,
  )
  const gefilterdeFacturen = filterOpPeriode(facturen, periode)
  const gefilterdeRom = filterOpPeriode(romMetingen, periode)
  const gefilterdeAfspraken = filterOpPeriode(afspraken, periode)

  // KPI's
  const totaalClienten = gefilterdeClienten.length
  const actieveBehandelingen = clienten.filter((c) => c.status === 'actief').length
  const romScores = gefilterdeRom.filter((r) => r.score !== null).map((r) => r.score as number)
  const gemiddeldeRom = romScores.length > 0
    ? Math.round((romScores.reduce((a, b) => a + b, 0) / romScores.length) * 10) / 10
    : 0
  const omzetPeriode = gefilterdeFacturen
    .filter((f) => f.status === 'betaald')
    .reduce((sum, f) => sum + f.totaal, 0)

  // Chart 1: Afspraken per maand
  const afsprakenPerMaand: AfsprakenPerMaand[] = (() => {
    const map = new Map<string, AfsprakenPerMaand>()
    gefilterdeAfspraken.forEach((a) => {
      const sleutel = getMaandSleutel(a.datum)
      if (!map.has(sleutel)) {
        map.set(sleutel, { maand: getMaandLabel(sleutel), intake: 0, consult: 0, crisis: 0, groep: 0, telefonisch: 0, ehealth: 0 })
      }
      const entry = map.get(sleutel)!
      if (entry[a.type as keyof Omit<AfsprakenPerMaand, 'maand'>] !== undefined) {
        ;(entry as unknown as Record<string, number | string>)[a.type] =
          ((entry as unknown as Record<string, number | string>)[a.type] as number) + 1
      }
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
  })()

  // Chart 2: Omzet verloop
  const omzetPerMaand: OmzetPerMaand[] = (() => {
    const map = new Map<string, number>()
    gefilterdeFacturen
      .filter((f) => f.status === 'betaald')
      .forEach((f) => {
        const sleutel = getMaandSleutel(f.datum)
        map.set(sleutel, (map.get(sleutel) || 0) + f.totaal)
      })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sleutel, omzet]) => ({ maand: getMaandLabel(sleutel), omzet }))
  })()

  // Chart 3: Clienten per zorgtype
  const zorgtypeVerdeling: ZorgtypeVerdeling[] = (() => {
    const counts: Record<string, number> = { basis_ggz: 0, specialistisch: 0, jeugd: 0 }
    clienten.forEach((c) => {
      if (counts[c.zorgtype] !== undefined) {
        counts[c.zorgtype]++
      }
    })
    const labels: Record<string, string> = {
      basis_ggz: 'Basis GGZ',
      specialistisch: 'Specialistisch',
      jeugd: 'Jeugd',
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: labels[k] || k, value: v }))
  })()

  const zorgtypeTotaal = zorgtypeVerdeling.reduce((s, z) => s + z.value, 0)

  // Chart 4: ROM scores verloop
  const romScoresPerMaand: RomScorePerMaand[] = (() => {
    const map = new Map<string, { phq9: number[]; gad7: number[] }>()
    gefilterdeRom.forEach((r) => {
      if (r.score === null) return
      const sleutel = getMaandSleutel(r.datum)
      if (!map.has(sleutel)) {
        map.set(sleutel, { phq9: [], gad7: [] })
      }
      const entry = map.get(sleutel)!
      const code = (r.template_code || r.template_naam || '').toUpperCase()
      if (code.includes('PHQ')) {
        entry.phq9.push(r.score)
      } else if (code.includes('GAD')) {
        entry.gad7.push(r.score)
      }
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sleutel, data]) => ({
        maand: getMaandLabel(sleutel),
        'PHQ-9': data.phq9.length > 0
          ? Math.round((data.phq9.reduce((a, b) => a + b, 0) / data.phq9.length) * 10) / 10
          : null,
        'GAD-7': data.gad7.length > 0
          ? Math.round((data.gad7.reduce((a, b) => a + b, 0) / data.gad7.length) * 10) / 10
          : null,
      }))
  })()

  // Top prestaties
  const topPrestaties: PrestatieRegel[] = (() => {
    const map = new Map<string, PrestatieRegel>()
    gefilterdeFacturen.forEach((f) => {
      if (!f.regels) return
      f.regels.forEach((r) => {
        const key = r.prestatiecode
        if (!map.has(key)) {
          map.set(key, { prestatiecode: r.prestatiecode, omschrijving: r.omschrijving, aantal: 0, totaal: 0 })
        }
        const entry = map.get(key)!
        entry.aantal += r.aantal
        entry.totaal += r.totaal
      })
    })
    return Array.from(map.values())
      .sort((a, b) => b.totaal - a.totaal)
      .slice(0, 10)
  })()

  // Declaratie overzicht
  const declaratieOverzicht: DeclaratieOverzicht[] = (() => {
    const map = new Map<string, DeclaratieOverzicht>()
    const labels: Record<string, string> = {
      verzekerd: 'Verzekerd',
      onverzekerd: 'Onverzekerd',
      pgb: 'PGB',
    }
    gefilterdeFacturen.forEach((f) => {
      const key = f.declaratie_type
      if (!map.has(key)) {
        map.set(key, { type: labels[key] || key, aantal: 0, totaal: 0 })
      }
      const entry = map.get(key)!
      entry.aantal++
      entry.totaal += f.totaal
    })
    return Array.from(map.values()).sort((a, b) => b.totaal - a.totaal)
  })()

  if (laden) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 text-lg">Rapportage laden...</div>
      </div>
    )
  }

  if (fout) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500 text-lg">{fout}</div>
      </div>
    )
  }

  const periodeOpties: { key: Periode; label: string }[] = [
    { key: 'maand', label: 'Deze maand' },
    { key: 'kwartaal', label: 'Dit kwartaal' },
    { key: 'jaar', label: 'Dit jaar' },
    { key: 'alles', label: 'Alles' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-700" />
          <h1 className="text-2xl font-bold text-gray-900">Rapportage &amp; Analyse</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
          <Download className="w-4 h-4" />
          Exporteren
        </button>
      </div>

      {/* Periode selector */}
      <div className="flex gap-2">
        {periodeOpties.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setPeriode(opt.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              periode === opt.key
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Totaal cliënten</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{totaalClienten}</span>
            <TrendingUp className="w-4 h-4 text-green-500 mb-1" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Actieve behandelingen</span>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{actieveBehandelingen}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Gemiddelde ROM-score</span>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{gemiddeldeRom || '–'}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Omzet periode</span>
            <Euro className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(omzetPeriode)}</div>
        </div>
      </div>

      {/* Charts 2x2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Afspraken per maand */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Afspraken per maand</h2>
          <div className="h-72">
            {afsprakenPerMaand.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={afsprakenPerMaand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="maand" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="intake" name="Intake" fill="#0054b4" stackId="a" />
                  <Bar dataKey="consult" name="Consult" fill="#059669" stackId="a" />
                  <Bar dataKey="crisis" name="Crisis" fill="#dc2626" stackId="a" />
                  <Bar dataKey="groep" name="Groep" fill="#d97706" stackId="a" />
                  <Bar dataKey="telefonisch" name="Telefonisch" fill="#7c3aed" stackId="a" />
                  <Bar dataKey="ehealth" name="E-health" fill="#06b6d4" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Geen afspraken in deze periode
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Omzet verloop */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Omzet verloop</h2>
          <div className="h-72">
            {omzetPerMaand.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={omzetPerMaand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="maand" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="omzet"
                    name="Omzet"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ fill: '#059669', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Geen omzet data in deze periode
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Clienten per zorgtype */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliënten per zorgtype</h2>
          <div className="h-72">
            {zorgtypeVerdeling.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zorgtypeVerdeling}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }: { name: string; value: number }) =>
                      `${name} ${Math.round((value / zorgtypeTotaal) * 100)}%`
                    }
                  >
                    {zorgtypeVerdeling.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} cliënten`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Geen cliënt data beschikbaar
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: ROM Scores verloop */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ROM Scores verloop</h2>
          <div className="h-72">
            {romScoresPerMaand.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={romScoresPerMaand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="maand" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="PHQ-9"
                    name="PHQ-9"
                    stroke="#0054b4"
                    strokeWidth={2}
                    dot={{ fill: '#0054b4', r: 4 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="GAD-7"
                    name="GAD-7"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={{ fill: '#d97706', r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Geen ROM data in deze periode
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top prestaties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top prestaties</h2>
          {topPrestaties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-500">Code</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500">Omschrijving</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-500">Aantal</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-500">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {topPrestaties.map((p) => (
                    <tr key={p.prestatiecode} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 font-mono text-gray-700">{p.prestatiecode}</td>
                      <td className="py-2 px-2 text-gray-700">{p.omschrijving}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{p.aantal}</td>
                      <td className="py-2 px-2 text-right text-gray-900 font-medium">
                        {formatCurrency(p.totaal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 py-8 text-center">Geen prestatie data beschikbaar</div>
          )}
        </div>

        {/* Declaratie overzicht */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Declaratie overzicht</h2>
          {declaratieOverzicht.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-500">Type</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-500">Aantal</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-500">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {declaratieOverzicht.map((d) => (
                    <tr key={d.type} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 text-gray-700">{d.type}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{d.aantal}</td>
                      <td className="py-2 px-2 text-right text-gray-900 font-medium">
                        {formatCurrency(d.totaal)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-semibold">
                    <td className="py-2 px-2 text-gray-900">Totaal</td>
                    <td className="py-2 px-2 text-right text-gray-900">
                      {declaratieOverzicht.reduce((s, d) => s + d.aantal, 0)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-900">
                      {formatCurrency(declaratieOverzicht.reduce((s, d) => s + d.totaal, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 py-8 text-center">Geen declaratie data beschikbaar</div>
          )}
        </div>
      </div>
    </div>
  )
}
