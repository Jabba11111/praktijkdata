import React, { useState } from 'react'
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

interface TijdConfig {
  standaard: number
  min: number
  max: number
}

interface AfspraakType extends BeheerItem {
  categorie: string
  directeTijd: TijdConfig
  indirecteTijd: TijdConfig
  reistijd: TijdConfig
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

const t = (s: number, mn: number, mx: number): TijdConfig => ({ standaard: s, min: mn, max: mx })

const initialAfspraakTypes: AfspraakType[] = [
  // Overige afspraken
  { id: '1', naam: 'Overige afspraak', categorie: 'Overige afspraken', directeTijd: t(45, 10, 540), indirecteTijd: t(0, 0, 0), reistijd: t(0, 0, 0) },
  { id: '2', naam: 'Vakantie', categorie: 'Overige afspraken', directeTijd: t(45, 10, 600), indirecteTijd: t(0, 0, 0), reistijd: t(0, 0, 0) },
  { id: '3', naam: 'Ziek', categorie: 'Overige afspraken', directeTijd: t(45, 10, 480), indirecteTijd: t(0, 0, 0), reistijd: t(0, 0, 0) },
  // Overige zorg
  { id: '4', naam: 'Consult', categorie: 'Overige zorg', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  { id: '5', naam: 'E-consult, videobellen', categorie: 'Overige zorg', directeTijd: t(45, 0, 60), indirecteTijd: t(15, 0, 30), reistijd: t(0, 0, 0) },
  { id: '6', naam: 'Groepsconsult', categorie: 'Overige zorg', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  { id: '7', naam: 'Intake', categorie: 'Overige zorg', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  { id: '8', naam: 'Verslaglegging', categorie: 'Overige zorg', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  // Jeugdhulp
  { id: '9', naam: 'Consult', categorie: 'Jeugdhulp', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  { id: '10', naam: 'Groepsconsult', categorie: 'Jeugdhulp', directeTijd: t(90, 0, 120), indirecteTijd: t(0, 0, 30), reistijd: t(0, 0, 0) },
  { id: '11', naam: 'Intake', categorie: 'Jeugdhulp', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  { id: '12', naam: 'MDO', categorie: 'Jeugdhulp', directeTijd: t(45, 0, 60), indirecteTijd: t(0, 0, 0), reistijd: t(0, 0, 0) },
  { id: '13', naam: 'Verslaglegging', categorie: 'Jeugdhulp', directeTijd: t(45, 0, 60), indirecteTijd: t(0, 0, 0), reistijd: t(0, 0, 0) },
  // WMO
  { id: '14', naam: 'Begeleiding', categorie: 'WMO', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  { id: '15', naam: 'Intake', categorie: 'WMO', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  { id: '16', naam: 'Verslaglegging', categorie: 'WMO', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  // Zorgprestatiemodel
  { id: '17', naam: 'Behandeling ZPM', categorie: 'Zorgprestatiemodel', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 30), reistijd: t(0, 0, 60) },
  { id: '18', naam: 'Behandeling ZPM - E-consult', categorie: 'Zorgprestatiemodel', directeTijd: t(45, 10, 120), indirecteTijd: t(15, 0, 30), reistijd: t(0, 0, 60) },
  { id: '19', naam: 'Diagnostiek ZPM', categorie: 'Zorgprestatiemodel', directeTijd: t(45, 0, 90), indirecteTijd: t(30, 0, 60), reistijd: t(0, 0, 0) },
  { id: '20', naam: 'Groepsbehandeling', categorie: 'Zorgprestatiemodel', directeTijd: t(90, 0, 120), indirecteTijd: t(30, 0, 60), reistijd: t(0, 0, 0) },
  { id: '21', naam: 'Intake ZPM', categorie: 'Zorgprestatiemodel', directeTijd: t(45, 10, 120), indirecteTijd: t(30, 0, 60), reistijd: t(0, 0, 0) },
  { id: '22', naam: 'Intercollegiaal overleg - kort (tot 14 min.) (OV0007)', categorie: 'Zorgprestatiemodel', directeTijd: t(0, 0, 0), indirecteTijd: t(10, 5, 14), reistijd: t(0, 0, 0) },
  { id: '23', naam: 'Intercollegiaal overleg - lang (vanaf 15 min.) (OV0008)', categorie: 'Zorgprestatiemodel', directeTijd: t(0, 0, 0), indirecteTijd: t(30, 15, 60), reistijd: t(0, 0, 0) },
  { id: '24', naam: 'Niet-basispakketzorg consult (OV0165)', categorie: 'Zorgprestatiemodel', directeTijd: t(45, 30, 90), indirecteTijd: t(15, 0, 60), reistijd: t(0, 0, 0) },
  { id: '25', naam: 'Schriftelijke informatieverstrekking (OV0018)', categorie: 'Zorgprestatiemodel', directeTijd: t(0, 0, 0), indirecteTijd: t(60, 0, 60), reistijd: t(0, 0, 0) },
]

const afspraakTypeCategorieen = ['Overige afspraken', 'Overige zorg', 'Jeugdhulp', 'WMO', 'Zorgprestatiemodel']

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
        return renderAfspraakTypesView()

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

  function formatTijd(tc: TijdConfig): string {
    return `${tc.standaard} minuten (min: ${tc.min}; max: ${tc.max})`
  }

  function renderAfspraakTypesView() {
    const grouped = afspraakTypeCategorieen.map((cat) => ({
      categorie: cat,
      items: afspraakTypes.filter((at) => at.categorie === cat),
    }))

    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
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
              onClick={() => startCreate({
                naam: '',
                categorie: afspraakTypeCategorieen[0],
                directeTijd: { standaard: 45, min: 10, max: 120 },
                indirecteTijd: { standaard: 15, min: 0, max: 60 },
                reistijd: { standaard: 0, min: 0, max: 0 },
              })}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              Nieuw afspraaktype
            </button>
          </div>

          {/* Table header */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-2 font-medium text-gray-600">Naam</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Directe tijd</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Indirecte tijd</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Reistijd</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((group) => (
                <React.Fragment key={group.categorie}>
                  {/* Category header */}
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <td colSpan={4} className="px-4 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wide">
                      {group.categorie}
                    </td>
                  </tr>
                  {group.items.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                        selectedId === item.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => startEdit(item)}
                    >
                      <td className="px-4 py-2 text-gray-700">{item.naam}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{formatTijd(item.directeTijd)}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{formatTijd(item.indirecteTijd)}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{formatTijd(item.reistijd)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit panel */}
        {(selectedId || isCreating) && (
          <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 text-sm">
                  {isCreating ? 'Nieuw afspraaktype' : 'Afspraaktype bewerken'}
                </h3>
                <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderAfspraakTypeForm()}

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

              {confirmDelete && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700 mb-2">Weet u het zeker?</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(confirmDelete)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Ja, verwijderen</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">Annuleren</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderAfspraakTypeForm() {
    const tijdField = (label: string, fieldKey: string) => {
      const tc = (editForm[fieldKey] as TijdConfig) || { standaard: 0, min: 0, max: 0 }
      return (
        <div className="border border-gray-200 rounded p-3 bg-white">
          <p className="text-xs font-medium text-gray-700 mb-2">{label}</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">Standaard</label>
              <input
                type="number"
                value={tc.standaard}
                onChange={(e) => updateField(fieldKey, { ...tc, standaard: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-1.5 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">Min</label>
              <input
                type="number"
                value={tc.min}
                onChange={(e) => updateField(fieldKey, { ...tc, min: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-1.5 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">Max</label>
              <input
                type="number"
                value={tc.max}
                onChange={(e) => updateField(fieldKey, { ...tc, max: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-1.5 py-1 text-xs"
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <FormField label="Naam">
          <input type="text" value={(editForm.naam as string) || ''} onChange={(e) => updateField('naam', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
        </FormField>
        <FormField label="Categorie">
          <select value={(editForm.categorie as string) || ''} onChange={(e) => updateField('categorie', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
            {afspraakTypeCategorieen.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </FormField>
        {tijdField('Directe tijd (minuten)', 'directeTijd')}
        {tijdField('Indirecte tijd (minuten)', 'indirecteTijd')}
        {tijdField('Reistijd (minuten)', 'reistijd')}
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
