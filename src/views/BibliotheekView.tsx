import { useState } from 'react'
import {
  BookOpen,
  FileText,
  FolderOpen,
  Search,
  Plus,
  Download,
  Upload,
  Filter,
} from 'lucide-react'

interface Document {
  id: number
  titel: string
  categorie: string
  laatstGewijzigd: string
  bestandstype: string
  beschrijving: string
}

const categorieen = ['Alle', 'Brieven', 'Verslagen', 'Formulieren', 'Protocollen', 'Voorlichting']

const sampleDocumenten: Document[] = [
  {
    id: 1,
    titel: 'Intakeformulier GGZ',
    categorie: 'Formulieren',
    laatstGewijzigd: '10 mrt 2026',
    bestandstype: 'DOCX',
    beschrijving: 'Standaard intakeformulier voor nieuwe cliënten met anamnese en klachteninventarisatie.',
  },
  {
    id: 2,
    titel: 'Behandelplan Template',
    categorie: 'Formulieren',
    laatstGewijzigd: '08 mrt 2026',
    bestandstype: 'DOCX',
    beschrijving: 'Template voor het opstellen van een behandelplan conform de Zorgstandaarden GGZ.',
  },
  {
    id: 3,
    titel: 'Verwijsbrief Huisarts',
    categorie: 'Brieven',
    laatstGewijzigd: '05 mrt 2026',
    bestandstype: 'DOCX',
    beschrijving: 'Standaard terugkoppelingsbrief naar de verwijzend huisarts na intake of behandeling.',
  },
  {
    id: 4,
    titel: 'Informed Consent Behandeling',
    categorie: 'Formulieren',
    laatstGewijzigd: '01 mrt 2026',
    bestandstype: 'PDF',
    beschrijving: 'Toestemmingsformulier voor behandeling, inclusief uitleg over rechten en plichten.',
  },
  {
    id: 5,
    titel: 'Crisis Protocol',
    categorie: 'Protocollen',
    laatstGewijzigd: '25 feb 2026',
    bestandstype: 'PDF',
    beschrijving: 'Protocol voor het handelen bij suïcidaliteit en acute crisissituaties.',
  },
  {
    id: 6,
    titel: 'ROM Afname Protocol',
    categorie: 'Protocollen',
    laatstGewijzigd: '20 feb 2026',
    bestandstype: 'PDF',
    beschrijving: 'Richtlijnen voor de afname en verwerking van Routine Outcome Monitoring vragenlijsten.',
  },
  {
    id: 7,
    titel: 'Psycho-educatie Depressie',
    categorie: 'Voorlichting',
    laatstGewijzigd: '15 feb 2026',
    bestandstype: 'PDF',
    beschrijving: 'Voorlichtingsmateriaal over depressie voor cliënten en naasten.',
  },
  {
    id: 8,
    titel: 'Psycho-educatie Angststoornissen',
    categorie: 'Voorlichting',
    laatstGewijzigd: '15 feb 2026',
    bestandstype: 'PDF',
    beschrijving: 'Voorlichtingsmateriaal over angststoornissen, inclusief ontspanningsoefeningen.',
  },
  {
    id: 9,
    titel: 'Eindverslag Template',
    categorie: 'Verslagen',
    laatstGewijzigd: '10 feb 2026',
    bestandstype: 'DOCX',
    beschrijving: 'Template voor het eindverslag na afronding van de behandeling.',
  },
  {
    id: 10,
    titel: 'Ontslagbrief Cliënt',
    categorie: 'Brieven',
    laatstGewijzigd: '05 feb 2026',
    bestandstype: 'DOCX',
    beschrijving: 'Brief aan cliënt ter bevestiging van het afronden van de behandeling.',
  },
]

const bestandstypeKleur: Record<string, string> = {
  PDF: 'bg-red-100 text-red-700',
  DOCX: 'bg-blue-100 text-blue-700',
  XLSX: 'bg-green-100 text-green-700',
}

const categorieIcoon: Record<string, React.ReactNode> = {
  Brieven: <FileText className="w-8 h-8 text-blue-500" />,
  Verslagen: <FileText className="w-8 h-8 text-purple-500" />,
  Formulieren: <FolderOpen className="w-8 h-8 text-green-500" />,
  Protocollen: <BookOpen className="w-8 h-8 text-orange-500" />,
  Voorlichting: <BookOpen className="w-8 h-8 text-teal-500" />,
}

export default function BibliotheekView() {
  const [actieveCategorie, setActieveCategorie] = useState('Alle')
  const [zoekterm, setZoekterm] = useState('')

  const gefilterdeDocumenten = sampleDocumenten.filter((doc) => {
    const matchCategorie = actieveCategorie === 'Alle' || doc.categorie === actieveCategorie
    const matchZoek =
      zoekterm === '' ||
      doc.titel.toLowerCase().includes(zoekterm.toLowerCase()) ||
      doc.beschrijving.toLowerCase().includes(zoekterm.toLowerCase())
    return matchCategorie && matchZoek
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliotheek</h1>
          <p className="text-gray-500 mt-1">Documenten, templates en protocollen</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors">
            <Upload className="w-4 h-4" />
            Uploaden
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">
            <Plus className="w-4 h-4" />
            Nieuw document
          </button>
        </div>
      </div>

      {/* Zoek en filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek in documenten..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Categorie tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {categorieen.map((cat) => (
          <button
            key={cat}
            onClick={() => setActieveCategorie(cat)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              actieveCategorie === cat
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document grid */}
      {gefilterdeDocumenten.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Geen documenten gevonden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {gefilterdeDocumenten.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                {categorieIcoon[doc.categorie] || (
                  <FileText className="w-8 h-8 text-gray-400" />
                )}
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    bestandstypeKleur[doc.bestandstype] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {doc.bestandstype}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                {doc.titel}
              </h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{doc.beschrijving}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">Gewijzigd: {doc.laatstGewijzigd}</span>
                  <span className="text-xs text-gray-300 mx-2">|</span>
                  <span className="text-xs text-gray-400">{doc.categorie}</span>
                </div>
                <button className="p-1 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Samenvatting */}
      <div className="text-sm text-gray-400">
        {gefilterdeDocumenten.length} document{gefilterdeDocumenten.length !== 1 ? 'en' : ''} gevonden
      </div>
    </div>
  )
}
