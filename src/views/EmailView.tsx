import { useState } from 'react'
import {
  Mail,
  Inbox,
  Send,
  Star,
  Trash2,
  Search,
  Plus,
  Paperclip,
} from 'lucide-react'

interface Email {
  id: number
  van: string
  vanEmail: string
  aan: string
  aanEmail: string
  onderwerp: string
  preview: string
  body: string
  datum: string
  gelezen: boolean
  map: string
  bijlage?: boolean
  starred?: boolean
}

const sampleEmails: Email[] = [
  {
    id: 1,
    van: 'Dr. P. van der Berg',
    vanEmail: 'p.vanderberg@huisartspraktijk-centrum.nl',
    aan: 'Praktijk GGZ Voorbeeld',
    aanEmail: 'info@ggzvoorbeeld.nl',
    onderwerp: 'Verwijsbrief - Mw. Jansen (depressieve klachten)',
    preview: 'Geachte collega, hierbij verwijs ik bovengenoemde patiënte naar uw praktijk...',
    body: `Geachte collega,

Hierbij verwijs ik bovengenoemde patiënte, mw. A. Jansen (geb. 12-05-1989), naar uw praktijk in verband met aanhoudende depressieve klachten.

Anamnese: Patiënte presenteert zich sinds circa 3 maanden met somberheid, verminderde eetlust, slaapproblemen en concentratieproblemen. PHQ-9 score: 17 (matig-ernstig). Geen suïcidale ideatie.

Voorgeschiedenis: Geen eerdere GGZ-behandeling. Geen somatische comorbiditeit van belang.

Medicatie: Geen.

Verzoek: Graag beoordeling en eventuele behandeling in het kader van de Basis GGZ.

Met collegiale groet,
Dr. P. van der Berg
Huisarts`,
    datum: '13 mrt 2026, 09:15',
    gelezen: false,
    map: 'inbox',
    bijlage: true,
  },
  {
    id: 2,
    van: 'Apotheek De Linde',
    vanEmail: 'receptuur@apotheekdelinde.nl',
    aan: 'Praktijk GGZ Voorbeeld',
    aanEmail: 'info@ggzvoorbeeld.nl',
    onderwerp: 'Medicatie-interactie melding - Dhr. Bakker',
    preview: 'Betreft: signalering mogelijke interactie sertraline en tramadol bij dhr. Bakker...',
    body: `Geachte behandelaar,

Betreft: Dhr. R. Bakker (geb. 03-11-1975)

Bij het verwerken van het recept voor sertraline 100mg constateerden wij een mogelijke interactie met tramadol, dat door de huisarts is voorgeschreven in verband met rugklachten.

De combinatie kan leiden tot een verhoogd risico op serotoninesyndroom. Graag overleg of de sertraline gecontinueerd kan worden of dat een alternatief overwogen dient te worden.

Kunt u contact opnemen met de apotheek? Wij zijn bereikbaar op 020-5551234.

Met vriendelijke groet,
Apotheek De Linde
Drs. M. de Vries, apotheker`,
    datum: '13 mrt 2026, 08:42',
    gelezen: false,
    map: 'inbox',
  },
  {
    id: 3,
    van: 'Zilveren Kruis Zorgverzekeringen',
    vanEmail: 'declaraties@zilverenkruis.nl',
    aan: 'Praktijk GGZ Voorbeeld',
    aanEmail: 'info@ggzvoorbeeld.nl',
    onderwerp: 'Declaratie retourinformatie - Batch 2026-0312',
    preview: 'Uw declaratiebatch is verwerkt. 23 van de 25 declaraties zijn goedgekeurd...',
    body: `Geachte zorgaanbieder,

Uw declaratiebatch (referentie: 2026-0312) is verwerkt. Hieronder vindt u de samenvatting:

Totaal ingediend: 25 declaraties
Goedgekeurd: 23
Afgewezen: 2

Afgewezen declaraties:
- Cliënt 847392: Ontbrekende verwijsbrief (code R04)
- Cliënt 951204: Overschrijding maximaal aantal sessies prestatiecode (code F12)

De goedgekeurde declaraties worden binnen 14 werkdagen uitbetaald op het bij ons bekende rekeningnummer.

Voor vragen kunt u contact opnemen via het Zorgaanbiedersportaal.

Met vriendelijke groet,
Afdeling Declaraties
Zilveren Kruis Zorgverzekeringen`,
    datum: '12 mrt 2026, 16:30',
    gelezen: true,
    map: 'inbox',
    bijlage: true,
  },
  {
    id: 4,
    van: 'Laboratorium Diagnostiek Amsterdam',
    vanEmail: 'uitslagen@labamsterdam.nl',
    aan: 'Praktijk GGZ Voorbeeld',
    aanEmail: 'info@ggzvoorbeeld.nl',
    onderwerp: 'Laboratoriumuitslagen - Mw. de Groot (lithiumspiegel)',
    preview: 'De aangevraagde laboratoriumbepalingen voor mw. de Groot zijn beschikbaar...',
    body: `Geachte aanvrager,

De aangevraagde laboratoriumbepalingen voor mw. E. de Groot (geb. 22-08-1968) zijn beschikbaar.

Datum afname: 11-03-2026

Resultaten:
- Lithiumspiegel: 0,72 mmol/L (referentie: 0,6-1,0 mmol/L) ✓
- Creatinine: 78 µmol/L (referentie: 45-90 µmol/L) ✓
- TSH: 2,1 mU/L (referentie: 0,4-4,0 mU/L) ✓
- eGFR: 88 mL/min/1,73m² (referentie: >60) ✓

Alle waarden binnen de referentiewaarden. Geen actie vereist.

Met vriendelijke groet,
Laboratorium Diagnostiek Amsterdam`,
    datum: '12 mrt 2026, 11:05',
    gelezen: true,
    map: 'inbox',
  },
  {
    id: 5,
    van: 'AKWA GGZ',
    vanEmail: 'noreply@akwaggz.nl',
    aan: 'Praktijk GGZ Voorbeeld',
    aanEmail: 'info@ggzvoorbeeld.nl',
    onderwerp: 'Herinnering: ROM-aanlevering Q1 2026 deadline 31 maart',
    preview: 'Graag herinneren wij u aan de deadline voor de ROM-aanlevering over Q1 2026...',
    body: `Geachte zorgaanbieder,

Graag herinneren wij u aan de deadline voor de ROM-aanlevering over Q1 2026. De uiterste inleverdatum is 31 maart 2026.

Uw huidige aanleveringsstatus:
- Verwacht aantal dossiers: 142
- Reeds aangeleverd: 98 (69%)
- Nog aan te leveren: 44

Wij adviseren u om de resterende dossiers zo spoedig mogelijk aan te leveren via het aanleverportaal. Mocht u vragen hebben over het aanleverproces, raadpleeg dan onze handleiding op akwaggz.nl/rom-aanlevering.

Met vriendelijke groet,
AKWA GGZ
Kwaliteitsinstituut voor de GGZ`,
    datum: '11 mrt 2026, 14:20',
    gelezen: false,
    map: 'inbox',
  },
]

interface Folder {
  naam: string
  icon: React.ReactNode
  count?: number
  key: string
}

const folders: Folder[] = [
  { naam: 'Inbox', icon: <Inbox className="w-4 h-4" />, count: 3, key: 'inbox' },
  { naam: 'Verzonden', icon: <Send className="w-4 h-4" />, key: 'verzonden' },
  { naam: 'Concepten', icon: <Mail className="w-4 h-4" />, key: 'concepten' },
  { naam: 'Prullenbak', icon: <Trash2 className="w-4 h-4" />, key: 'prullenbak' },
  { naam: 'ZorgMail', icon: <Star className="w-4 h-4" />, key: 'zorgmail' },
]

export default function EmailView() {
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [zoekterm, setZoekterm] = useState('')

  const gefilterdeEmails = sampleEmails.filter(
    (e) =>
      e.map === selectedFolder &&
      (zoekterm === '' ||
        e.onderwerp.toLowerCase().includes(zoekterm.toLowerCase()) ||
        e.van.toLowerCase().includes(zoekterm.toLowerCase()))
  )

  return (
    <div className="flex h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Linker paneel - Mappen */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Nieuw bericht
          </button>
        </div>
        <nav className="flex-1 px-2">
          {folders.map((folder) => (
            <button
              key={folder.key}
              onClick={() => {
                setSelectedFolder(folder.key)
                setSelectedEmail(null)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                selectedFolder === folder.key
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {folder.icon}
              <span className="flex-1 text-left">{folder.naam}</span>
              {folder.count && folder.count > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {folder.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Midden - E-maillijst */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="E-mails zoeken..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {gefilterdeEmails.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Geen e-mails gevonden
            </div>
          ) : (
            gefilterdeEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                } ${!email.gelezen ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-sm truncate ${
                      !email.gelezen ? 'font-semibold text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {email.van}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {email.datum.split(',')[0]}
                  </span>
                </div>
                <div
                  className={`text-sm truncate mt-0.5 ${
                    !email.gelezen ? 'font-medium text-gray-800' : 'text-gray-600'
                  }`}
                >
                  {email.onderwerp}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 truncate flex-1">
                    {email.preview}
                  </span>
                  {email.bijlage && (
                    <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                {!email.gelezen && (
                  <div className="mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Rechter paneel - E-mailinhoud */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedEmail.onderwerp}
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {selectedEmail.van}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        &lt;{selectedEmail.vanEmail}&gt;
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{selectedEmail.datum}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Aan: {selectedEmail.aan} &lt;{selectedEmail.aanEmail}&gt;
                  </div>
                </div>
              </div>
              {selectedEmail.bijlage && (
                <div className="mt-4 flex items-center gap-2 p-2 bg-gray-50 rounded-lg w-fit">
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Bijlage (1 bestand)</span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-gray-700 whitespace-pre-line leading-relaxed max-w-2xl">
                {selectedEmail.body}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">
                <Send className="w-4 h-4" />
                Beantwoorden
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                <Send className="w-4 h-4" />
                Doorsturen
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                <Trash2 className="w-4 h-4" />
                Verwijderen
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Selecteer een e-mail om te lezen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
