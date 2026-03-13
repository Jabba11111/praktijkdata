import { useState } from 'react'
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  User,
} from 'lucide-react'

interface Bericht {
  id: number
  afzender: 'behandelaar' | 'client'
  tekst: string
  tijdstip: string
}

interface Conversatie {
  id: number
  clientNaam: string
  laatsteBericht: string
  tijdstip: string
  ongelezen: number
  berichten: Bericht[]
}

const sampleConversaties: Conversatie[] = [
  {
    id: 1,
    clientNaam: 'Mw. A. Jansen',
    laatsteBericht: 'Bedankt voor de bevestiging, tot donderdag!',
    tijdstip: '10:32',
    ongelezen: 2,
    berichten: [
      {
        id: 1,
        afzender: 'behandelaar',
        tekst: 'Goedemorgen mevrouw Jansen, hierbij bevestig ik uw afspraak op donderdag 15 maart om 14:00 uur. Het betreft een regulier consult van 45 minuten.',
        tijdstip: '09:15',
      },
      {
        id: 2,
        afzender: 'client',
        tekst: 'Goedemorgen, dank u wel. Is het mogelijk om een half uur eerder te komen? Dan kan ik nog de vragenlijst invullen.',
        tijdstip: '09:45',
      },
      {
        id: 3,
        afzender: 'behandelaar',
        tekst: 'Dat is prima, u kunt om 13:30 aanwezig zijn. De vragenlijst kunt u ook alvast thuis invullen via het cliëntportaal. Ik heb de link zojuist naar u gestuurd.',
        tijdstip: '10:02',
      },
      {
        id: 4,
        afzender: 'client',
        tekst: 'Bedankt voor de bevestiging, tot donderdag!',
        tijdstip: '10:32',
      },
    ],
  },
  {
    id: 2,
    clientNaam: 'Dhr. R. Bakker',
    laatsteBericht: 'Ik heb het dagboek bijgehouden zoals besproken, maar vind het lastig om...',
    tijdstip: 'Gisteren',
    ongelezen: 1,
    berichten: [
      {
        id: 1,
        afzender: 'behandelaar',
        tekst: 'Beste meneer Bakker, zoals besproken tijdens ons laatste consult stuur ik u hierbij het huiswerk voor de komende week. Graag dagelijks uw stemming bijhouden in het dagboek en minimaal één activiteit per dag uit de plezierige activiteitenlijst uitvoeren.',
        tijdstip: 'Ma 10:00',
      },
      {
        id: 2,
        afzender: 'behandelaar',
        tekst: 'Daarnaast wilde ik u herinneren aan de gedachteregistratie-oefening. Probeer bij negatieve gedachten de ABC-methode toe te passen die we geoefend hebben.',
        tijdstip: 'Ma 10:01',
      },
      {
        id: 3,
        afzender: 'client',
        tekst: 'Dank u wel. Ik ga ermee aan de slag. Mag ik tussendoor een vraag stellen als ik ergens vastloop?',
        tijdstip: 'Ma 14:22',
      },
      {
        id: 4,
        afzender: 'behandelaar',
        tekst: 'Uiteraard, u kunt mij altijd een bericht sturen. Ik reageer meestal binnen één werkdag.',
        tijdstip: 'Ma 15:10',
      },
      {
        id: 5,
        afzender: 'client',
        tekst: 'Ik heb het dagboek bijgehouden zoals besproken, maar vind het lastig om de gedachteregistratie goed toe te passen. Vooral het onderscheid tussen gedachten en gevoelens vind ik moeilijk.',
        tijdstip: 'Gisteren 16:45',
      },
    ],
  },
  {
    id: 3,
    clientNaam: 'Mw. S. de Vries',
    laatsteBericht: 'Ik heb de OQ-45 ingevuld via het portaal.',
    tijdstip: 'Gisteren',
    ongelezen: 0,
    berichten: [
      {
        id: 1,
        afzender: 'behandelaar',
        tekst: 'Beste mevrouw De Vries, ter voorbereiding op uw volgende afspraak verzoek ik u om de OQ-45 vragenlijst in te vullen via het cliëntportaal. Dit helpt ons om uw voortgang in kaart te brengen.',
        tijdstip: 'Di 09:00',
      },
      {
        id: 2,
        afzender: 'client',
        tekst: 'Goedemiddag, ik heb geprobeerd in te loggen maar mijn wachtwoord werkt niet meer. Kunt u dit resetten?',
        tijdstip: 'Di 13:15',
      },
      {
        id: 3,
        afzender: 'behandelaar',
        tekst: 'Ik heb een nieuw tijdelijk wachtwoord ingesteld. U kunt inloggen met het wachtwoord dat ik separaat per SMS heb verzonden. Na inloggen wordt u gevraagd een nieuw wachtwoord te kiezen.',
        tijdstip: 'Di 14:30',
      },
      {
        id: 4,
        afzender: 'client',
        tekst: 'Ik heb de OQ-45 ingevuld via het portaal.',
        tijdstip: 'Gisteren 11:20',
      },
      {
        id: 5,
        afzender: 'behandelaar',
        tekst: 'Hartelijk dank! Ik heb de resultaten ontvangen en neem deze mee in ons volgende gesprek op vrijdag.',
        tijdstip: 'Gisteren 13:05',
      },
    ],
  },
  {
    id: 4,
    clientNaam: 'Dhr. K. Yilmaz',
    laatsteBericht: 'Kan ik mijn afspraak van vrijdag verzetten naar volgende week?',
    tijdstip: 'Wo',
    ongelezen: 1,
    berichten: [
      {
        id: 1,
        afzender: 'client',
        tekst: 'Goedemorgen, ik wilde u laten weten dat de medicatie-aanpassing goed gaat. De bijwerkingen van de eerste week zijn verdwenen.',
        tijdstip: 'Ma 08:30',
      },
      {
        id: 2,
        afzender: 'behandelaar',
        tekst: 'Fijn om te horen! Dat is in lijn met wat we verwachtten. Houdt u de bijwerkingen goed bij via het dagboek? Dit bespreken we bij het volgende consult.',
        tijdstip: 'Ma 11:00',
      },
      {
        id: 3,
        afzender: 'client',
        tekst: 'Ja, ik houd alles bij. Nog een vraag: kan ik mijn afspraak van vrijdag verzetten naar volgende week? Ik heb een begrafenis.',
        tijdstip: 'Wo 09:15',
      },
    ],
  },
]

export default function ConversatiesView() {
  const [geselecteerdeConversatie, setGeselecteerdeConversatie] = useState<Conversatie | null>(
    sampleConversaties[0]
  )
  const [zoekterm, setZoekterm] = useState('')
  const [nieuwBericht, setNieuwBericht] = useState('')

  const gefilterdeConversaties = sampleConversaties.filter(
    (c) =>
      zoekterm === '' ||
      c.clientNaam.toLowerCase().includes(zoekterm.toLowerCase()) ||
      c.laatsteBericht.toLowerCase().includes(zoekterm.toLowerCase())
  )

  return (
    <div className="flex h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Linker paneel - Conversatielijst */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Berichten</h2>
            <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek in conversaties..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {gefilterdeConversaties.map((conversatie) => (
            <button
              key={conversatie.id}
              onClick={() => setGeselecteerdeConversatie(conversatie)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                geselecteerdeConversatie?.id === conversatie.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm">
                      {conversatie.clientNaam}
                    </span>
                    <span className="text-xs text-gray-400">{conversatie.tijdstip}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {conversatie.laatsteBericht}
                  </p>
                </div>
                {conversatie.ongelezen > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                    {conversatie.ongelezen}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rechter paneel - Berichten */}
      <div className="flex-1 flex flex-col">
        {geselecteerdeConversatie ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {geselecteerdeConversatie.clientNaam}
                </h3>
                <p className="text-xs text-gray-500">Beveiligd berichtenverkeer</p>
              </div>
            </div>

            {/* Berichten */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {geselecteerdeConversatie.berichten.map((bericht) => (
                <div
                  key={bericht.id}
                  className={`flex ${
                    bericht.afzender === 'behandelaar' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 ${
                      bericht.afzender === 'behandelaar'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{bericht.tekst}</p>
                    <p
                      className={`text-xs mt-1 ${
                        bericht.afzender === 'behandelaar'
                          ? 'text-blue-200'
                          : 'text-gray-400'
                      }`}
                    >
                      {bericht.tijdstip}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Invoer */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={nieuwBericht}
                    onChange={(e) => setNieuwBericht(e.target.value)}
                    placeholder="Typ een bericht..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Berichten worden versleuteld verzonden conform NEN 7510
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Selecteer een conversatie</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
