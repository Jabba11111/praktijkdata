import { useState, useEffect } from 'react'
import { api, RomTemplate, RomMeting, Client } from '../api'
import {
  ClipboardList,
  Plus,
  BarChart3,
  User,
  Calendar,
  ChevronDown,
  X,
  Save,
  CheckCircle,
} from 'lucide-react'

interface ScoringRange {
  min: number
  max: number
  label: string
}

function parseVragen(vragen: string): string[] {
  try {
    return JSON.parse(vragen)
  } catch {
    return []
  }
}

function parseScoringInfo(scoringInfo: string): ScoringRange[] {
  try {
    return JSON.parse(scoringInfo)
  } catch {
    return []
  }
}

function getInterpretatie(score: number, scoringInfo: string): string {
  const ranges = parseScoringInfo(scoringInfo)
  for (const range of ranges) {
    if (score >= range.min && score <= range.max) {
      return range.label
    }
  }
  return ''
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'voormeting':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          Voormeting
        </span>
      )
    case 'tussenmeting':
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Tussenmeting
        </span>
      )
    case 'nameting':
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Nameting
        </span>
      )
    default:
      return null
  }
}

function getTemplateDescription(code: string): string {
  switch (code) {
    case 'PHQ-9':
      return 'Patient Health Questionnaire - meet de ernst van depressieve klachten'
    case 'GAD-7':
      return 'Generalized Anxiety Disorder - meet de ernst van angstklachten'
    case 'OQ-45':
      return 'Outcome Questionnaire - breed meetinstrument voor psychisch functioneren'
    case 'SQ-48':
      return 'Symptom Questionnaire - meet psychische en somatische klachten'
    default:
      return 'Vragenlijst'
  }
}

export default function GgzRomView() {
  const [templates, setTemplates] = useState<RomTemplate[]>([])
  const [metingen, setMetingen] = useState<RomMeting[]>([])
  const [clienten, setClienten] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<RomTemplate | null>(null)
  const [filterClient, setFilterClient] = useState('')
  const [filterTemplate, setFilterTemplate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // New measurement form state
  const [formClientId, setFormClientId] = useState('')
  const [formTemplateId, setFormTemplateId] = useState('')
  const [formType, setFormType] = useState<'voormeting' | 'tussenmeting' | 'nameting'>('voormeting')
  const [formDatum, setFormDatum] = useState(() => new Date().toISOString().split('T')[0])
  const [formAntwoorden, setFormAntwoorden] = useState<(number | null)[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [t, m, c] = await Promise.all([
        api.getRomTemplates(),
        api.getRomMetingen(),
        api.getClienten(),
      ])
      setTemplates(t)
      setMetingen(m)
      setClienten(c)
    } catch (err) {
      console.error('Fout bij laden van ROM-gegevens:', err)
    } finally {
      setLoading(false)
    }
  }

  function openModal(template?: RomTemplate) {
    setSelectedTemplate(template || null)
    setFormClientId('')
    setFormTemplateId(template?.id || '')
    setFormType('voormeting')
    setFormDatum(new Date().toISOString().split('T')[0])
    setSaveSuccess(false)

    if (template) {
      const vragen = parseVragen(template.vragen)
      setFormAntwoorden(new Array(vragen.length).fill(null))
    } else {
      setFormAntwoorden([])
    }

    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setSelectedTemplate(null)
    setFormAntwoorden([])
    setSaveSuccess(false)
  }

  function handleTemplateChange(templateId: string) {
    setFormTemplateId(templateId)
    const template = templates.find((t) => t.id === templateId)
    setSelectedTemplate(template || null)
    if (template) {
      const vragen = parseVragen(template.vragen)
      setFormAntwoorden(new Array(vragen.length).fill(null))
    } else {
      setFormAntwoorden([])
    }
  }

  function handleAnswerChange(questionIndex: number, value: number) {
    setFormAntwoorden((prev) => {
      const next = [...prev]
      next[questionIndex] = value
      return next
    })
  }

  function calculateScore(): number {
    return formAntwoorden.reduce<number>((sum, val) => sum + (val ?? 0), 0)
  }

  function getCurrentInterpretatie(): string {
    if (!selectedTemplate) return ''
    const score = calculateScore()
    return getInterpretatie(score, selectedTemplate.scoring_info)
  }

  function getMaxScaleValue(): number {
    if (!selectedTemplate) return 3
    const code = selectedTemplate.code
    if (code === 'PHQ-9' || code === 'GAD-7') return 3
    if (code === 'OQ-45') return 4
    if (code === 'SQ-48') return 4
    return 3
  }

  function getScaleLabels(): string[] {
    if (!selectedTemplate) return ['0', '1', '2', '3']
    const code = selectedTemplate.code
    if (code === 'PHQ-9') return ['Helemaal niet', 'Meerdere dagen', 'Meer dan de helft', 'Bijna elke dag']
    if (code === 'GAD-7') return ['Helemaal niet', 'Meerdere dagen', 'Meer dan de helft', 'Bijna elke dag']
    if (code === 'OQ-45') return ['Nooit', 'Zelden', 'Soms', 'Vaak', 'Bijna altijd']
    if (code === 'SQ-48') return ['Helemaal niet', 'Een beetje', 'Nogal', 'Heel erg', 'Zeer sterk']
    return ['0', '1', '2', '3']
  }

  async function handleSave() {
    if (!formClientId || !formTemplateId || !selectedTemplate) return

    const score = calculateScore()
    const interpretatie = getCurrentInterpretatie()

    setSaving(true)
    try {
      await api.createRomMeting({
        client_id: formClientId,
        template_id: formTemplateId,
        datum: formDatum,
        type: formType,
        antwoorden: JSON.stringify(formAntwoorden),
        score,
        interpretatie,
      })
      setSaveSuccess(true)
      const updatedMetingen = await api.getRomMetingen()
      setMetingen(updatedMetingen)
      setTimeout(() => {
        closeModal()
      }, 1200)
    } catch (err) {
      console.error('Fout bij opslaan van meting:', err)
    } finally {
      setSaving(false)
    }
  }

  const filteredMetingen = metingen
    .filter((m) => {
      if (filterClient && m.client_id !== filterClient) return false
      if (filterTemplate && m.template_id !== filterTemplate) return false
      return true
    })
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())

  const allAnswered =
    formAntwoorden.length > 0 && formAntwoorden.every((a) => a !== null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">ROM-gegevens laden...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardList className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">ROM Vragenlijsten</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe meting
        </button>
      </div>

      {/* ROM Templates Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />
          Beschikbare vragenlijsten
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => {
            const vragen = parseVragen(template.vragen)
            return (
              <div
                key={template.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{template.naam}</h3>
                    <span className="inline-flex items-center rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 mt-1">
                      {template.code}
                    </span>
                  </div>
                  <ClipboardList className="h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-2 text-sm text-gray-500">{getTemplateDescription(template.code)}</p>
                <p className="mt-1 text-xs text-gray-400">{vragen.length} vragen</p>
                <button
                  onClick={() => openModal(template)}
                  className="mt-4 w-full inline-flex items-center justify-center rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nieuwe meting
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Metingen */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-gray-500" />
          Recente metingen
        </h2>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="relative">
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="block w-56 rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none border"
            >
              <option value="">Alle cliënten</option>
              {clienten.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.voornaam} {c.achternaam}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <div className="relative">
            <select
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
              className="block w-56 rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none border"
            >
              <option value="">Alle vragenlijsten</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.naam} ({t.code})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliënt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vragenlijst
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interpretatie
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMetingen.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    Geen metingen gevonden
                  </td>
                </tr>
              ) : (
                filteredMetingen.map((meting) => (
                  <tr key={meting.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(meting.datum).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        {meting.client_naam || meting.client_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {meting.template_naam || meting.template_code || meting.template_id}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {getTypeBadge(meting.type)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {meting.score !== null ? meting.score : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {meting.interpretatie || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Measurement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-16">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="relative w-full max-w-3xl transform rounded-xl bg-white shadow-2xl transition-all">
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-indigo-600" />
                  Nieuwe ROM-meting
                </h2>
                <button
                  onClick={closeModal}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-5">
                {/* Client select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliënt
                  </label>
                  <div className="relative">
                    <select
                      value={formClientId}
                      onChange={(e) => setFormClientId(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                    >
                      <option value="">Selecteer een cliënt...</option>
                      {clienten.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.voornaam} {c.achternaam}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Template select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vragenlijst
                  </label>
                  <div className="relative">
                    <select
                      value={formTemplateId}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                    >
                      <option value="">Selecteer een vragenlijst...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.naam} ({t.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Type and Datum row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type meting
                    </label>
                    <div className="relative">
                      <select
                        value={formType}
                        onChange={(e) =>
                          setFormType(e.target.value as 'voormeting' | 'tussenmeting' | 'nameting')
                        }
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                      >
                        <option value="voormeting">Voormeting</option>
                        <option value="tussenmeting">Tussenmeting</option>
                        <option value="nameting">Nameting</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datum
                    </label>
                    <input
                      type="date"
                      value={formDatum}
                      onChange={(e) => setFormDatum(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Questions */}
                {selectedTemplate && (
                  <div className="space-y-4">
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Vragen — {selectedTemplate.naam} ({selectedTemplate.code})
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Beantwoord alle vragen door een score te selecteren.
                      </p>
                    </div>

                    {parseVragen(selectedTemplate.vragen).map((vraag, index) => {
                      const maxScale = getMaxScaleValue()
                      const labels = getScaleLabels()
                      return (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                        >
                          <p className="text-sm font-medium text-gray-800 mb-3">
                            <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 h-6 w-6 text-xs font-bold mr-2">
                              {index + 1}
                            </span>
                            {vraag}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: maxScale + 1 }, (_, i) => i).map((value) => (
                              <label
                                key={value}
                                className={`flex items-center rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                                  formAntwoorden[index] === value
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`vraag-${index}`}
                                  value={value}
                                  checked={formAntwoorden[index] === value}
                                  onChange={() => handleAnswerChange(index, value)}
                                  className="sr-only"
                                />
                                <span className="font-medium mr-1.5">{value}</span>
                                <span className="text-xs text-gray-500">
                                  {labels[value] || ''}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    {/* Score summary */}
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-900">Totale score</p>
                          <p className="text-3xl font-bold text-indigo-700 mt-1">
                            {calculateScore()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-indigo-900">Interpretatie</p>
                          <p className="text-lg font-semibold text-indigo-700 mt-1">
                            {getCurrentInterpretatie() || '—'}
                          </p>
                        </div>
                      </div>
                      {!allAnswered && formAntwoorden.length > 0 && (
                        <p className="text-xs text-indigo-600 mt-2">
                          {formAntwoorden.filter((a) => a !== null).length} van{' '}
                          {formAntwoorden.length} vragen beantwoord
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end space-x-3 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={closeModal}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Annuleren
                </button>
                {saveSuccess ? (
                  <div className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Opgeslagen
                  </div>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={!formClientId || !formTemplateId || !allAnswered || saving}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Opslaan...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Opslaan
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
