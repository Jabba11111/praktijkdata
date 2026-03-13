import { useState } from 'react'
import { Settings, Plus, Edit, Trash2, Save, X, Check } from 'lucide-react'

// Types for each section
interface BeheerItem {
  id: string
  naam: string
  [key: string]: unknown
}

interface AfspraakStatus extends BeheerItem {
  factureren: string
  standaard: boolean
}

interface AfspraakType extends BeheerItem {
  kleur: string
  duur: number
  factureerbaar: boolean
}

interface Locatie extends BeheerItem {
  adres: string
  postcode: string
  plaats: string
}

interface DossierType extends BeheerItem {
  omschrijving: string
  actief: boolean
}

interface Product extends BeheerItem {
  code: string
  tarief: number
  btw: number
  categorie: string
}

interface Rekening extends BeheerItem {
  iban: string
  bic: string
  standaard: boolean
}

interface Wachtlijst extends BeheerItem {
  maxWachtenden: number
  actief: boolean
}

interface SluitingsReden extends BeheerItem {
  type: string
}

interface RelatieRol extends BeheerItem {
  omschrijving: string
}

// Sidebar sections
const beheerSections = [
  'Afspraakstatussen',
  'Afspraaktypes',
  'Bevestigingssjablonen',
  'Contracten',
  'Documentsjablonen',
  'Dossiertypes',
  'E-mailsjablonen',
  'Huistaken',
  'Koppelingen',
  'Locaties',
  'Middelen',
  'Portalmodules',
  'Portalnotificaties',
  'Producten',
  'Rekeningen',
  'Relatierollen',
  'Relaties',
  'Sluitingsredenen',
  'Wachtlijsten',
]

const placeholderSections = new Set([
  'Bevestigingssjablonen',
  'Contracten',
  'Documentsjablonen',
  'E-mailsjablonen',
  'Huistaken',
  'Koppelingen',
  'Middelen',
  'Portalmodules',
  'Portalnotificaties',
  'Relaties',
])

// Sample data
const initialAfspraakStatussen: AfspraakStatus[] = [
  { id: '1', naam: 'Geweest', factureren: 'Geweest, wel factureren', standaard: false },
  { id: '2', naam: 'No show', factureren: 'No-show, wel factureren', standaard: false },
  { id: '3', naam: 'Op tijd afgezegd', factureren: 'Afgezegd, niet factureren', standaard: false },
  { id: '4', naam: 'Te laat afgezegd', factureren: 'No-show, wel factureren', standaard: false },
]

const initialAfspraakTypes: AfspraakType[] = [
  { id: '1', naam: 'Intake', kleur: '#3b82f6', duur: 60, factureerbaar: true },
  { id: '2', naam: 'Consult', kleur: '#22c55e', duur: 45, factureerbaar: true },
  { id: '3', naam: 'Crisiscontact', kleur: '#ef4444', duur: 30, factureerbaar: true },
  { id: '4', naam: 'Groepstherapie', kleur: '#a855f7', duur: 90, factureerbaar: true },
  { id: '5', naam: 'Telefonisch consult', kleur: '#eab308', duur: 15, factureerbaar: true },
  { id: '6', naam: 'E-health', kleur: '#06b6d4', duur: 0, factureerbaar: true },
]

const initialLocaties: Locatie[] = [
  { id: '1', naam: 'Hoofdlocatie', adres: 'Keizersgracht 123', postcode: '1015 CJ', plaats: 'Amsterdam' },
  { id: '2', naam: 'Bijlocatie Zuid', adres: 'Beethovenstraat 45', postcode: '1077 HN', plaats: 'Amsterdam' },
]

const initialDossierTypes: DossierType[] = [
  { id: '1', naam: 'Basis GGZ', omschrijving: 'Dossier voor Basis GGZ behandelingen', actief: true },
  { id: '2', naam: 'Specialistisch GGZ', omschrijving: 'Dossier voor SGGZ behandelingen', actief: true },
  { id: '3', naam: 'Jeugd GGZ', omschrijving: 'Dossier voor Jeugd GGZ', actief: true },
  { id: '4', naam: 'OVP', omschrijving: 'Onverzekerde producten', actief: true },
]

const initialProducten: Product[] = [
  { id: '1', naam: 'Diagnostiek', code: '180001', tarief: 125.00, btw: 0, categorie: 'GGZ' },
  { id: '2', naam: 'Behandeling kort', code: '180002', tarief: 105.00, btw: 0, categorie: 'GGZ' },
  { id: '3', naam: 'Behandeling middel', code: '180003', tarief: 105.00, btw: 0, categorie: 'GGZ' },
  { id: '4', naam: 'Behandeling intensief', code: '180004', tarief: 105.00, btw: 0, categorie: 'GGZ' },
  { id: '5', naam: 'Chronisch', code: '180005', tarief: 105.00, btw: 0, categorie: 'GGZ' },
  { id: '6', naam: 'No-show', code: '190001', tarief: 50.00, btw: 21, categorie: 'Overig' },
]

const initialRekeningen: Rekening[] = [
  { id: '1', naam: 'Praktijkrekening', iban: 'NL91 ABNA 0417 1643 00', bic: 'ABNANL2A', standaard: true },
  { id: '2', naam: 'Spaarrekening', iban: 'NL20 INGB 0001 2345 67', bic: 'INGBNL2A', standaard: false },
]

const initialWachtlijsten: Wachtlijst[] = [
  { id: '1', naam: 'Intake wachtlijst', maxWachtenden: 20, actief: true },
  { id: '2', naam: 'Behandeling wachtlijst', maxWachtenden: 30, actief: true },
]

const initialSluitingsredenen: SluitingsReden[] = [
  { id: '1', naam: 'Behandeling afgerond', type: 'regulier' },
  { id: '2', naam: 'Doorverwijzing', type: 'regulier' },
  { id: '3', naam: 'Voortijdig gestopt door cli\u00ebnt', type: 'voortijdig' },
  { id: '4', naam: 'No-show / onbereikbaar', type: 'voortijdig' },
  { id: '5', naam: 'Verhuizing', type: 'overig' },
]

const initialRelatierollen: RelatieRol[] = [
  { id: '1', naam: 'Huisarts', omschrijving: 'Verwijzend huisarts' },
  { id: '2', naam: 'Psychiater', omschrijving: 'Consulterend psychiater' },
  { id: '3', naam: 'Apotheek', omschrijving: 'Apotheek voor medicatie' },
  { id: '4', naam: 'Verzekeraar', omschrijving: 'Zorgverzekeraar' },
  { id: '5', naam: 'Collega', omschrijving: 'Collega behandelaar' },
]

const factureerOpties = [
  'Geweest, wel factureren',
  'No-show, wel factureren',
  'Afgezegd, niet factureren',
  'Afgezegd, wel factureren',
]

let nextId = 100

export default function BeheerView() {
  const [activeSection, setActiveSection] = useState('Afspraakstatussen')
  const [filterStatus, setFilterStatus] = useState('Actief')

  // Data state
  const [afspraakStatussen, setAfspraakStatussen] = useState(initialAfspraakStatussen)
  const [afspraakTypes, setAfspraakTypes] = useState(initialAfspraakTypes)
  const [locaties, setLocaties] = useState(initialLocaties)
  const [dossierTypes, setDossierTypes] = useState(initialDossierTypes)
  const [producten, setProducten] = useState(initialProducten)
  const [rekeningen, setRekeningen] = useState(initialRekeningen)
  const [wachtlijsten, setWachtlijsten] = useState(initialWachtlijsten)
  const [sluitingsredenen, setSluitingsredenen] = useState(initialSluitingsredenen)
  const [relatierollen, setRelatierollen] = useState(initialRelatierollen)

  // Selection state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, unknown>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function startCreate(defaults: Record<string, unknown>) {
    setSelectedId(null)
    setIsCreating(true)
    setEditForm(defaults)
  }

  function startEdit(item: BeheerItem) {
    setSelectedId(item.id)
    setIsCreating(false)
    setEditForm({ ...item })
  }

  function cancelEdit() {
    setSelectedId(null)
    setIsCreating(false)
    setEditForm({})
  }

  function handleDelete(id: string) {
    if (activeSection === 'Afspraakstatussen') setAfspraakStatussen((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Afspraaktypes') setAfspraakTypes((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Locaties') setLocaties((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Dossiertypes') setDossierTypes((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Producten') setProducten((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Rekeningen') setRekeningen((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Wachtlijsten') setWachtlijsten((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Sluitingsredenen') setSluitingsredenen((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Relatierollen') setRelatierollen((prev) => prev.filter((i) => i.id !== id))
    setConfirmDelete(null)
    cancelEdit()
  }

  function saveItem() {
    const id = isCreating ? String(++nextId) : selectedId!
    const item = { ...editForm, id } as BeheerItem

    function upsert<T extends BeheerItem>(prev: T[], newItem: T): T[] {
      if (isCreating) return [...prev, newItem]
      return prev.map((i) => (i.id === id ? newItem : i))
    }

    if (activeSection === 'Afspraakstatussen') setAfspraakStatussen((prev) => upsert(prev, item as AfspraakStatus))
    else if (activeSection === 'Afspraaktypes') setAfspraakTypes((prev) => upsert(prev, item as AfspraakType))
    else if (activeSection === 'Locaties') setLocaties((prev) => upsert(prev, item as Locatie))
    else if (activeSection === 'Dossiertypes') setDossierTypes((prev) => upsert(prev, item as DossierType))
    else if (activeSection === 'Producten') setProducten((prev) => upsert(prev, item as Product))
    else if (activeSection === 'Rekeningen') setRekeningen((prev) => upsert(prev, item as Rekening))
    else if (activeSection === 'Wachtlijsten') setWachtlijsten((prev) => upsert(prev, item as Wachtlijst))
    else if (activeSection === 'Sluitingsredenen') setSluitingsredenen((prev) => upsert(prev, item as SluitingsReden))
    else if (activeSection === 'Relatierollen') setRelatierollen((prev) => upsert(prev, item as RelatieRol))
    cancelEdit()
  }

  function updateField(key: string, value: unknown) {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  // Render content based on active section
  function renderContent() {
    if (placeholderSections.has(activeSection)) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg border border-gray-200 max-w-md">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">{activeSection}</h3>
            <p className="text-sm text-gray-500">Binnenkort beschikbaar</p>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case 'Afspraakstatussen':
        return renderTableWithPanel(
          afspraakStatussen,
          ['Naam', 'Factureren', 'Standaard'],
          (item: AfspraakStatus) => [
            item.naam,
            item.factureren,
            item.standaard ? 'Ja' : 'Nee',
          ],
          { naam: '', factureren: factureerOpties[0], standaard: false },
          renderAfspraakStatusForm
        )

      case 'Afspraaktypes':
        return renderTableWithPanel(
          afspraakTypes,
          ['Naam', 'Kleur', 'Duur (min)', 'Factureerbaar'],
          (item: AfspraakType) => [
            item.naam,
            <div key="k" className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: item.kleur }} />{item.kleur}</div>,
            String(item.duur),
            item.factureerbaar ? 'Ja' : 'Nee',
          ],
          { naam: '', kleur: '#3b82f6', duur: 45, factureerbaar: true },
          renderAfspraakTypeForm
        )

      case 'Locaties':
        return renderTableWithPanel(
          locaties,
          ['Naam', 'Adres', 'Postcode', 'Plaats'],
          (item: Locatie) => [item.naam, item.adres, item.postcode, item.plaats],
          { naam: '', adres: '', postcode: '', plaats: '' },
          renderLocatieForm
        )

      case 'Dossiertypes':
        return renderTableWithPanel(
          dossierTypes,
          ['Naam', 'Omschrijving', 'Actief'],
          (item: DossierType) => [item.naam, item.omschrijving, item.actief ? 'Ja' : 'Nee'],
          { naam: '', omschrijving: '', actief: true },
          renderDossierTypeForm
        )

      case 'Producten':
        return renderTableWithPanel(
          producten,
          ['Naam', 'Code', 'Tarief', 'BTW%', 'Categorie'],
          (item: Product) => [
            item.naam,
            item.code,
            `\u20AC ${item.tarief.toFixed(2)}`,
            `${item.btw}%`,
            item.categorie,
          ],
          { naam: '', code: '', tarief: 0, btw: 0, categorie: 'GGZ' },
          renderProductForm
        )

      case 'Rekeningen':
        return renderTableWithPanel(
          rekeningen,
          ['Naam', 'IBAN', 'BIC', 'Standaard'],
          (item: Rekening) => [item.naam, item.iban, item.bic, item.standaard ? 'Ja' : 'Nee'],
          { naam: '', iban: '', bic: '', standaard: false },
          renderRekeningForm
        )

      case 'Wachtlijsten':
        return renderTableWithPanel(
          wachtlijsten,
          ['Naam', 'Max. wachtenden', 'Actief'],
          (item: Wachtlijst) => [item.naam, String(item.maxWachtenden), item.actief ? 'Ja' : 'Nee'],
          { naam: '', maxWachtenden: 20, actief: true },
          renderWachtlijstForm
        )

      case 'Sluitingsredenen':
        return renderTableWithPanel(
          sluitingsredenen,
          ['Naam', 'Type'],
          (item: SluitingsReden) => [item.naam, item.type],
          { naam: '', type: 'regulier' },
          renderSluitingsredenForm
        )

      case 'Relatierollen':
        return renderTableWithPanel(
          relatierollen,
          ['Naam', 'Omschrijving'],
          (item: RelatieRol) => [item.naam, item.omschrijving],
          { naam: '', omschrijving: '' },
          renderRelatieRolForm
        )

      default:
        return null
    }
  }

  function renderTableWithPanel<T extends BeheerItem>(
    items: T[],
    columns: string[],
    renderRow: (item: T) => (string | JSX.Element)[],
    defaultValues: Record<string, unknown>,
    renderForm: () => JSX.Element
  ) {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Table area */}
        <div className="flex-1 overflow-auto">
          <div className="p-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option>Actief</option>
                <option>Alle</option>
              </select>
              <button
                onClick={() => startCreate(defaultValues)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Nieuwe {activeSection.replace(/en$/, '').replace(/s$/, '')}
              </button>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {columns.map((col) => (
                    <th key={col} className="text-left px-4 py-2 font-medium text-gray-600">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedId === item.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => startEdit(item)}
                  >
                    {renderRow(item).map((cell, i) => (
                      <td key={i} className="px-4 py-2 text-gray-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit panel */}
        {(selectedId || isCreating) && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 text-sm">
                  {isCreating ? 'Nieuwe toevoegen' : 'Bewerken'}
                </h3>
                <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderForm()}

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={saveItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Save className="w-3.5 h-3.5" />
                  Opslaan
                </button>
                {!isCreating && (
                  <button
                    onClick={() => setConfirmDelete(selectedId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Verwijderen
                  </button>
                )}
              </div>

              {/* Delete confirmation */}
              {confirmDelete && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700 mb-2">Weet u het zeker?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(confirmDelete)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                    >
                      Ja, verwijderen
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Form renderers
  function renderAfspraakStatusForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input
            type="text"
            value={(editForm.naam as string) || ''}
            onChange={(e) => updateField('naam', e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </FormField>
        <FormField label="Icoon">
          <select
            value={(editForm.icoon as string) || ''}
            onChange={(e) => updateField('icoon', e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            <option value="">Geen</option>
            <option value="check">Vinkje</option>
            <option value="cross">Kruis</option>
            <option value="clock">Klok</option>
          </select>
        </FormField>
        <FormField label="Factureren">
          <select
            value={(editForm.factureren as string) || ''}
            onChange={(e) => updateField('factureren', e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {factureerOpties.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Standaard">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(editForm.standaard as boolean) || false}
              onChange={(e) => updateField('standaard', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Ja</span>
          </label>
        </FormField>
      </div>
    )
  }

  function renderAfspraakTypeForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Kleur">
          <div className="flex items-center gap-2">
            <input type="color" value={(editForm.kleur as string) || '#3b82f6'} onChange={(e) => updateField('kleur', e.target.value)} className="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
            <input type="text" value={(editForm.kleur as string) || ''} onChange={(e) => updateField('kleur', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
        </FormField>
        <FormField label="Duur (minuten)">
          <input type="number" value={(editForm.duur as number) || 0} onChange={(e) => updateField('duur', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Factureerbaar">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={(editForm.factureerbaar as boolean) || false} onChange={(e) => updateField('factureerbaar', e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm text-gray-600">Ja</span>
          </label>
        </FormField>
      </div>
    )
  }

  function renderLocatieForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Adres">
          <input type="text" value={(editForm.adres as string) || ''} onChange={(e) => updateField('adres', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Postcode">
          <input type="text" value={(editForm.postcode as string) || ''} onChange={(e) => updateField('postcode', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Plaats">
          <input type="text" value={(editForm.plaats as string) || ''} onChange={(e) => updateField('plaats', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
      </div>
    )
  }

  function renderDossierTypeForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Omschrijving">
          <textarea value={(editForm.omschrijving as string) || ''} onChange={(e) => updateField('omschrijving', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" rows={3} />
        </FormField>
        <FormField label="Actief">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={(editForm.actief as boolean) || false} onChange={(e) => updateField('actief', e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm text-gray-600">Ja</span>
          </label>
        </FormField>
      </div>
    )
  }

  function renderProductForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Code">
          <input type="text" value={(editForm.code as string) || ''} onChange={(e) => updateField('code', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Tarief">
          <input type="number" step="0.01" value={(editForm.tarief as number) || 0} onChange={(e) => updateField('tarief', parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="BTW%">
          <select value={(editForm.btw as number) || 0} onChange={(e) => updateField('btw', parseInt(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
            <option value={0}>0%</option>
            <option value={9}>9%</option>
            <option value={21}>21%</option>
          </select>
        </FormField>
        <FormField label="Categorie">
          <select value={(editForm.categorie as string) || 'GGZ'} onChange={(e) => updateField('categorie', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
            <option>GGZ</option>
            <option>Overig</option>
            <option>OVP</option>
          </select>
        </FormField>
      </div>
    )
  }

  function renderRekeningForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="IBAN">
          <input type="text" value={(editForm.iban as string) || ''} onChange={(e) => updateField('iban', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="BIC">
          <input type="text" value={(editForm.bic as string) || ''} onChange={(e) => updateField('bic', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Standaard">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={(editForm.standaard as boolean) || false} onChange={(e) => updateField('standaard', e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm text-gray-600">Ja</span>
          </label>
        </FormField>
      </div>
    )
  }

  function renderWachtlijstForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Max. wachtenden">
          <input type="number" value={(editForm.maxWachtenden as number) || 0} onChange={(e) => updateField('maxWachtenden', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Actief">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={(editForm.actief as boolean) || false} onChange={(e) => updateField('actief', e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm text-gray-600">Ja</span>
          </label>
        </FormField>
      </div>
    )
  }

  function renderSluitingsredenForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Type">
          <select value={(editForm.type as string) || 'regulier'} onChange={(e) => updateField('type', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
            <option value="regulier">Regulier</option>
            <option value="voortijdig">Voortijdig</option>
            <option value="overig">Overig</option>
          </select>
        </FormField>
      </div>
    )
  }

  function renderRelatieRolForm() {
    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Omschrijving">
          <textarea value={(editForm.omschrijving as string) || ''} onChange={(e) => updateField('omschrijving', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" rows={3} />
        </FormField>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Secondary sidebar */}
      <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
        <nav className="py-1">
          {beheerSections.map((section) => (
            <button
              key={section}
              onClick={() => {
                setActiveSection(section)
                cancelEdit()
              }}
              className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${
                activeSection === section
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
