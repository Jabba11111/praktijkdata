import { useState, useEffect } from 'react'
import { api, Afspraak, Client } from '../api'
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, X, Save, MapPin } from 'lucide-react'

const AFSPRAAK_TYPES = [
  { value: 'intake', label: 'Intake', color: 'bg-blue-500', lightColor: 'bg-blue-100 border-blue-300 text-blue-900' },
  { value: 'consult', label: 'Consult', color: 'bg-green-500', lightColor: 'bg-green-100 border-green-300 text-green-900' },
  { value: 'crisis', label: 'Crisis', color: 'bg-red-500', lightColor: 'bg-red-100 border-red-300 text-red-900' },
  { value: 'groep', label: 'Groep', color: 'bg-purple-500', lightColor: 'bg-purple-100 border-purple-300 text-purple-900' },
  { value: 'telefonisch', label: 'Telefonisch', color: 'bg-yellow-500', lightColor: 'bg-yellow-100 border-yellow-300 text-yellow-900' },
  { value: 'ehealth', label: 'E-health', color: 'bg-cyan-500', lightColor: 'bg-cyan-100 border-cyan-300 text-cyan-900' },
] as const

const STATUS_OPTIONS = [
  { value: 'gepland', label: 'Gepland', dotColor: 'bg-gray-400' },
  { value: 'bevestigd', label: 'Bevestigd', dotColor: 'bg-green-500' },
  { value: 'afgerond', label: 'Afgerond', dotColor: 'bg-blue-500' },
  { value: 'no_show', label: 'No-show', dotColor: 'bg-red-500' },
  { value: 'geannuleerd', label: 'Geannuleerd', dotColor: 'bg-orange-400' },
] as const

const DAY_NAMES = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag']
const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

const START_HOUR = 8
const END_HOUR = 18
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

interface AfspraakFormData {
  client_id: string
  datum: string
  starttijd: string
  eindtijd: string
  type: Afspraak['type']
  status: Afspraak['status']
  locatie: string
  notities: string
}

const emptyForm: AfspraakFormData = {
  client_id: '',
  datum: '',
  starttijd: '09:00',
  eindtijd: '09:45',
  type: 'consult',
  status: 'gepland',
  locatie: '',
  notities: '',
}

function getWeekDates(date: Date): Date[] {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 5 }, (_, i) => {
    const weekDay = new Date(monday)
    weekDay.setDate(monday.getDate() + i)
    return weekDay
  })
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTime(time: string): string {
  return time.substring(0, 5)
}

function getTypeConfig(type: Afspraak['type']) {
  return AFSPRAAK_TYPES.find((t) => t.value === type) || AFSPRAAK_TYPES[1]
}

function getStatusDotColor(status: Afspraak['status']): string {
  const found = STATUS_OPTIONS.find((s) => s.value === status)
  return found ? found.dotColor : 'bg-gray-400'
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export default function GgzAgendaView() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [afspraken, setAfspraken] = useState<Afspraak[]>([])
  const [clienten, setClienten] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAfspraak, setEditingAfspraak] = useState<Afspraak | null>(null)
  const [formData, setFormData] = useState<AfspraakFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const weekDates = getWeekDates(currentDate)
  const weekNumber = getWeekNumber(weekDates[0])
  const weekStart = formatDate(weekDates[0])
  const weekEnd = formatDate(weekDates[4])

  useEffect(() => {
    loadAfspraken()
  }, [currentDate])

  useEffect(() => {
    loadClienten()
  }, [])

  async function loadAfspraken() {
    setLoading(true)
    try {
      const mondayISO = formatDateISO(weekDates[0])
      const data = await api.getAfspraken({ week: mondayISO })
      setAfspraken(data)
    } catch (err) {
      console.error('Fout bij laden afspraken:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadClienten() {
    try {
      const data = await api.getClienten()
      setClienten(data)
    } catch (err) {
      console.error('Fout bij laden clienten:', err)
    }
  }

  function navigateWeek(direction: number) {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + direction * 7)
    setCurrentDate(next)
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  function openNewAfspraak() {
    setEditingAfspraak(null)
    setFormData({ ...emptyForm, datum: formatDateISO(new Date()) })
    setModalOpen(true)
  }

  function openEditAfspraak(afspraak: Afspraak) {
    setEditingAfspraak(afspraak)
    setFormData({
      client_id: afspraak.client_id,
      datum: afspraak.datum,
      starttijd: afspraak.starttijd,
      eindtijd: afspraak.eindtijd,
      type: afspraak.type,
      status: afspraak.status,
      locatie: afspraak.locatie,
      notities: afspraak.notities,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingAfspraak(null)
    setFormData(emptyForm)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editingAfspraak) {
        await api.updateAfspraak(editingAfspraak.id, formData)
      } else {
        await api.createAfspraak(formData)
      }
      closeModal()
      await loadAfspraken()
    } catch (err) {
      console.error('Fout bij opslaan afspraak:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingAfspraak) return
    if (!window.confirm('Weet u zeker dat u deze afspraak wilt verwijderen?')) return
    setSaving(true)
    try {
      await api.deleteAfspraak(editingAfspraak.id)
      closeModal()
      await loadAfspraken()
    } catch (err) {
      console.error('Fout bij verwijderen afspraak:', err)
    } finally {
      setSaving(false)
    }
  }

  function updateForm(field: keyof AfspraakFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function getAfsprakenForDay(date: Date): Afspraak[] {
    const iso = formatDateISO(date)
    return afspraken.filter((a) => a.datum === iso)
  }

  function getAfspraakStyle(afspraak: Afspraak): React.CSSProperties {
    const startMinutes = timeToMinutes(afspraak.starttijd) - START_HOUR * 60
    const endMinutes = timeToMinutes(afspraak.eindtijd) - START_HOUR * 60
    const duration = endMinutes - startMinutes
    const totalMinutes = (END_HOUR - START_HOUR) * 60
    return {
      top: `${(startMinutes / totalMinutes) * 100}%`,
      height: `${Math.max((duration / totalMinutes) * 100, 2.5)}%`,
    }
  }

  function getClientNaam(afspraak: Afspraak): string {
    if (afspraak.client_naam) return afspraak.client_naam
    const client = clienten.find((c) => c.id === afspraak.client_id)
    if (client) return `${client.voornaam} ${client.achternaam}`
    return 'Onbekend'
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Week header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Agenda</h1>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
              title="Vorige week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              Vandaag
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
              title="Volgende week"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <span className="ml-4 text-sm text-gray-600">
            Week {weekNumber} &mdash; {weekStart} t/m {weekEnd}
          </span>
        </div>
        <button
          onClick={openNewAfspraak}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nieuwe afspraak
        </button>
      </div>

      {/* Week grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Time gutter */}
        <div className="flex flex-col w-16 flex-shrink-0 border-r border-gray-200 bg-white">
          <div className="h-12 border-b border-gray-200" />
          <div className="flex-1 relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full text-right pr-2 text-xs text-gray-400"
                style={{
                  top: `${((hour - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                  transform: 'translateY(-50%)',
                }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        <div className="flex flex-1 overflow-x-auto">
          {weekDates.map((date, dayIndex) => {
            const dayAfspraken = getAfsprakenForDay(date)
            const isToday = formatDateISO(date) === formatDateISO(new Date())
            return (
              <div
                key={dayIndex}
                className="flex flex-col flex-1 min-w-[180px] border-r border-gray-200 last:border-r-0"
              >
                {/* Day header */}
                <div
                  className={`flex flex-col items-center justify-center h-12 border-b text-sm ${
                    isToday
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <span className={`font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                    {DAY_NAMES[dayIndex]}
                  </span>
                  <span className={`text-xs ${isToday ? 'text-blue-500' : 'text-gray-400'}`}>
                    {date.getDate()} {MONTH_NAMES[date.getMonth()]}
                  </span>
                </div>

                {/* Time slots */}
                <div className="flex-1 relative bg-white">
                  {/* Hour lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t border-gray-100"
                      style={{
                        top: `${((hour - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                      }}
                    />
                  ))}

                  {/* Half-hour lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={`half-${hour}`}
                      className="absolute w-full border-t border-gray-50"
                      style={{
                        top: `${((hour - START_HOUR + 0.5) / (END_HOUR - START_HOUR)) * 100}%`,
                      }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {isToday && (() => {
                    const now = new Date()
                    const mins = now.getHours() * 60 + now.getMinutes()
                    const startMins = START_HOUR * 60
                    const endMins = END_HOUR * 60
                    if (mins >= startMins && mins <= endMins) {
                      const pct = ((mins - startMins) / (endMins - startMins)) * 100
                      return (
                        <div
                          className="absolute w-full z-10 pointer-events-none"
                          style={{ top: `${pct}%` }}
                        >
                          <div className="relative flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
                            <div className="flex-1 h-px bg-red-500" />
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}

                  {/* Appointments */}
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  ) : (
                    dayAfspraken.map((afspraak) => {
                      const typeConfig = getTypeConfig(afspraak.type)
                      const statusDot = getStatusDotColor(afspraak.status)
                      return (
                        <button
                          key={afspraak.id}
                          onClick={() => openEditAfspraak(afspraak)}
                          className={`absolute left-1 right-1 rounded-md border px-1.5 py-0.5 text-left overflow-hidden cursor-pointer transition-opacity hover:opacity-80 z-[1] ${typeConfig.lightColor}`}
                          style={getAfspraakStyle(afspraak)}
                          title={`${formatTime(afspraak.starttijd)} - ${formatTime(afspraak.eindtijd)} | ${getClientNaam(afspraak)} | ${typeConfig.label}`}
                        >
                          <div className="flex items-center gap-1">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`} />
                            <span className="text-[10px] font-medium truncate">
                              {formatTime(afspraak.starttijd)}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold truncate leading-tight">
                            {getClientNaam(afspraak)}
                          </div>
                          <div className="text-[10px] opacity-75 truncate">
                            {typeConfig.label}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 py-2 bg-white border-t border-gray-200 text-xs text-gray-500 flex-wrap">
        <span className="font-medium text-gray-600 mr-1">Types:</span>
        {AFSPRAAK_TYPES.map((t) => (
          <span key={t.value} className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-sm ${t.color}`} />
            {t.label}
          </span>
        ))}
        <span className="mx-2 text-gray-300">|</span>
        <span className="font-medium text-gray-600 mr-1">Status:</span>
        {STATUS_OPTIONS.map((s) => (
          <span key={s.value} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl mx-4">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingAfspraak ? 'Afspraak bewerken' : 'Nieuwe afspraak'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => updateForm('client_id', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Selecteer client --</option>
                  {clienten.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.achternaam}, {c.voornaam}
                    </option>
                  ))}
                </select>
              </div>

              {/* Datum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                <input
                  type="date"
                  value={formData.datum}
                  onChange={(e) => updateForm('datum', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Starttijd / Eindtijd */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Starttijd
                  </label>
                  <input
                    type="time"
                    value={formData.starttijd}
                    onChange={(e) => updateForm('starttijd', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Eindtijd
                  </label>
                  <input
                    type="time"
                    value={formData.eindtijd}
                    onChange={(e) => updateForm('eindtijd', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Type / Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateForm('type', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {AFSPRAAK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateForm('status', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Locatie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Locatie
                </label>
                <input
                  type="text"
                  value={formData.locatie}
                  onChange={(e) => updateForm('locatie', e.target.value)}
                  placeholder="Bijv. Praktijkruimte 1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Notities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
                <textarea
                  value={formData.notities}
                  onChange={(e) => updateForm('notities', e.target.value)}
                  rows={3}
                  placeholder="Eventuele opmerkingen..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div>
                {editingAfspraak && (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Verwijderen
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.client_id || !formData.datum}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
