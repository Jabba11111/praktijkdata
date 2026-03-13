import { useState, useEffect } from 'react'
import { api, Client, DossierNotitie, Behandelplan, Correspondentie, RomMeting } from '../api'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  ClipboardList,
  Mail,
  ChevronLeft,
  Save,
  X,
  Filter,
} from 'lucide-react'

type Tab = 'gegevens' | 'dossier' | 'behandelplan' | 'rom' | 'correspondentie'

const emptyClient: Partial<Client> = {
  voornaam: '',
  achternaam: '',
  geboortedatum: '',
  bsn: '',
  email: '',
  telefoon: '',
  adres: '',
  postcode: '',
  woonplaats: '',
  verzekeraar: '',
  polisnummer: '',
  huisarts: '',
  verwijzer: '',
  zorgtype: 'basis_ggz',
  zorgvraagtypering: '',
  status: 'actief',
  aanmelddatum: new Date().toISOString().split('T')[0],
  notities: '',
}

const emptyNotitie: Partial<DossierNotitie> = {
  datum: new Date().toISOString().split('T')[0],
  type: 'consult',
  onderwerp: '',
  inhoud: '',
  behandelaar: '',
}

const emptyBehandelplan: Partial<Behandelplan> = {
  diagnose_code: '',
  diagnose_omschrijving: '',
  hoofdklacht: '',
  behandeldoelen: '',
  interventies: '',
  startdatum: new Date().toISOString().split('T')[0],
  einddatum: '',
  status: 'actief',
  evaluatie: '',
}

const emptyCorrespondentie: Partial<Correspondentie> = {
  datum: new Date().toISOString().split('T')[0],
  type: 'email',
  richting: 'uitgaand',
  onderwerp: '',
  inhoud: '',
  ontvanger_afzender: '',
}

function zorgtypeBadge(zorgtype: string) {
  const styles: Record<string, string> = {
    basis_ggz: 'bg-blue-100 text-blue-800',
    specialistisch: 'bg-purple-100 text-purple-800',
    jeugd: 'bg-orange-100 text-orange-800',
  }
  const labels: Record<string, string> = {
    basis_ggz: 'Basis GGZ',
    specialistisch: 'Specialistisch',
    jeugd: 'Jeugd',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[zorgtype] || 'bg-gray-100 text-gray-800'}`}>
      {labels[zorgtype] || zorgtype}
    </span>
  )
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    actief: 'bg-green-100 text-green-800',
    inactief: 'bg-gray-100 text-gray-800',
    wachtlijst: 'bg-yellow-100 text-yellow-800',
    afgerond: 'bg-blue-100 text-blue-800',
    onderbroken: 'bg-red-100 text-red-800',
  }
  const labels: Record<string, string> = {
    actief: 'Actief',
    inactief: 'Inactief',
    wachtlijst: 'Wachtlijst',
    afgerond: 'Afgerond',
    onderbroken: 'Onderbroken',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}

function notitieTypeBadge(type: string) {
  const styles: Record<string, string> = {
    consult: 'bg-blue-100 text-blue-800',
    intake: 'bg-green-100 text-green-800',
    aantekening: 'bg-yellow-100 text-yellow-800',
    brief: 'bg-purple-100 text-purple-800',
    verslag: 'bg-indigo-100 text-indigo-800',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

function romTypeBadge(type: string) {
  const styles: Record<string, string> = {
    voormeting: 'bg-blue-100 text-blue-800',
    tussenmeting: 'bg-yellow-100 text-yellow-800',
    nameting: 'bg-green-100 text-green-800',
  }
  const labels: Record<string, string> = {
    voormeting: 'Voormeting',
    tussenmeting: 'Tussenmeting',
    nameting: 'Nameting',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
      {labels[type] || type}
    </span>
  )
}

function richtingBadge(richting: string) {
  const styles: Record<string, string> = {
    inkomend: 'bg-blue-100 text-blue-800',
    uitgaand: 'bg-green-100 text-green-800',
  }
  const labels: Record<string, string> = {
    inkomend: 'Inkomend',
    uitgaand: 'Uitgaand',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[richting] || 'bg-gray-100 text-gray-800'}`}>
      {labels[richting] || richting}
    </span>
  )
}

export default function GgzClientenView() {
  // List mode state
  const [clienten, setClienten] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [zoekterm, setZoekterm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterZorgtype, setFilterZorgtype] = useState<string | null>(null)

  // Detail mode state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isNewClient, setIsNewClient] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('gegevens')
  const [clientForm, setClientForm] = useState<Partial<Client>>(emptyClient)
  const [saving, setSaving] = useState(false)

  // Dossier state
  const [notities, setNotities] = useState<DossierNotitie[]>([])
  const [showNotitieForm, setShowNotitieForm] = useState(false)
  const [notitieForm, setNotitieForm] = useState<Partial<DossierNotitie>>(emptyNotitie)

  // Behandelplan state
  const [behandelplannen, setBehandelplannen] = useState<Behandelplan[]>([])
  const [showBehandelplanForm, setShowBehandelplanForm] = useState(false)
  const [behandelplanForm, setBehandelplanForm] = useState<Partial<Behandelplan>>(emptyBehandelplan)

  // ROM state
  const [romMetingen, setRomMetingen] = useState<RomMeting[]>([])

  // Correspondentie state
  const [correspondentie, setCorrespondentie] = useState<Correspondentie[]>([])
  const [showCorrespondentieForm, setShowCorrespondentieForm] = useState(false)
  const [correspondentieForm, setCorrespondentieForm] = useState<Partial<Correspondentie>>(emptyCorrespondentie)

  // Load clients list
  useEffect(() => {
    loadClienten()
  }, [])

  async function loadClienten() {
    setLoading(true)
    try {
      const data = await api.getClienten()
      setClienten(data)
    } catch (err) {
      console.error('Fout bij laden cliënten:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load detail data when client is selected
  useEffect(() => {
    if (selectedClient && !isNewClient) {
      loadDetailData(selectedClient.id)
    }
  }, [selectedClient, activeTab, isNewClient])

  async function loadDetailData(clientId: string) {
    try {
      if (activeTab === 'dossier') {
        const data = await api.getDossierNotities(clientId)
        setNotities(data)
      } else if (activeTab === 'behandelplan') {
        const data = await api.getBehandelplannen(clientId)
        setBehandelplannen(data)
      } else if (activeTab === 'rom') {
        const data = await api.getRomMetingen({ client_id: clientId })
        setRomMetingen(data)
      } else if (activeTab === 'correspondentie') {
        const data = await api.getCorrespondentie(clientId)
        setCorrespondentie(data)
      }
    } catch (err) {
      console.error('Fout bij laden detailgegevens:', err)
    }
  }

  // Filter clients
  const gefilterdeClienten = clienten.filter((c) => {
    const naamMatch =
      zoekterm === '' ||
      `${c.voornaam} ${c.achternaam}`.toLowerCase().includes(zoekterm.toLowerCase())
    const statusMatch = filterStatus === null || c.status === filterStatus
    const zorgtypeMatch = filterZorgtype === null || c.zorgtype === filterZorgtype
    return naamMatch && statusMatch && zorgtypeMatch
  })

  // Open client detail
  function openClient(client: Client) {
    setSelectedClient(client)
    setClientForm({ ...client })
    setActiveTab('gegevens')
    setIsNewClient(false)
    setShowNotitieForm(false)
    setShowBehandelplanForm(false)
    setShowCorrespondentieForm(false)
  }

  // New client
  function nieuweClient() {
    setSelectedClient(null)
    setClientForm({ ...emptyClient })
    setActiveTab('gegevens')
    setIsNewClient(true)
    setShowNotitieForm(false)
    setShowBehandelplanForm(false)
    setShowCorrespondentieForm(false)
  }

  // Back to list
  function backToList() {
    setSelectedClient(null)
    setIsNewClient(false)
    setActiveTab('gegevens')
    setShowNotitieForm(false)
    setShowBehandelplanForm(false)
    setShowCorrespondentieForm(false)
    loadClienten()
  }

  // Save client
  async function saveClient() {
    setSaving(true)
    try {
      if (isNewClient) {
        const created = await api.createClient(clientForm)
        setSelectedClient(created)
        setClientForm({ ...created })
        setIsNewClient(false)
      } else if (selectedClient) {
        const updated = await api.updateClient(selectedClient.id, clientForm)
        setSelectedClient(updated)
        setClientForm({ ...updated })
      }
    } catch (err) {
      console.error('Fout bij opslaan cliënt:', err)
    } finally {
      setSaving(false)
    }
  }

  // Delete client
  async function deleteClient(client: Client) {
    if (!window.confirm(`Weet u zeker dat u ${client.voornaam} ${client.achternaam} wilt verwijderen?`)) return
    try {
      await api.deleteClient(client.id)
      loadClienten()
    } catch (err) {
      console.error('Fout bij verwijderen cliënt:', err)
    }
  }

  // Save dossier notitie
  async function saveNotitie() {
    if (!selectedClient) return
    setSaving(true)
    try {
      await api.createDossierNotitie(selectedClient.id, notitieForm)
      setShowNotitieForm(false)
      setNotitieForm({ ...emptyNotitie })
      const data = await api.getDossierNotities(selectedClient.id)
      setNotities(data)
    } catch (err) {
      console.error('Fout bij opslaan notitie:', err)
    } finally {
      setSaving(false)
    }
  }

  // Save behandelplan
  async function saveBehandelplan() {
    if (!selectedClient) return
    setSaving(true)
    try {
      await api.createBehandelplan(selectedClient.id, behandelplanForm)
      setShowBehandelplanForm(false)
      setBehandelplanForm({ ...emptyBehandelplan })
      const data = await api.getBehandelplannen(selectedClient.id)
      setBehandelplannen(data)
    } catch (err) {
      console.error('Fout bij opslaan behandelplan:', err)
    } finally {
      setSaving(false)
    }
  }

  // Save correspondentie
  async function saveCorrespondentie() {
    if (!selectedClient) return
    setSaving(true)
    try {
      await api.createCorrespondentie(selectedClient.id, correspondentieForm)
      setShowCorrespondentieForm(false)
      setCorrespondentieForm({ ...emptyCorrespondentie })
      const data = await api.getCorrespondentie(selectedClient.id)
      setCorrespondentie(data)
    } catch (err) {
      console.error('Fout bij opslaan correspondentie:', err)
    } finally {
      setSaving(false)
    }
  }

  // ---- RENDER: Detail/Edit Mode ----
  if (selectedClient || isNewClient) {
    const clientNaam = isNewClient
      ? 'Nieuwe cliënt'
      : `${selectedClient!.voornaam} ${selectedClient!.achternaam}`

    return (
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={backToList}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Terug naar overzicht
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ggz-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-ggz-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{clientNaam}</h1>
              {selectedClient && (
                <p className="text-sm text-gray-500">BSN: {selectedClient.bsn}</p>
              )}
            </div>
          </div>
          {selectedClient && (
            <div className="flex items-center gap-2">
              {zorgtypeBadge(selectedClient.zorgtype)}
              {statusBadge(selectedClient.status)}
            </div>
          )}
        </div>

        {/* Tabs */}
        {!isNewClient && (
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 -mb-px">
              {([
                { key: 'gegevens', label: 'Gegevens', icon: Edit },
                { key: 'dossier', label: 'Dossier', icon: FileText },
                { key: 'behandelplan', label: 'Behandelplan', icon: ClipboardList },
                { key: 'rom', label: 'ROM', icon: ClipboardList },
                { key: 'correspondentie', label: 'Correspondentie', icon: Mail },
              ] as { key: Tab; label: string; icon: typeof Edit }[]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-ggz-600 text-ggz-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* ---- Gegevens Tab ---- */}
          {(activeTab === 'gegevens' || isNewClient) && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Cliëntgegevens</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voornaam</label>
                  <input
                    type="text"
                    value={clientForm.voornaam || ''}
                    onChange={(e) => setClientForm({ ...clientForm, voornaam: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achternaam</label>
                  <input
                    type="text"
                    value={clientForm.achternaam || ''}
                    onChange={(e) => setClientForm({ ...clientForm, achternaam: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Geboortedatum</label>
                  <input
                    type="date"
                    value={clientForm.geboortedatum || ''}
                    onChange={(e) => setClientForm({ ...clientForm, geboortedatum: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BSN</label>
                  <input
                    type="text"
                    value={clientForm.bsn || ''}
                    onChange={(e) => setClientForm({ ...clientForm, bsn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={clientForm.email || ''}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
                  <input
                    type="text"
                    value={clientForm.telefoon || ''}
                    onChange={(e) => setClientForm({ ...clientForm, telefoon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                  <input
                    type="text"
                    value={clientForm.adres || ''}
                    onChange={(e) => setClientForm({ ...clientForm, adres: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={clientForm.postcode || ''}
                    onChange={(e) => setClientForm({ ...clientForm, postcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Woonplaats</label>
                  <input
                    type="text"
                    value={clientForm.woonplaats || ''}
                    onChange={(e) => setClientForm({ ...clientForm, woonplaats: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verzekeraar</label>
                  <input
                    type="text"
                    value={clientForm.verzekeraar || ''}
                    onChange={(e) => setClientForm({ ...clientForm, verzekeraar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Polisnummer</label>
                  <input
                    type="text"
                    value={clientForm.polisnummer || ''}
                    onChange={(e) => setClientForm({ ...clientForm, polisnummer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Huisarts</label>
                  <input
                    type="text"
                    value={clientForm.huisarts || ''}
                    onChange={(e) => setClientForm({ ...clientForm, huisarts: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verwijzer</label>
                  <input
                    type="text"
                    value={clientForm.verwijzer || ''}
                    onChange={(e) => setClientForm({ ...clientForm, verwijzer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zorgtype</label>
                  <select
                    value={clientForm.zorgtype || 'basis_ggz'}
                    onChange={(e) => setClientForm({ ...clientForm, zorgtype: e.target.value as Client['zorgtype'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  >
                    <option value="basis_ggz">Basis GGZ</option>
                    <option value="specialistisch">Specialistisch</option>
                    <option value="jeugd">Jeugd</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zorgvraagtypering</label>
                  <input
                    type="text"
                    value={clientForm.zorgvraagtypering || ''}
                    onChange={(e) => setClientForm({ ...clientForm, zorgvraagtypering: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={clientForm.status || 'actief'}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as Client['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  >
                    <option value="actief">Actief</option>
                    <option value="inactief">Inactief</option>
                    <option value="wachtlijst">Wachtlijst</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aanmelddatum</label>
                  <input
                    type="date"
                    value={clientForm.aanmelddatum || ''}
                    onChange={(e) => setClientForm({ ...clientForm, aanmelddatum: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
                  <textarea
                    value={clientForm.notities || ''}
                    onChange={(e) => setClientForm({ ...clientForm, notities: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={saveClient}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-ggz-600 text-white rounded-lg text-sm font-medium hover:bg-ggz-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
                <button
                  onClick={backToList}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* ---- Dossier Tab ---- */}
          {activeTab === 'dossier' && !isNewClient && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Dossiernotities</h2>
                <button
                  onClick={() => {
                    setShowNotitieForm(true)
                    setNotitieForm({ ...emptyNotitie })
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-ggz-600 text-white rounded-lg text-sm font-medium hover:bg-ggz-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nieuwe notitie
                </button>
              </div>

              {/* Inline notitie form */}
              {showNotitieForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Nieuwe notitie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                      <input
                        type="date"
                        value={notitieForm.datum || ''}
                        onChange={(e) => setNotitieForm({ ...notitieForm, datum: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={notitieForm.type || 'consult'}
                        onChange={(e) => setNotitieForm({ ...notitieForm, type: e.target.value as DossierNotitie['type'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      >
                        <option value="consult">Consult</option>
                        <option value="intake">Intake</option>
                        <option value="aantekening">Aantekening</option>
                        <option value="brief">Brief</option>
                        <option value="verslag">Verslag</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Behandelaar</label>
                      <input
                        type="text"
                        value={notitieForm.behandelaar || ''}
                        onChange={(e) => setNotitieForm({ ...notitieForm, behandelaar: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Onderwerp</label>
                      <input
                        type="text"
                        value={notitieForm.onderwerp || ''}
                        onChange={(e) => setNotitieForm({ ...notitieForm, onderwerp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud</label>
                      <textarea
                        value={notitieForm.inhoud || ''}
                        onChange={(e) => setNotitieForm({ ...notitieForm, inhoud: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={saveNotitie}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-ggz-600 text-white rounded-lg text-sm font-medium hover:bg-ggz-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Opslaan...' : 'Opslaan'}
                    </button>
                    <button
                      onClick={() => setShowNotitieForm(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              {/* Notities list */}
              {notities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nog geen dossiernotities</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Datum</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Onderwerp</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Behandelaar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notities.map((notitie) => (
                        <tr key={notitie.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3 text-gray-900">{notitie.datum}</td>
                          <td className="py-3 px-3">{notitieTypeBadge(notitie.type)}</td>
                          <td className="py-3 px-3 text-gray-900">{notitie.onderwerp}</td>
                          <td className="py-3 px-3 text-gray-600">{notitie.behandelaar}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---- Behandelplan Tab ---- */}
          {activeTab === 'behandelplan' && !isNewClient && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Behandelplannen</h2>
                <button
                  onClick={() => {
                    setShowBehandelplanForm(true)
                    setBehandelplanForm({ ...emptyBehandelplan })
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-ggz-600 text-white rounded-lg text-sm font-medium hover:bg-ggz-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nieuw plan
                </button>
              </div>

              {/* Inline behandelplan form */}
              {showBehandelplanForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Nieuw behandelplan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diagnose code</label>
                      <input
                        type="text"
                        value={behandelplanForm.diagnose_code || ''}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, diagnose_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diagnose omschrijving</label>
                      <input
                        type="text"
                        value={behandelplanForm.diagnose_omschrijving || ''}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, diagnose_omschrijving: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hoofdklacht</label>
                      <input
                        type="text"
                        value={behandelplanForm.hoofdklacht || ''}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, hoofdklacht: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Behandeldoelen</label>
                      <textarea
                        value={behandelplanForm.behandeldoelen || ''}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, behandeldoelen: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interventies</label>
                      <textarea
                        value={behandelplanForm.interventies || ''}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, interventies: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                      <input
                        type="date"
                        value={behandelplanForm.startdatum || ''}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, startdatum: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Einddatum</label>
                      <input
                        type="date"
                        value={behandelplanForm.einddatum || ''}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, einddatum: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={behandelplanForm.status || 'actief'}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, status: e.target.value as Behandelplan['status'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      >
                        <option value="actief">Actief</option>
                        <option value="afgerond">Afgerond</option>
                        <option value="onderbroken">Onderbroken</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Evaluatie</label>
                      <textarea
                        value={behandelplanForm.evaluatie || ''}
                        onChange={(e) => setBehandelplanForm({ ...behandelplanForm, evaluatie: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={saveBehandelplan}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-ggz-600 text-white rounded-lg text-sm font-medium hover:bg-ggz-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Opslaan...' : 'Opslaan'}
                    </button>
                    <button
                      onClick={() => setShowBehandelplanForm(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              {/* Behandelplannen list */}
              {behandelplannen.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nog geen behandelplannen</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {behandelplannen.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{plan.diagnose_code}</span>
                            {statusBadge(plan.status)}
                          </div>
                          <p className="text-sm text-gray-700">{plan.diagnose_omschrijving}</p>
                        </div>
                      </div>
                      {plan.hoofdklacht && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Hoofdklacht:</span> {plan.hoofdklacht}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>Start: {plan.startdatum}</span>
                        {plan.einddatum && <span>Eind: {plan.einddatum}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---- ROM Tab ---- */}
          {activeTab === 'rom' && !isNewClient && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">ROM Metingen</h2>
              </div>

              {romMetingen.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nog geen ROM metingen voor deze cliënt</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Datum</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Vragenlijst</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Score</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Interpretatie</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {romMetingen.map((meting) => (
                        <tr key={meting.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3 text-gray-900">{meting.datum}</td>
                          <td className="py-3 px-3 text-gray-900">{meting.template_naam || meting.template_id}</td>
                          <td className="py-3 px-3 text-gray-900 font-medium">
                            {meting.score !== null ? meting.score : '-'}
                          </td>
                          <td className="py-3 px-3 text-gray-600">{meting.interpretatie || '-'}</td>
                          <td className="py-3 px-3">{romTypeBadge(meting.type)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---- Correspondentie Tab ---- */}
          {activeTab === 'correspondentie' && !isNewClient && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Correspondentie</h2>
                <button
                  onClick={() => {
                    setShowCorrespondentieForm(true)
                    setCorrespondentieForm({ ...emptyCorrespondentie })
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-ggz-600 text-white rounded-lg text-sm font-medium hover:bg-ggz-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nieuw bericht
                </button>
              </div>

              {/* Inline correspondentie form */}
              {showCorrespondentieForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Nieuw bericht</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                      <input
                        type="date"
                        value={correspondentieForm.datum || ''}
                        onChange={(e) => setCorrespondentieForm({ ...correspondentieForm, datum: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={correspondentieForm.type || 'email'}
                        onChange={(e) => setCorrespondentieForm({ ...correspondentieForm, type: e.target.value as Correspondentie['type'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      >
                        <option value="brief">Brief</option>
                        <option value="email">E-mail</option>
                        <option value="zorgmail">Zorgmail</option>
                        <option value="zorgdomein">Zorgdomein</option>
                        <option value="fax">Fax</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Richting</label>
                      <select
                        value={correspondentieForm.richting || 'uitgaand'}
                        onChange={(e) => setCorrespondentieForm({ ...correspondentieForm, richting: e.target.value as Correspondentie['richting'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      >
                        <option value="inkomend">Inkomend</option>
                        <option value="uitgaand">Uitgaand</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Onderwerp</label>
                      <input
                        type="text"
                        value={correspondentieForm.onderwerp || ''}
                        onChange={(e) => setCorrespondentieForm({ ...correspondentieForm, onderwerp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ontvanger / Afzender</label>
                      <input
                        type="text"
                        value={correspondentieForm.ontvanger_afzender || ''}
                        onChange={(e) => setCorrespondentieForm({ ...correspondentieForm, ontvanger_afzender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud</label>
                      <textarea
                        value={correspondentieForm.inhoud || ''}
                        onChange={(e) => setCorrespondentieForm({ ...correspondentieForm, inhoud: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={saveCorrespondentie}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-ggz-600 text-white rounded-lg text-sm font-medium hover:bg-ggz-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Opslaan...' : 'Opslaan'}
                    </button>
                    <button
                      onClick={() => setShowCorrespondentieForm(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              {/* Correspondentie list */}
              {correspondentie.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nog geen correspondentie</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Datum</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Richting</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Onderwerp</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-500">Ontvanger / Afzender</th>
                      </tr>
                    </thead>
                    <tbody>
                      {correspondentie.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3 text-gray-900">{item.datum}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-3">{richtingBadge(item.richting)}</td>
                          <td className="py-3 px-3 text-gray-900">{item.onderwerp}</td>
                          <td className="py-3 px-3 text-gray-600">{item.ontvanger_afzender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- RENDER: List Mode ----
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cliënten & Dossiers</h1>
          <p className="text-sm text-gray-500 mt-1">{clienten.length} cliënten geregistreerd</p>
        </div>
        <button
          onClick={nieuweClient}
          className="flex items-center gap-2 px-4 py-2 bg-ggz-600 text-white rounded-lg text-sm font-medium hover:bg-ggz-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuwe cliënt
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek op naam..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ggz-500 focus:border-transparent"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500 mr-1">Status:</span>
          {(['actief', 'inactief', 'wachtlijst'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? null : s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-ggz-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <span className="text-xs font-medium text-gray-500 ml-3 mr-1">Zorgtype:</span>
          {([
            { value: 'basis_ggz', label: 'Basis GGZ' },
            { value: 'specialistisch', label: 'Specialistisch' },
            { value: 'jeugd', label: 'Jeugd' },
          ] as const).map((z) => (
            <button
              key={z.value}
              onClick={() => setFilterZorgtype(filterZorgtype === z.value ? null : z.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterZorgtype === z.value
                  ? 'bg-ggz-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-ggz-600 border-t-transparent rounded-full" />
            <span className="ml-3 text-sm text-gray-500">Laden...</span>
          </div>
        ) : gefilterdeClienten.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Geen cliënten gevonden</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Naam</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Geboortedatum</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">BSN</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Zorgtype</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Aanmelddatum</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Acties</th>
                </tr>
              </thead>
              <tbody>
                {gefilterdeClienten.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => openClient(client)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {client.voornaam} {client.achternaam}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{client.geboortedatum}</td>
                    <td className="py-3 px-4 text-gray-600">{client.bsn}</td>
                    <td className="py-3 px-4">{zorgtypeBadge(client.zorgtype)}</td>
                    <td className="py-3 px-4">{statusBadge(client.status)}</td>
                    <td className="py-3 px-4 text-gray-600">{client.aanmelddatum}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openClient(client)
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-ggz-600 hover:bg-ggz-50 transition-colors"
                          title="Bewerken"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteClient(client)
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
