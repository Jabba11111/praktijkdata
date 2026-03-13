import { useState, useEffect } from 'react'
import { api, Factuur, FactuurRegel, Client } from '../api'
import {
  Receipt,
  Plus,
  Search,
  Eye,
  Send,
  Check,
  AlertTriangle,
  Euro,
  Filter,
  X,
  Save,
  Trash2,
} from 'lucide-react'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)

const PRESTATIE_CODES = [
  { code: '180001', omschrijving: 'Diagnostiek' },
  { code: '180002', omschrijving: 'Behandeling kort' },
  { code: '180003', omschrijving: 'Behandeling middel' },
  { code: '180004', omschrijving: 'Behandeling intensief' },
  { code: '180005', omschrijving: 'Chronisch' },
]

interface RegelForm {
  prestatiecode: string
  omschrijving: string
  datum: string
  aantal: number
  tarief: number
}

const statusColors: Record<Factuur['status'], string> = {
  concept: 'bg-gray-100 text-gray-700',
  verstuurd: 'bg-blue-100 text-blue-700',
  betaald: 'bg-green-100 text-green-700',
  herinnering: 'bg-orange-100 text-orange-700',
  oninbaar: 'bg-red-100 text-red-700',
}

const statusLabels: Record<Factuur['status'], string> = {
  concept: 'Concept',
  verstuurd: 'Verstuurd',
  betaald: 'Betaald',
  herinnering: 'Herinnering',
  oninbaar: 'Oninbaar',
}

function StatusBadge({ status }: { status: Factuur['status'] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  )
}

export default function GgzFactureringView() {
  const [facturen, setFacturen] = useState<Factuur[]>([])
  const [clienten, setClienten] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [zoekterm, setZoekterm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Factuur['status'] | ''>('')
  const [typeFilter, setTypeFilter] = useState<Factuur['declaratie_type'] | ''>('')
  const [showFilters, setShowFilters] = useState(false)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [selectedFactuur, setSelectedFactuur] = useState<Factuur | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formClientId, setFormClientId] = useState('')
  const [formDatum, setFormDatum] = useState('')
  const [formVervaldatum, setFormVervaldatum] = useState('')
  const [formDeclaratieType, setFormDeclaratieType] = useState<Factuur['declaratie_type']>('verzekerd')
  const [formNotities, setFormNotities] = useState('')
  const [formRegels, setFormRegels] = useState<RegelForm[]>([])

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [facturenData, clientenData] = await Promise.all([
        api.getFacturen(),
        api.getClienten(),
      ])
      setFacturen(facturenData)
      setClienten(clientenData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij laden van gegevens')
    } finally {
      setLoading(false)
    }
  }

  // Stats
  const totaalOpenstaand = facturen
    .filter((f) => f.status !== 'betaald' && f.status !== 'oninbaar')
    .reduce((sum, f) => sum + f.totaal, 0)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const betaaldDezeMaand = facturen
    .filter((f) => {
      if (f.status !== 'betaald') return false
      const d = new Date(f.datum)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, f) => sum + f.totaal, 0)

  const aantalVerstuurd = facturen.filter((f) => f.status === 'verstuurd').length
  const aantalConcept = facturen.filter((f) => f.status === 'concept').length

  // Filtered list
  const gefilterdeFacturen = facturen.filter((f) => {
    if (zoekterm) {
      const term = zoekterm.toLowerCase()
      const matchNummer = f.factuurnummer.toLowerCase().includes(term)
      const matchNaam = f.client_naam?.toLowerCase().includes(term)
      if (!matchNummer && !matchNaam) return false
    }
    if (statusFilter && f.status !== statusFilter) return false
    if (typeFilter && f.declaratie_type !== typeFilter) return false
    return true
  })

  function openNieuw() {
    setSelectedFactuur(null)
    setFormClientId('')
    setFormDatum(today)
    const vd = new Date()
    vd.setDate(vd.getDate() + 30)
    setFormVervaldatum(vd.toISOString().slice(0, 10))
    setFormDeclaratieType('verzekerd')
    setFormNotities('')
    setFormRegels([])
    setShowModal(true)
  }

  async function openDetail(factuur: Factuur) {
    try {
      const detail = await api.getFactuur(factuur.id)
      setSelectedFactuur(detail)
      setFormClientId(detail.client_id)
      setFormDatum(detail.datum)
      setFormVervaldatum(detail.vervaldatum)
      setFormDeclaratieType(detail.declaratie_type)
      setFormNotities(detail.notities)
      setFormRegels(
        (detail.regels || []).map((r) => ({
          prestatiecode: r.prestatiecode,
          omschrijving: r.omschrijving,
          datum: r.datum,
          aantal: r.aantal,
          tarief: r.tarief,
        }))
      )
      setShowModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij laden van factuur')
    }
  }

  function addRegel() {
    setFormRegels([
      ...formRegels,
      { prestatiecode: '', omschrijving: '', datum: today, aantal: 1, tarief: 0 },
    ])
  }

  function updateRegel(index: number, field: keyof RegelForm, value: string | number) {
    const updated = [...formRegels]
    updated[index] = { ...updated[index], [field]: value }

    // Auto-fill omschrijving from prestatiecode
    if (field === 'prestatiecode') {
      const match = PRESTATIE_CODES.find((p) => p.code === value)
      if (match) {
        updated[index].omschrijving = match.omschrijving
      }
    }

    setFormRegels(updated)
  }

  function removeRegel(index: number) {
    setFormRegels(formRegels.filter((_, i) => i !== index))
  }

  function regelTotaal(regel: RegelForm) {
    return regel.aantal * regel.tarief
  }

  const factuurTotaal = formRegels.reduce((sum, r) => sum + regelTotaal(r), 0)

  async function handleSave() {
    if (!formClientId) {
      setError('Selecteer een cliënt')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const data = {
        client_id: formClientId,
        datum: formDatum,
        vervaldatum: formVervaldatum,
        declaratie_type: formDeclaratieType,
        notities: formNotities,
        regels: formRegels.map((r) => ({
          prestatiecode: r.prestatiecode,
          omschrijving: r.omschrijving,
          datum: r.datum,
          aantal: r.aantal,
          tarief: r.tarief,
          totaal: regelTotaal(r),
        })),
      }
      await api.createFactuur(data as Parameters<typeof api.createFactuur>[0])
      setShowModal(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setError(null)
    try {
      await api.updateFactuurStatus(id, newStatus)
      await loadData()
      if (selectedFactuur && selectedFactuur.id === id) {
        const updated = await api.getFactuur(id)
        setSelectedFactuur(updated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij statuswijziging')
    }
  }

  function clientNaam(clientId: string) {
    const c = clienten.find((cl) => cl.id === clientId)
    return c ? `${c.voornaam} ${c.achternaam}` : clientId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Facturering</h1>
        </div>
        <button
          onClick={openNieuw}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nieuwe factuur
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Euro className="h-4 w-4" />
            Totaal openstaand
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totaalOpenstaand)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Check className="h-4 w-4" />
            Betaald deze maand
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(betaaldDezeMaand)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Send className="h-4 w-4" />
            Verstuurd
          </div>
          <div className="text-2xl font-bold text-blue-600">{aantalVerstuurd}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Receipt className="h-4 w-4" />
            Concept
          </div>
          <div className="text-2xl font-bold text-gray-600">{aantalConcept}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Zoeken op factuurnummer of cliëntnaam..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
              showFilters || statusFilter || typeFilter
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Factuur['status'] | '')}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Alle</option>
                <option value="concept">Concept</option>
                <option value="verstuurd">Verstuurd</option>
                <option value="betaald">Betaald</option>
                <option value="herinnering">Herinnering</option>
                <option value="oninbaar">Oninbaar</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Declaratie type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as Factuur['declaratie_type'] | '')}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Alle</option>
                <option value="verzekerd">Verzekerd</option>
                <option value="onverzekerd">Onverzekerd</option>
                <option value="pgb">PGB</option>
              </select>
            </div>
            {(statusFilter || typeFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('')
                  setTypeFilter('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Filters wissen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factuurnummer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliënt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vervaldatum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Totaal
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gefilterdeFacturen.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Geen facturen gevonden
                  </td>
                </tr>
              ) : (
                gefilterdeFacturen.map((factuur) => (
                  <tr
                    key={factuur.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(factuur)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {factuur.factuurnummer}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {factuur.client_naam || clientNaam(factuur.client_id)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{factuur.datum}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{factuur.vervaldatum}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                      {factuur.declaratie_type}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={factuur.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(factuur.totaal)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetail(factuur)
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Bekijken"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full my-8 z-10">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedFactuur ? `Factuur ${selectedFactuur.factuurnummer}` : 'Nieuwe factuur'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Status & Vecozo */}
                {selectedFactuur && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Status:</span>
                      <StatusBadge status={selectedFactuur.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Vecozo:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {selectedFactuur.vecozo_status || 'Niet ingediend'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliënt</label>
                    <select
                      value={formClientId}
                      onChange={(e) => setFormClientId(e.target.value)}
                      disabled={!!selectedFactuur}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Selecteer een cliënt...</option>
                      {clienten.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.voornaam} {c.achternaam} ({c.bsn})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Declaratie type
                    </label>
                    <select
                      value={formDeclaratieType}
                      onChange={(e) =>
                        setFormDeclaratieType(e.target.value as Factuur['declaratie_type'])
                      }
                      disabled={!!selectedFactuur}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="verzekerd">Verzekerd</option>
                      <option value="onverzekerd">Onverzekerd</option>
                      <option value="pgb">PGB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                    <input
                      type="date"
                      value={formDatum}
                      onChange={(e) => setFormDatum(e.target.value)}
                      disabled={!!selectedFactuur}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vervaldatum
                    </label>
                    <input
                      type="date"
                      value={formVervaldatum}
                      onChange={(e) => setFormVervaldatum(e.target.value)}
                      disabled={!!selectedFactuur}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
                  <textarea
                    value={formNotities}
                    onChange={(e) => setFormNotities(e.target.value)}
                    disabled={!!selectedFactuur}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Opmerkingen bij deze factuur..."
                  />
                </div>

                {/* Invoice lines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Factuurregels</h3>
                    {!selectedFactuur && (
                      <button
                        onClick={addRegel}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-4 w-4" />
                        Regel toevoegen
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Prestatiecode
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Omschrijving
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Datum
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Aantal
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Tarief
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Totaal
                          </th>
                          {!selectedFactuur && (
                            <th className="px-3 py-2 w-10" />
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formRegels.length === 0 ? (
                          <tr>
                            <td
                              colSpan={selectedFactuur ? 6 : 7}
                              className="px-3 py-4 text-center text-sm text-gray-400"
                            >
                              Geen regels toegevoegd
                            </td>
                          </tr>
                        ) : (
                          formRegels.map((regel, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2">
                                {selectedFactuur ? (
                                  <span className="text-sm text-gray-900">{regel.prestatiecode}</span>
                                ) : (
                                  <select
                                    value={regel.prestatiecode}
                                    onChange={(e) =>
                                      updateRegel(index, 'prestatiecode', e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">Kies...</option>
                                    {PRESTATIE_CODES.map((p) => (
                                      <option key={p.code} value={p.code}>
                                        {p.code} - {p.omschrijving}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {selectedFactuur ? (
                                  <span className="text-sm text-gray-900">{regel.omschrijving}</span>
                                ) : (
                                  <input
                                    type="text"
                                    value={regel.omschrijving}
                                    onChange={(e) =>
                                      updateRegel(index, 'omschrijving', e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Omschrijving"
                                  />
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {selectedFactuur ? (
                                  <span className="text-sm text-gray-500">{regel.datum}</span>
                                ) : (
                                  <input
                                    type="date"
                                    value={regel.datum}
                                    onChange={(e) =>
                                      updateRegel(index, 'datum', e.target.value)
                                    }
                                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {selectedFactuur ? (
                                  <span className="text-sm text-gray-900 text-right block">
                                    {regel.aantal}
                                  </span>
                                ) : (
                                  <input
                                    type="number"
                                    min="1"
                                    value={regel.aantal}
                                    onChange={(e) =>
                                      updateRegel(index, 'aantal', Number(e.target.value))
                                    }
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {selectedFactuur ? (
                                  <span className="text-sm text-gray-900 text-right block">
                                    {formatCurrency(regel.tarief)}
                                  </span>
                                ) : (
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={regel.tarief}
                                    onChange={(e) =>
                                      updateRegel(index, 'tarief', Number(e.target.value))
                                    }
                                    className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                )}
                              </td>
                              <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                                {formatCurrency(regelTotaal(regel))}
                              </td>
                              {!selectedFactuur && (
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => removeRegel(index)}
                                    className="text-red-400 hover:text-red-600"
                                    title="Verwijderen"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td
                            colSpan={selectedFactuur ? 5 : 5}
                            className="px-3 py-2 text-right text-sm font-semibold text-gray-700"
                          >
                            Totaal
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-bold text-gray-900">
                            {formatCurrency(
                              selectedFactuur && formRegels.length === 0
                                ? selectedFactuur.totaal
                                : factuurTotaal
                            )}
                          </td>
                          {!selectedFactuur && <td />}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex items-center gap-2">
                  {selectedFactuur && selectedFactuur.status === 'concept' && (
                    <button
                      onClick={() => handleStatusChange(selectedFactuur.id, 'verstuurd')}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      Markeren als verstuurd
                    </button>
                  )}
                  {selectedFactuur &&
                    (selectedFactuur.status === 'verstuurd' ||
                      selectedFactuur.status === 'herinnering') && (
                      <button
                        onClick={() => handleStatusChange(selectedFactuur.id, 'betaald')}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Markeren als betaald
                      </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm transition-colors"
                  >
                    {selectedFactuur ? 'Sluiten' : 'Annuleren'}
                  </button>
                  {!selectedFactuur && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Opslaan...' : 'Opslaan'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
