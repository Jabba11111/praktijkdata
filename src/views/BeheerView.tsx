import React, { useState } from 'react'
import { Settings, Plus, Edit, Trash2, Save, X, Check, RefreshCw, Download, AlertCircle, CheckCircle2 } from 'lucide-react'

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

type BevestigingSoort = 'Afspraakbevestiging' | 'Afspraakherinnering' | 'Afspraakverwijdering' | 'Afspraakwijziging' | 'Intakebevestiging'

interface BevestigingsSjabloon extends BeheerItem {
  soort: BevestigingSoort
  onderwerp: string
  inhoud: string
  verzendMoment: string
  actief: boolean
}

type ContractType = 'Zorgprestatiemodel' | 'Jeugdhulp' | 'WMO' | 'Overige tarieven'

interface Contract extends BeheerItem {
  nummer: number
  type: ContractType
  administratie: string
  einddatum: string
  verzekeraars: string[]
  budget: number | null
  actief: boolean
  gearchiveerd: boolean
}

type DocumentType = 'Documenten' | 'Communicatie'
type GezondheidsInfo = 'Nee en niet te wijzigen' | 'Nee per document te wijzigen' | 'Ja per document te wijzigen' | 'Ja en niet te wijzigen'

interface DocumentSjabloon extends BeheerItem {
  documentType: DocumentType
  bevatGezondheidsinfo: GezondheidsInfo
  financieleBewaarplicht: boolean
  dossiertypes: string[]
  sjabloonInhoud: string
  actief: boolean
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
  'Applicatie-update',
]

const placeholderSections = new Set([
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

const bevestigingSoorten: BevestigingSoort[] = [
  'Afspraakbevestiging',
  'Afspraakherinnering',
  'Afspraakverwijdering',
  'Afspraakwijziging',
  'Intakebevestiging',
]

const initialBevestigingsSjablonen: BevestigingsSjabloon[] = [
  { id: '1', naam: 'Afspraakbevestiging', soort: 'Afspraakbevestiging', onderwerp: 'Bevestiging van uw afspraak', inhoud: 'Beste {client_naam},\n\nHierbij bevestigen wij uw afspraak op {datum} om {tijd}.\n\nMet vriendelijke groet,\n{praktijk_naam}', verzendMoment: 'Direct na inplannen', actief: true },
  { id: '2', naam: 'Afspraakherinnering', soort: 'Afspraakherinnering', onderwerp: 'Herinnering: uw afspraak', inhoud: 'Beste {client_naam},\n\nDit is een herinnering voor uw afspraak op {datum} om {tijd}.\n\nMet vriendelijke groet,\n{praktijk_naam}', verzendMoment: '24 uur van tevoren', actief: true },
  { id: '3', naam: 'Afspraakverwijdering', soort: 'Afspraakverwijdering', onderwerp: 'Afspraak geannuleerd', inhoud: 'Beste {client_naam},\n\nUw afspraak op {datum} om {tijd} is geannuleerd.\n\nMet vriendelijke groet,\n{praktijk_naam}', verzendMoment: 'Direct na annulering', actief: true },
  { id: '4', naam: 'Afspraakwijziging', soort: 'Afspraakwijziging', onderwerp: 'Uw afspraak is gewijzigd', inhoud: 'Beste {client_naam},\n\nUw afspraak is gewijzigd. De nieuwe datum en tijd: {datum} om {tijd}.\n\nMet vriendelijke groet,\n{praktijk_naam}', verzendMoment: 'Direct na wijziging', actief: true },
  { id: '5', naam: 'Intakebevestiging, zónder videobellen', soort: 'Intakebevestiging', onderwerp: 'Bevestiging intake afspraak', inhoud: 'Beste {client_naam},\n\nHierbij bevestigen wij uw intake afspraak op {datum} om {tijd} op locatie {locatie}.\n\nMet vriendelijke groet,\n{praktijk_naam}', verzendMoment: 'Direct na inplannen', actief: true },
]

const contractTypes: ContractType[] = ['Zorgprestatiemodel', 'Jeugdhulp', 'WMO', 'Overige tarieven']

const initialContracten: Contract[] = [
  { id: '1', naam: 'Restitutie facturen', nummer: 30, type: 'Zorgprestatiemodel', administratie: 'Mijn administratie', einddatum: '2026-12-31', verzekeraars: [], budget: null, actief: true, gearchiveerd: false },
  { id: '2', naam: 'Rechtstreekse facturen', nummer: 31, type: 'Overige tarieven', administratie: 'Mijn administratie', einddatum: '2026-12-31', verzekeraars: [], budget: null, actief: true, gearchiveerd: false },
  { id: '3', naam: 'Zwolle (0193) Aa en Hunze (1680)', nummer: 32, type: 'Jeugdhulp', administratie: 'Mijn administratie', einddatum: '2026-12-31', verzekeraars: [], budget: null, actief: true, gearchiveerd: false },
  { id: '4', naam: 'Zwolle (0193)', nummer: 33, type: 'WMO', administratie: 'Mijn administratie', einddatum: '2026-12-31', verzekeraars: [], budget: null, actief: true, gearchiveerd: false },
  { id: '5', naam: '3311 Zilveren Kruis Zorgverzekeringen N.V. 3313 Interpolis Zorgverzekeringen NV 3351 FBTO Zorgverzekeringen N.V. 3358 De Friesland Zorgverzekeraar N.V. 9086 Pro Life Zorgverzekeringen', nummer: 34, type: 'Zorgprestatiemodel', administratie: 'Mijn administratie', einddatum: '2026-12-31', verzekeraars: ['3311 Zilveren Kruis Zorgverzekeringen N.V.', '3313 Interpolis Zorgverzekeringen NV', '3351 FBTO Zorgverzekeringen N.V.', '3358 De Friesland Zorgverzekeraar N.V.', '9086 Pro Life Zorgverzekeringen'], budget: null, actief: true, gearchiveerd: false },
  { id: '6', naam: '3343 ONVZ Ziektekostenverzekeraar 3365 ONVZ Expats', nummer: 35, type: 'Zorgprestatiemodel', administratie: 'Mijn administratie', einddatum: '2026-12-31', verzekeraars: ['3343 ONVZ Ziektekostenverzekeraar', '3365 ONVZ Expats'], budget: null, actief: true, gearchiveerd: false },
  { id: '7', naam: '0101 N.V. Univé Zorg 0699 IZA Zorgverzekeraar NV 0736 NV Zorgverzekeraar UMC 3334 IZA-VNG 3361 ZEKUR 7095 VGZ Zorgverzekeraar N.V.', nummer: 36, type: 'Zorgprestatiemodel', administratie: 'Mijn administratie', einddatum: '2026-12-31', verzekeraars: ['0101 N.V. Univé Zorg', '0699 IZA Zorgverzekeraar NV', '0736 NV Zorgverzekeraar UMC', '3334 IZA-VNG', '3361 ZEKUR', '7095 VGZ Zorgverzekeraar N.V.'], budget: null, actief: true, gearchiveerd: false },
]

const documentTypes: DocumentType[] = ['Documenten', 'Communicatie']
const gezondheidsInfoOpties: GezondheidsInfo[] = ['Nee en niet te wijzigen', 'Nee per document te wijzigen', 'Ja per document te wijzigen', 'Ja en niet te wijzigen']

const initialDocumentSjablonen: DocumentSjabloon[] = [
  { id: '1', naam: 'Behandelovereenkomst overige zorg', documentType: 'Documenten', bevatGezondheidsinfo: 'Nee en niet te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Basis GGZ', 'Specialistisch GGZ', 'OVP'], sjabloonInhoud: '', actief: true },
  { id: '2', naam: 'Behandelovereenkomst ZPM', documentType: 'Documenten', bevatGezondheidsinfo: 'Nee en niet te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Basis GGZ', 'Specialistisch GGZ'], sjabloonInhoud: '', actief: true },
  { id: '3', naam: 'Behandelplan Jeugdhulp', documentType: 'Documenten', bevatGezondheidsinfo: 'Ja per document te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Jeugd GGZ'], sjabloonInhoud: '', actief: true },
  { id: '4', naam: 'Behandelplan ZPM', documentType: 'Documenten', bevatGezondheidsinfo: 'Ja per document te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Basis GGZ', 'Specialistisch GGZ'], sjabloonInhoud: '', actief: true },
  { id: '5', naam: 'Briefpapier - leeg sjabloon', documentType: 'Documenten', bevatGezondheidsinfo: 'Nee per document te wijzigen', financieleBewaarplicht: false, dossiertypes: [], sjabloonInhoud: '', actief: true },
  { id: '6', naam: 'Export cliëntdossier Jeugd', documentType: 'Documenten', bevatGezondheidsinfo: 'Ja en niet te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Jeugd GGZ'], sjabloonInhoud: '', actief: true },
  { id: '7', naam: 'Export cliëntdossier ZPM', documentType: 'Documenten', bevatGezondheidsinfo: 'Ja en niet te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Basis GGZ', 'Specialistisch GGZ'], sjabloonInhoud: '', actief: true },
  { id: '8', naam: 'Huisartsenbrief afsluiting', documentType: 'Documenten', bevatGezondheidsinfo: 'Ja per document te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Basis GGZ', 'Specialistisch GGZ'], sjabloonInhoud: '', actief: true },
  { id: '9', naam: 'Huisartsenbrief intake', documentType: 'Documenten', bevatGezondheidsinfo: 'Ja per document te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Basis GGZ', 'Specialistisch GGZ'], sjabloonInhoud: '', actief: true },
  { id: '10', naam: 'Overig', documentType: 'Documenten', bevatGezondheidsinfo: 'Nee per document te wijzigen', financieleBewaarplicht: false, dossiertypes: [], sjabloonInhoud: '', actief: true },
  { id: '11', naam: 'Overig', documentType: 'Communicatie', bevatGezondheidsinfo: 'Nee per document te wijzigen', financieleBewaarplicht: false, dossiertypes: [], sjabloonInhoud: '', actief: true },
  { id: '12', naam: 'Privacyverklaring 2025 (01-04-2025)', documentType: 'Documenten', bevatGezondheidsinfo: 'Nee en niet te wijzigen', financieleBewaarplicht: false, dossiertypes: [], sjabloonInhoud: '', actief: true },
  { id: '13', naam: 'Privacyverklaring ZPM', documentType: 'Documenten', bevatGezondheidsinfo: 'Nee en niet te wijzigen', financieleBewaarplicht: false, dossiertypes: ['Basis GGZ', 'Specialistisch GGZ'], sjabloonInhoud: '', actief: true },
  { id: '14', naam: 'Verwijzing ontvangen', documentType: 'Documenten', bevatGezondheidsinfo: 'Nee per document te wijzigen', financieleBewaarplicht: false, dossiertypes: [], sjabloonInhoud: '', actief: true },
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
  const [bevestigingsSjablonen, setBevestigingsSjablonen] = useState(initialBevestigingsSjablonen)
  const [contracten, setContracten] = useState(initialContracten)
  const [documentSjablonen, setDocumentSjablonen] = useState(initialDocumentSjablonen)

  // Wizard state for bevestigingssjablonen & contracten
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardMode, setWizardMode] = useState<'list' | 'wizard'>('list')
  const [contractYear, setContractYear] = useState(2026)
  const [contractFilter, setContractFilter] = useState<'Actief' | 'Archief'>('Actief')

  // Update state
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [updateLogs, setUpdateLogs] = useState<string[]>([])
  const [systemInfo, setSystemInfo] = useState<{ branch: string; remote: string; recentCommits: string[]; version: string } | null>(null)
  const [systemInfoLoading, setSystemInfoLoading] = useState(false)

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
    else if (activeSection === 'Bevestigingssjablonen') setBevestigingsSjablonen((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Contracten') setContracten((prev) => prev.filter((i) => i.id !== id))
    else if (activeSection === 'Documentsjablonen') setDocumentSjablonen((prev) => prev.filter((i) => i.id !== id))
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
    else if (activeSection === 'Bevestigingssjablonen') setBevestigingsSjablonen((prev) => upsert(prev, item as BevestigingsSjabloon))
    else if (activeSection === 'Contracten') setContracten((prev) => upsert(prev, item as Contract))
    else if (activeSection === 'Documentsjablonen') setDocumentSjablonen((prev) => upsert(prev, item as DocumentSjabloon))
    cancelEdit()
    setWizardMode('list')
    setWizardStep(1)
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

      case 'Bevestigingssjablonen':
        return renderBevestigingsSjablonenView()

      case 'Contracten':
        return renderContractenView()

      case 'Documentsjablonen':
        return renderDocumentSjablonenView()

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

      case 'Applicatie-update':
        return renderApplicatieUpdateView()

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

  function renderContractenView() {
    const contractWizardSteps = [
      { nr: 1, label: 'Type contract' },
      { nr: 2, label: 'Basisgegevens' },
      { nr: 3, label: 'Verzekeraars' },
      { nr: 4, label: 'Budget en tarieven' },
      { nr: 5, label: 'Voltooid' },
    ]

    function startContractCreate() {
      setWizardMode('wizard')
      setWizardStep(1)
      setIsCreating(true)
      setSelectedId(null)
      const maxNr = contracten.reduce((max, c) => Math.max(max, c.nummer), 0)
      setEditForm({
        naam: '',
        nummer: maxNr + 1,
        type: 'Zorgprestatiemodel',
        administratie: 'Mijn administratie',
        einddatum: `${contractYear}-12-31`,
        verzekeraars: [],
        budget: null,
        actief: true,
        gearchiveerd: false,
      })
    }

    function startContractEdit(item: Contract) {
      setWizardMode('wizard')
      setWizardStep(1)
      setIsCreating(false)
      setSelectedId(item.id)
      setEditForm({ ...item, verzekeraars: [...item.verzekeraars] })
    }

    function cancelContractWizard() {
      setWizardMode('list')
      setWizardStep(1)
      cancelEdit()
    }

    // Group contracts by type
    const filteredContracten = contracten.filter((c) => {
      const year = parseInt(c.einddatum.slice(0, 4))
      if (year !== contractYear) return false
      if (contractFilter === 'Actief') return c.actief && !c.gearchiveerd
      return c.gearchiveerd
    })

    const grouped = contractTypes.map((type) => ({
      type,
      items: filteredContracten.filter((c) => c.type === type),
    })).filter((g) => g.items.length > 0)

    function formatDate(d: string) {
      const [y, m, day] = d.split('-')
      return `${day}-${m}-${y}`
    }

    // List view
    if (wizardMode === 'list') {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white">
              <select
                value={contractYear}
                onChange={(e) => setContractYear(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button
                  onClick={() => setContractFilter('Actief')}
                  className={`px-3 py-1 text-sm ${contractFilter === 'Actief' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Actief
                </button>
                <button
                  onClick={() => setContractFilter('Archief')}
                  className={`px-3 py-1 text-sm border-l border-gray-300 ${contractFilter === 'Archief' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Archief
                </button>
              </div>
              <button
                onClick={startContractCreate}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Nieuw contract
              </button>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-12">Nr.</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Contract</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Administratie</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Einddatum</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((group) => (
                  <React.Fragment key={group.type}>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <td colSpan={4} className="px-4 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wide">
                        {group.type}
                      </td>
                    </tr>
                    {group.items.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                          selectedId === item.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => startContractEdit(item)}
                      >
                        <td className="px-4 py-2 text-gray-500">{item.nummer}</td>
                        <td className="px-4 py-2 text-gray-700 max-w-md truncate">{item.naam}</td>
                        <td className="px-4 py-2 text-gray-500">{item.administratie}</td>
                        <td className="px-4 py-2 text-gray-500">{formatDate(item.einddatum)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {grouped.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Geen contracten gevonden voor {contractYear}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    // Wizard view
    const verzekeraarsText = ((editForm.verzekeraars as string[]) || []).join('\n')

    return (
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-2xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isCreating ? 'Nieuw contract toevoegen' : 'Contract bewerken'}
            </h2>
            <button onClick={cancelContractWizard} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {contractWizardSteps.map((step, i) => (
              <React.Fragment key={step.nr}>
                <button
                  onClick={() => setWizardStep(step.nr)}
                  className={`flex items-center gap-2 shrink-0 ${
                    wizardStep === step.nr
                      ? 'text-blue-600'
                      : wizardStep > step.nr
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                      wizardStep === step.nr
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : wizardStep > step.nr
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {wizardStep > step.nr ? <Check className="w-3.5 h-3.5" /> : step.nr}
                  </span>
                  <span className="text-xs font-medium hidden sm:inline">{step.label}</span>
                </button>
                {i < contractWizardSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${wizardStep > step.nr ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Type contract:</h3>
                <div className="space-y-2">
                  {contractTypes.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        (editForm.type as string) === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contractType"
                        value={type}
                        checked={(editForm.type as string) === type}
                        onChange={(e) => updateField('type', e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Basisgegevens</h3>
                <FormField label="Contractnaam">
                  <input
                    type="text"
                    value={(editForm.naam as string) || ''}
                    onChange={(e) => updateField('naam', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Naam van het contract"
                  />
                </FormField>
                <FormField label="Contractnummer">
                  <input
                    type="number"
                    value={(editForm.nummer as number) || 0}
                    onChange={(e) => updateField('nummer', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </FormField>
                <FormField label="Administratie">
                  <input
                    type="text"
                    value={(editForm.administratie as string) || ''}
                    onChange={(e) => updateField('administratie', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </FormField>
                <FormField label="Einddatum">
                  <input
                    type="date"
                    value={(editForm.einddatum as string) || ''}
                    onChange={(e) => updateField('einddatum', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </FormField>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Verzekeraars</h3>
                <p className="text-xs text-gray-500">Voer verzekeraars in, één per regel (bijv. &quot;3311 Zilveren Kruis Zorgverzekeringen N.V.&quot;)</p>
                <textarea
                  value={verzekeraarsText}
                  onChange={(e) => updateField('verzekeraars', e.target.value.split('\n').filter((v) => v.trim()))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                  rows={8}
                  placeholder="3311 Zilveren Kruis Zorgverzekeringen N.V.&#10;3313 Interpolis Zorgverzekeringen NV"
                />
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Budget en tarieven</h3>
                <FormField label="Budget (optioneel)">
                  <input
                    type="number"
                    step="0.01"
                    value={(editForm.budget as number) ?? ''}
                    onChange={(e) => updateField('budget', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Laat leeg indien geen budget"
                  />
                </FormField>
                <FormField label="Actief">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(editForm.actief as boolean) || false}
                      onChange={(e) => updateField('actief', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Contract is actief</span>
                  </label>
                </FormField>
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Overzicht</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900">{editForm.type as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Naam</span>
                    <span className="text-gray-900">{editForm.naam as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Nummer</span>
                    <span className="text-gray-900">{editForm.nummer as number}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Administratie</span>
                    <span className="text-gray-900">{editForm.administratie as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Einddatum</span>
                    <span className="text-gray-900">{formatDate((editForm.einddatum as string) || '')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Verzekeraars</span>
                    <span className="text-gray-900">{((editForm.verzekeraars as string[]) || []).length} stuks</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Actief</span>
                    <span className="text-gray-900">{(editForm.actief as boolean) ? 'Ja' : 'Nee'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => wizardStep === 1 ? cancelContractWizard() : setWizardStep(wizardStep - 1)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              {wizardStep === 1 ? 'Annuleren' : 'Vorige'}
            </button>
            {wizardStep < 5 ? (
              <button
                onClick={() => setWizardStep(wizardStep + 1)}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Volgende stap
              </button>
            ) : (
              <button
                onClick={() => saveItem()}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                <Save className="w-3.5 h-3.5" />
                Opslaan
              </button>
            )}
          </div>

          {!isCreating && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (selectedId) {
                    handleDelete(selectedId)
                    cancelContractWizard()
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Contract verwijderen
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderDocumentSjablonenView() {
    const docWizardSteps = [
      { nr: 1, label: 'Basisgegevens' },
      { nr: 2, label: 'Dossiertypes' },
      { nr: 3, label: 'Sjabloon' },
      { nr: 4, label: 'Voltooid' },
    ]

    function startDocWizardCreate() {
      setWizardMode('wizard')
      setWizardStep(1)
      setIsCreating(true)
      setSelectedId(null)
      setEditForm({
        naam: '',
        documentType: 'Documenten' as DocumentType,
        bevatGezondheidsinfo: 'Nee en niet te wijzigen' as GezondheidsInfo,
        financieleBewaarplicht: false,
        dossiertypes: [],
        sjabloonInhoud: '',
        actief: true,
      })
    }

    function startDocWizardEdit(item: DocumentSjabloon) {
      setWizardMode('wizard')
      setWizardStep(1)
      setIsCreating(false)
      setSelectedId(item.id)
      setEditForm({ ...item, dossiertypes: [...item.dossiertypes] })
    }

    function cancelDocWizard() {
      setWizardMode('list')
      setWizardStep(1)
      cancelEdit()
    }

    function finishDocWizard() {
      saveItem()
    }

    const availableDossierTypes = dossierTypes.map((dt) => dt.naam)

    // List view
    if (wizardMode === 'list') {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
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
                onClick={startDocWizardCreate}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Nieuw documentsjabloon
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Naam</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Documenttype</th>
                </tr>
              </thead>
              <tbody>
                {documentSjablonen
                  .filter((item) => filterStatus === 'Alle' || item.actief)
                  .map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => startDocWizardEdit(item)}
                  >
                    <td className="px-4 py-2 text-gray-700">{item.naam}</td>
                    <td className="px-4 py-2 text-gray-500">{item.documentType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    // Wizard view
    return (
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isCreating ? 'Nieuw documentsjabloon toevoegen' : 'Documentsjabloon bewerken'}
            </h2>
            <button onClick={cancelDocWizard} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {docWizardSteps.map((step, i) => (
              <React.Fragment key={step.nr}>
                <button
                  onClick={() => setWizardStep(step.nr)}
                  className={`flex items-center gap-2 shrink-0 ${
                    wizardStep === step.nr
                      ? 'text-blue-600'
                      : wizardStep > step.nr
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                      wizardStep === step.nr
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : wizardStep > step.nr
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {wizardStep > step.nr ? <Check className="w-3.5 h-3.5" /> : step.nr}
                  </span>
                  <span className="text-xs font-medium hidden sm:inline">{step.label}</span>
                </button>
                {i < docWizardSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${wizardStep > step.nr ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Basisgegevens</h3>
                <FormField label="Documenttype:">
                  <div className="flex gap-4">
                    {documentTypes.map((dt) => (
                      <label key={dt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="documentType"
                          value={dt}
                          checked={(editForm.documentType as string) === dt}
                          onChange={(e) => updateField('documentType', e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{dt}</span>
                      </label>
                    ))}
                  </div>
                </FormField>
                <FormField label="Naam:">
                  <input
                    type="text"
                    value={(editForm.naam as string) || ''}
                    onChange={(e) => updateField('naam', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Naam van het sjabloon"
                  />
                </FormField>
                <FormField label="Bevat gezondheidsinfo:">
                  <select
                    value={(editForm.bevatGezondheidsinfo as string) || 'Nee en niet te wijzigen'}
                    onChange={(e) => updateField('bevatGezondheidsinfo', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    {gezondheidsInfoOpties.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Financiële bewaarplicht:">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(editForm.financieleBewaarplicht as boolean) || false}
                      onChange={(e) => updateField('financieleBewaarplicht', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">{(editForm.financieleBewaarplicht as boolean) ? 'Ja' : 'Nee'}</span>
                  </label>
                </FormField>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Dossiertypes</h3>
                <p className="text-sm text-gray-500">Selecteer de dossiertypes waarvoor dit sjabloon beschikbaar is.</p>
                <div className="space-y-2">
                  {availableDossierTypes.map((dt) => (
                    <label
                      key={dt}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        ((editForm.dossiertypes as string[]) || []).includes(dt)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={((editForm.dossiertypes as string[]) || []).includes(dt)}
                        onChange={(e) => {
                          const current = (editForm.dossiertypes as string[]) || []
                          if (e.target.checked) {
                            updateField('dossiertypes', [...current, dt])
                          } else {
                            updateField('dossiertypes', current.filter((d) => d !== dt))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{dt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Sjabloon</h3>
                <p className="text-sm text-gray-500">
                  Definieer de inhoud van het sjabloon. Gebruik variabelen zoals {'{client_naam}'}, {'{datum}'}, {'{behandelaar}'}.
                </p>
                <FormField label="Sjabloon inhoud:">
                  <textarea
                    value={(editForm.sjabloonInhoud as string) || ''}
                    onChange={(e) => updateField('sjabloonInhoud', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                    rows={12}
                    placeholder="Voer hier de sjablooninhoud in..."
                  />
                </FormField>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Overzicht</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Documenttype</span>
                    <span className="text-gray-900">{editForm.documentType as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Naam</span>
                    <span className="text-gray-900">{editForm.naam as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Bevat gezondheidsinfo</span>
                    <span className="text-gray-900">{editForm.bevatGezondheidsinfo as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Financiële bewaarplicht</span>
                    <span className="text-gray-900">{(editForm.financieleBewaarplicht as boolean) ? 'Ja' : 'Nee'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Dossiertypes</span>
                    <span className="text-gray-900">{((editForm.dossiertypes as string[]) || []).join(', ') || 'Geen'}</span>
                  </div>
                  <div className="py-1 border-b border-gray-100">
                    <span className="text-gray-500">Sjabloon inhoud</span>
                    <pre className="mt-1 text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {(editForm.sjabloonInhoud as string) || '(Leeg)'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => wizardStep === 1 ? cancelDocWizard() : setWizardStep(wizardStep - 1)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              {wizardStep === 1 ? 'Annuleren' : 'Vorige stap'}
            </button>
            {wizardStep < 4 ? (
              <button
                onClick={() => setWizardStep(wizardStep + 1)}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Volgende stap
              </button>
            ) : (
              <button
                onClick={finishDocWizard}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                <Save className="w-3.5 h-3.5" />
                Opslaan
              </button>
            )}
          </div>

          {/* Delete button for editing */}
          {!isCreating && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (selectedId) {
                    handleDelete(selectedId)
                    cancelDocWizard()
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sjabloon verwijderen
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderBevestigingsSjablonenView() {
    const wizardSteps = [
      { nr: 1, label: 'Type bevestiging' },
      { nr: 2, label: 'Basisgegevens' },
      { nr: 3, label: 'E-mail' },
      { nr: 4, label: 'Verzendopties' },
      { nr: 5, label: 'Voltooid' },
    ]

    function startWizardCreate() {
      setWizardMode('wizard')
      setWizardStep(1)
      setIsCreating(true)
      setSelectedId(null)
      setEditForm({ naam: '', soort: 'Afspraakbevestiging', onderwerp: '', inhoud: '', verzendMoment: 'Direct na inplannen', actief: true })
    }

    function startWizardEdit(item: BevestigingsSjabloon) {
      setWizardMode('wizard')
      setWizardStep(1)
      setIsCreating(false)
      setSelectedId(item.id)
      setEditForm({ ...item })
    }

    function cancelWizard() {
      setWizardMode('list')
      setWizardStep(1)
      cancelEdit()
    }

    function finishWizard() {
      saveItem()
    }

    // List view
    if (wizardMode === 'list') {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
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
                onClick={startWizardCreate}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Nieuwe bevestiging
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Naam</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Soort</th>
                </tr>
              </thead>
              <tbody>
                {bevestigingsSjablonen.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => startWizardEdit(item)}
                  >
                    <td className="px-4 py-2 text-gray-700">{item.naam}</td>
                    <td className="px-4 py-2 text-gray-500">{item.soort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    // Wizard view
    return (
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isCreating ? 'Nieuwe bevestiging toevoegen' : 'Bevestiging bewerken'}
            </h2>
            <button onClick={cancelWizard} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {wizardSteps.map((step, i) => (
              <React.Fragment key={step.nr}>
                <button
                  onClick={() => setWizardStep(step.nr)}
                  className={`flex items-center gap-2 shrink-0 ${
                    wizardStep === step.nr
                      ? 'text-blue-600'
                      : wizardStep > step.nr
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                      wizardStep === step.nr
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : wizardStep > step.nr
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {wizardStep > step.nr ? <Check className="w-3.5 h-3.5" /> : step.nr}
                  </span>
                  <span className="text-xs font-medium hidden sm:inline">{step.label}</span>
                </button>
                {i < wizardSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${wizardStep > step.nr ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Soort:</h3>
                <div className="space-y-2">
                  {bevestigingSoorten.map((soort) => (
                    <label
                      key={soort}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        (editForm.soort as string) === soort
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="soort"
                        value={soort}
                        checked={(editForm.soort as string) === soort}
                        onChange={(e) => updateField('soort', e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{soort}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Basisgegevens</h3>
                <FormField label="Naam">
                  <input
                    type="text"
                    value={(editForm.naam as string) || ''}
                    onChange={(e) => updateField('naam', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Naam van het sjabloon"
                  />
                </FormField>
                <FormField label="Actief">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(editForm.actief as boolean) || false}
                      onChange={(e) => updateField('actief', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Sjabloon is actief</span>
                  </label>
                </FormField>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">E-mail inhoud</h3>
                <FormField label="Onderwerp">
                  <input
                    type="text"
                    value={(editForm.onderwerp as string) || ''}
                    onChange={(e) => updateField('onderwerp', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Onderwerp van de e-mail"
                  />
                </FormField>
                <FormField label="Inhoud">
                  <textarea
                    value={(editForm.inhoud as string) || ''}
                    onChange={(e) => updateField('inhoud', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                    rows={8}
                    placeholder="Gebruik {client_naam}, {datum}, {tijd}, {locatie}, {praktijk_naam} als variabelen"
                  />
                </FormField>
                <p className="text-xs text-gray-500">
                  Beschikbare variabelen: {'{client_naam}'}, {'{datum}'}, {'{tijd}'}, {'{locatie}'}, {'{praktijk_naam}'}
                </p>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Verzendopties</h3>
                <FormField label="Verzendmoment">
                  <select
                    value={(editForm.verzendMoment as string) || 'Direct na inplannen'}
                    onChange={(e) => updateField('verzendMoment', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option>Direct na inplannen</option>
                    <option>Direct na wijziging</option>
                    <option>Direct na annulering</option>
                    <option>24 uur van tevoren</option>
                    <option>48 uur van tevoren</option>
                    <option>1 week van tevoren</option>
                  </select>
                </FormField>
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Overzicht</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Soort</span>
                    <span className="text-gray-900">{editForm.soort as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Naam</span>
                    <span className="text-gray-900">{editForm.naam as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Onderwerp</span>
                    <span className="text-gray-900">{editForm.onderwerp as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Verzendmoment</span>
                    <span className="text-gray-900">{editForm.verzendMoment as string}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Actief</span>
                    <span className="text-gray-900">{(editForm.actief as boolean) ? 'Ja' : 'Nee'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => wizardStep === 1 ? cancelWizard() : setWizardStep(wizardStep - 1)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              {wizardStep === 1 ? 'Annuleren' : 'Vorige'}
            </button>
            {wizardStep < 5 ? (
              <button
                onClick={() => setWizardStep(wizardStep + 1)}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Volgende
              </button>
            ) : (
              <button
                onClick={finishWizard}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                <Save className="w-3.5 h-3.5" />
                Opslaan
              </button>
            )}
          </div>

          {/* Delete button for editing */}
          {!isCreating && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (selectedId) {
                    handleDelete(selectedId)
                    cancelWizard()
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sjabloon verwijderen
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderApplicatieUpdateView() {
    function loadSystemInfo() {
      setSystemInfoLoading(true)
      fetch('/api/ggz/system/status')
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        })
        .then((data) => {
          if (data.branch && data.recentCommits) {
            setSystemInfo(data)
          }
          setSystemInfoLoading(false)
        })
        .catch(() => {
          setSystemInfoLoading(false)
        })
    }

    function runUpdate() {
      setUpdateStatus('loading')
      setUpdateLogs([])
      fetch('/api/ggz/system/update', { method: 'POST' })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        })
        .then((data) => {
          setUpdateLogs(data.logs || [])
          setUpdateStatus(data.success ? 'success' : 'error')
          loadSystemInfo()
        })
        .catch((err) => {
          setUpdateLogs([`Fout bij verbinding: ${err.message}`])
          setUpdateStatus('error')
        })
    }

    return (
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-3xl mx-auto py-6 px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Applicatie-update</h2>

          {/* System info card */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Systeeminformatie</h3>
              <button
                onClick={loadSystemInfo}
                disabled={systemInfoLoading}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${systemInfoLoading ? 'animate-spin' : ''}`} />
                Vernieuwen
              </button>
            </div>
            {systemInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Versie</span>
                  <span className="text-gray-900 font-mono">{systemInfo.version}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Branch</span>
                  <span className="text-gray-900 font-mono">{systemInfo.branch}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Remote</span>
                  <span className="text-gray-900 font-mono text-xs">{systemInfo.remote}</span>
                </div>
                <div className="pt-2">
                  <span className="text-gray-500 text-xs">Recente commits:</span>
                  <div className="mt-1 bg-gray-900 rounded p-3 font-mono text-xs text-green-400 space-y-0.5">
                    {(systemInfo.recentCommits || []).map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Klik op &quot;Vernieuwen&quot; om systeeminformatie op te halen.
              </p>
            )}
          </div>

          {/* Update action */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-5 mb-6">
            <div className="flex items-start gap-4">
              <Download className="w-8 h-8 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Update uitvoeren</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Haalt de laatste code op van GitHub, installeert dependencies en bouwt de frontend opnieuw.
                </p>
                <button
                  onClick={runUpdate}
                  disabled={updateStatus === 'loading'}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white ${
                    updateStatus === 'loading'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${updateStatus === 'loading' ? 'animate-spin' : ''}`} />
                  {updateStatus === 'loading' ? 'Bezig met updaten...' : 'Nu updaten'}
                </button>
              </div>
            </div>
          </div>

          {/* Status banner */}
          {updateStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">Update succesvol uitgevoerd. Herstart de backend om alle wijzigingen door te voeren.</p>
            </div>
          )}
          {updateStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">Er zijn fouten opgetreden tijdens de update. Bekijk de logs hieronder.</p>
            </div>
          )}

          {/* Update logs */}
          {updateLogs.length > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
              <h3 className="font-medium text-gray-900 mb-3">Update log</h3>
              <div className="bg-gray-900 rounded p-4 font-mono text-xs text-gray-300 max-h-96 overflow-auto space-y-0.5">
                {updateLogs.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith('✓') ? 'text-green-400' :
                      line.startsWith('✗') ? 'text-red-400' :
                      line.startsWith('---') ? 'text-blue-400 font-bold mt-2' :
                      'text-gray-300'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
                setWizardMode('list')
                setWizardStep(1)
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
