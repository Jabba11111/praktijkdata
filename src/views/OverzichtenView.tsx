import { useState } from 'react'
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Filter,
  Clock,
  Users,
  Euro,
} from 'lucide-react'

interface Rapport {
  id: string
  titel: string
  beschrijving: string
  icon: React.ReactNode
  sectie: string
}

interface RapportDetail {
  kolommen: string[]
  rijen: string[][]
}

const rapportSecties: Record<string, { titel: string; icon: React.ReactNode }> = {
  client: { titel: 'Cliëntoverzichten', icon: <Users className="w-5 h-5 text-blue-600" /> },
  financieel: { titel: 'Financiële overzichten', icon: <Euro className="w-5 h-5 text-green-600" /> },
  productie: { titel: 'Productie overzichten', icon: <Clock className="w-5 h-5 text-purple-600" /> },
  rom: { titel: 'ROM overzichten', icon: <BarChart3 className="w-5 h-5 text-orange-600" /> },
}

const rapporten: Rapport[] = [
  // Cliëntoverzichten
  {
    id: 'clientenlijst',
    titel: 'Cliëntenlijst',
    beschrijving: 'Overzicht van alle actieve en inactieve cliënten met contactgegevens.',
    icon: <Users className="w-6 h-6 text-blue-500" />,
    sectie: 'client',
  },
  {
    id: 'wachtlijst',
    titel: 'Wachtlijst',
    beschrijving: 'Actueel overzicht van cliënten op de wachtlijst en wachttijden.',
    icon: <Clock className="w-6 h-6 text-blue-500" />,
    sectie: 'client',
  },
  {
    id: 'diagnose',
    titel: 'Diagnose-overzicht',
    beschrijving: 'Verdeling van diagnoses over het cliëntenbestand (DSM-5).',
    icon: <FileText className="w-6 h-6 text-blue-500" />,
    sectie: 'client',
  },
  {
    id: 'behandelplan',
    titel: 'Behandelplan-overzicht',
    beschrijving: 'Status van behandelplannen: actueel, verlopen of in concept.',
    icon: <FileText className="w-6 h-6 text-blue-500" />,
    sectie: 'client',
  },
  // Financiële overzichten
  {
    id: 'omzet',
    titel: 'Omzetoverzicht',
    beschrijving: 'Maandelijks en jaarlijks omzetoverzicht met vergelijking vorig jaar.',
    icon: <Euro className="w-6 h-6 text-green-500" />,
    sectie: 'financieel',
  },
  {
    id: 'declaratie',
    titel: 'Declaratieoverzicht',
    beschrijving: 'Alle declaraties met status: ingediend, goedgekeurd, afgewezen.',
    icon: <FileText className="w-6 h-6 text-green-500" />,
    sectie: 'financieel',
  },
  {
    id: 'openstaand',
    titel: 'Openstaande facturen',
    beschrijving: 'Overzicht van nog niet betaalde facturen en ouderdomsanalyse.',
    icon: <Calendar className="w-6 h-6 text-green-500" />,
    sectie: 'financieel',
  },
  {
    id: 'betaling',
    titel: 'Betalingsoverzicht',
    beschrijving: 'Ontvangen betalingen per periode met specificatie per verzekeraar.',
    icon: <Euro className="w-6 h-6 text-green-500" />,
    sectie: 'financieel',
  },
  // Productie overzichten
  {
    id: 'afspraken',
    titel: 'Afspraken-overzicht',
    beschrijving: 'Totaal aantal afspraken per behandelaar, type en periode.',
    icon: <Calendar className="w-6 h-6 text-purple-500" />,
    sectie: 'productie',
  },
  {
    id: 'noshow',
    titel: 'No-show rapportage',
    beschrijving: 'Overzicht van niet nagekomen afspraken met percentages per maand.',
    icon: <Clock className="w-6 h-6 text-purple-500" />,
    sectie: 'productie',
  },
  {
    id: 'productie-behandelaar',
    titel: 'Productie per behandelaar',
    beschrijving: 'Productiecijfers uitgesplitst per behandelaar (consulten, uren, omzet).',
    icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
    sectie: 'productie',
  },
  {
    id: 'bezetting',
    titel: 'Bezettingsgraad',
    beschrijving: 'Percentage bezette behandelslots versus beschikbare capaciteit.',
    icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
    sectie: 'productie',
  },
  // ROM overzichten
  {
    id: 'rom-respons',
    titel: 'ROM-respons',
    beschrijving: 'Responspercentage ROM-vragenlijsten per behandelaar en periode.',
    icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
    sectie: 'rom',
  },
  {
    id: 'uitkomsten-diagnose',
    titel: 'Uitkomsten per diagnose',
    beschrijving: 'Gemiddelde ROM-uitkomsten uitgesplitst per diagnosegroep.',
    icon: <FileText className="w-6 h-6 text-orange-500" />,
    sectie: 'rom',
  },
  {
    id: 'sbg-akwa',
    titel: 'Aanlevering SBG/AKWA',
    beschrijving: 'Status van ROM-aanleveringen aan SBG/AKWA GGZ per kwartaal.',
    icon: <FileText className="w-6 h-6 text-orange-500" />,
    sectie: 'rom',
  },
]

const rapportDetails: Record<string, RapportDetail> = {
  clientenlijst: {
    kolommen: ['Cliëntnr.', 'Naam', 'Geb.datum', 'Diagnose', 'Behandelaar', 'Status'],
    rijen: [
      ['C-2024001', 'Mw. A. Jansen', '12-05-1989', 'Depressieve stoornis', 'Dr. Smit', 'Actief'],
      ['C-2024015', 'Dhr. R. Bakker', '03-11-1975', 'Gegeneraliseerde angststoornis', 'Drs. de Vries', 'Actief'],
      ['C-2024023', 'Mw. S. de Vries', '22-08-1968', 'Bipolaire stoornis', 'Dr. Smit', 'Actief'],
      ['C-2024031', 'Dhr. K. Yilmaz', '15-03-1992', 'PTSS', 'Drs. Mulder', 'Actief'],
      ['C-2024042', 'Mw. L. Visser', '30-07-1985', 'Sociale angststoornis', 'Drs. de Vries', 'Wachtlijst'],
    ],
  },
  wachtlijst: {
    kolommen: ['Cliëntnr.', 'Naam', 'Aanmelddatum', 'Wachttijd', 'Urgentie', 'Zorgtype'],
    rijen: [
      ['C-2026045', 'Mw. L. Visser', '15-01-2026', '8 weken', 'Normaal', 'Basis GGZ'],
      ['C-2026048', 'Dhr. J. Hendriks', '22-01-2026', '7 weken', 'Normaal', 'Specialistisch'],
      ['C-2026052', 'Mw. F. Bosman', '01-02-2026', '5 weken', 'Verhoogd', 'Basis GGZ'],
      ['C-2026055', 'Dhr. M. Kuiper', '10-02-2026', '4 weken', 'Normaal', 'Specialistisch'],
    ],
  },
  omzet: {
    kolommen: ['Maand', 'Gedeclareerd', 'Betaald', 'Openstaand', 'Verschil'],
    rijen: [
      ['Januari 2026', '€ 28.450', '€ 26.200', '€ 2.250', '€ 0'],
      ['Februari 2026', '€ 31.200', '€ 28.800', '€ 2.400', '€ 0'],
      ['Maart 2026', '€ 18.600', '€ 8.200', '€ 10.400', '€ 0'],
    ],
  },
  noshow: {
    kolommen: ['Maand', 'Totaal afspraken', 'No-shows', 'Percentage', 'Kosten'],
    rijen: [
      ['Januari 2026', '186', '8', '4,3%', '€ 960'],
      ['Februari 2026', '172', '11', '6,4%', '€ 1.320'],
      ['Maart 2026 (t/m heden)', '98', '4', '4,1%', '€ 480'],
    ],
  },
  'rom-respons': {
    kolommen: ['Behandelaar', 'Verzonden', 'Ingevuld', 'Respons%', 'Gem. score'],
    rijen: [
      ['Dr. Smit', '45', '38', '84%', '62,3'],
      ['Drs. de Vries', '38', '29', '76%', '58,7'],
      ['Drs. Mulder', '32', '28', '88%', '65,1'],
      ['Totaal', '115', '95', '83%', '62,0'],
    ],
  },
}

// Default placeholder for reports without specific detail data
const defaultDetail: RapportDetail = {
  kolommen: ['Kolom 1', 'Kolom 2', 'Kolom 3', 'Kolom 4'],
  rijen: [
    ['Voorbeeld data', 'Voorbeeld', '100', 'Actief'],
    ['Voorbeeld data', 'Voorbeeld', '200', 'Actief'],
    ['Voorbeeld data', 'Voorbeeld', '150', 'Inactief'],
  ],
}

export default function OverzichtenView() {
  const [geselecteerdRapport, setGeselecteerdRapport] = useState<Rapport | null>(null)

  if (geselecteerdRapport) {
    const detail = rapportDetails[geselecteerdRapport.id] || defaultDetail
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGeselecteerdRapport(null)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              &larr; Terug naar overzichten
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors">
              <Calendar className="w-4 h-4" />
              Periode
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">
              <Download className="w-4 h-4" />
              Exporteer
            </button>
          </div>
        </div>

        {/* Rapport header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            {geselecteerdRapport.icon}
            <h1 className="text-xl font-bold text-gray-900">{geselecteerdRapport.titel}</h1>
          </div>
          <p className="text-gray-500 text-sm">{geselecteerdRapport.beschrijving}</p>
          <p className="text-xs text-gray-400 mt-2">
            Laatst bijgewerkt: 13 maart 2026, 08:00
          </p>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {detail.kolommen.map((kol, i) => (
                    <th
                      key={i}
                      className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3"
                    >
                      {kol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.rijen.map((rij, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    {rij.map((cel, j) => (
                      <td key={j} className="px-6 py-3 text-sm text-gray-700">
                        {cel}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {detail.rijen.length} rijen weergegeven. Gebruik de exportfunctie voor een volledig overzicht.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overzichten</h1>
        <p className="text-gray-500 mt-1">Rapportages en overzichten voor uw praktijk</p>
      </div>

      {/* Secties */}
      {Object.entries(rapportSecties).map(([key, sectie]) => {
        const sectieRapporten = rapporten.filter((r) => r.sectie === key)
        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-4">
              {sectie.icon}
              <h2 className="text-lg font-semibold text-gray-900">{sectie.titel}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sectieRapporten.map((rapport) => (
                <button
                  key={rapport.id}
                  onClick={() => setGeselecteerdRapport(rapport)}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="mb-3">{rapport.icon}</div>
                  <h3 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                    {rapport.titel}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {rapport.beschrijving}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
