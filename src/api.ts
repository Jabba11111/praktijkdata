const API_BASE = '/api/ggz'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Types
export interface Client {
  id: string
  voornaam: string
  achternaam: string
  geboortedatum: string
  bsn: string
  email: string
  telefoon: string
  adres: string
  postcode: string
  woonplaats: string
  verzekeraar: string
  polisnummer: string
  huisarts: string
  verwijzer: string
  zorgtype: 'basis_ggz' | 'specialistisch' | 'jeugd'
  zorgvraagtypering: string
  status: 'actief' | 'inactief' | 'wachtlijst'
  aanmelddatum: string
  notities: string
  created_at: string
  updated_at: string
}

export interface Afspraak {
  id: string
  client_id: string
  client_naam?: string
  datum: string
  starttijd: string
  eindtijd: string
  type: 'intake' | 'consult' | 'crisis' | 'groep' | 'telefonisch' | 'ehealth'
  status: 'gepland' | 'bevestigd' | 'afgerond' | 'no_show' | 'geannuleerd'
  locatie: string
  notities: string
  created_at: string
}

export interface DossierNotitie {
  id: string
  client_id: string
  datum: string
  type: 'consult' | 'intake' | 'aantekening' | 'brief' | 'verslag'
  onderwerp: string
  inhoud: string
  behandelaar: string
  created_at: string
}

export interface Behandelplan {
  id: string
  client_id: string
  diagnose_code: string
  diagnose_omschrijving: string
  hoofdklacht: string
  behandeldoelen: string
  interventies: string
  startdatum: string
  einddatum: string
  status: 'actief' | 'afgerond' | 'onderbroken'
  evaluatie: string
  created_at: string
  updated_at: string
}

export interface Factuur {
  id: string
  factuurnummer: string
  client_id: string
  client_naam?: string
  datum: string
  vervaldatum: string
  status: 'concept' | 'verstuurd' | 'betaald' | 'herinnering' | 'oninbaar'
  totaal: number
  btw: number
  declaratie_type: 'verzekerd' | 'onverzekerd' | 'pgb'
  vecozo_status: string
  notities: string
  created_at: string
  regels?: FactuurRegel[]
}

export interface FactuurRegel {
  id: string
  factuur_id: string
  prestatiecode: string
  omschrijving: string
  datum: string
  aantal: number
  tarief: number
  totaal: number
}

export interface RomTemplate {
  id: string
  naam: string
  code: string
  vragen: string
  scoring_info: string
}

export interface RomMeting {
  id: string
  client_id: string
  client_naam?: string
  template_id: string
  template_naam?: string
  template_code?: string
  datum: string
  antwoorden: string
  score: number | null
  interpretatie: string
  type: 'voormeting' | 'tussenmeting' | 'nameting'
  created_at: string
}

export interface Correspondentie {
  id: string
  client_id: string
  datum: string
  type: 'brief' | 'email' | 'zorgmail' | 'zorgdomein' | 'fax'
  richting: 'inkomend' | 'uitgaand'
  onderwerp: string
  inhoud: string
  ontvanger_afzender: string
  created_at: string
}

export interface DashboardStats {
  totaal_clienten: number
  actieve_clienten: number
  afspraken_vandaag: number
  afspraken_week: number
  openstaande_facturen: number
  omzet_maand: number
  rom_metingen_maand: number
  wachtlijst: number
}

// API functions
export const api = {
  // Dashboard
  getStats: () => request<DashboardStats>('/stats'),

  // Clienten
  getClienten: () => request<Client[]>('/clienten'),
  getClient: (id: string) => request<Client>(`/clienten/${id}`),
  createClient: (data: Partial<Client>) => request<Client>('/clienten', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: Partial<Client>) => request<Client>(`/clienten/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) => request<void>(`/clienten/${id}`, { method: 'DELETE' }),

  // Dossier
  getDossierNotities: (clientId: string) => request<DossierNotitie[]>(`/clienten/${clientId}/dossier`),
  createDossierNotitie: (clientId: string, data: Partial<DossierNotitie>) => request<DossierNotitie>(`/clienten/${clientId}/dossier`, { method: 'POST', body: JSON.stringify(data) }),

  // Behandelplannen
  getBehandelplannen: (clientId: string) => request<Behandelplan[]>(`/clienten/${clientId}/behandelplannen`),
  createBehandelplan: (clientId: string, data: Partial<Behandelplan>) => request<Behandelplan>(`/clienten/${clientId}/behandelplannen`, { method: 'POST', body: JSON.stringify(data) }),

  // Afspraken
  getAfspraken: (params?: { week?: string }) => {
    const query = params?.week ? `?week=${params.week}` : ''
    return request<Afspraak[]>(`/afspraken${query}`)
  },
  createAfspraak: (data: Partial<Afspraak>) => request<Afspraak>('/afspraken', { method: 'POST', body: JSON.stringify(data) }),
  updateAfspraak: (id: string, data: Partial<Afspraak>) => request<Afspraak>(`/afspraken/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAfspraak: (id: string) => request<void>(`/afspraken/${id}`, { method: 'DELETE' }),

  // Facturen
  getFacturen: () => request<Factuur[]>('/facturen'),
  getFactuur: (id: string) => request<Factuur>(`/facturen/${id}`),
  createFactuur: (data: Partial<Factuur> & { regels?: Partial<FactuurRegel>[] }) => request<Factuur>('/facturen', { method: 'POST', body: JSON.stringify(data) }),
  updateFactuurStatus: (id: string, status: string) => request<Factuur>(`/facturen/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // ROM
  getRomTemplates: () => request<RomTemplate[]>('/rom/templates'),
  getRomMetingen: (params?: { client_id?: string }) => {
    const query = params?.client_id ? `?client_id=${params.client_id}` : ''
    return request<RomMeting[]>(`/rom/metingen${query}`)
  },
  createRomMeting: (data: Partial<RomMeting>) => request<RomMeting>('/rom/metingen', { method: 'POST', body: JSON.stringify(data) }),

  // Correspondentie
  getCorrespondentie: (clientId: string) => request<Correspondentie[]>(`/clienten/${clientId}/correspondentie`),
  createCorrespondentie: (clientId: string, data: Partial<Correspondentie>) => request<Correspondentie>(`/clienten/${clientId}/correspondentie`, { method: 'POST', body: JSON.stringify(data) }),
}
