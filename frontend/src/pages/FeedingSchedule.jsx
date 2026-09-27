import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Clock3,
  X,
  CalendarClock,
  Timer,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sensorService } from '../services/sensorService.js'

const emptyForm = {
  time: '06:30',
  duration: 10,
  frequency: 'Daily',
  enabled: true,
}

function formatTime(time) {
  if (!time) return '--'

  const [hours, minutes] = time.split(':').map(Number)

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getNextSchedule(schedules) {
  const enabledSchedules = schedules.filter((schedule) => schedule.enabled)

  if (!enabledSchedules.length) return null

  const now = new Date()

  const upcoming = enabledSchedules
    .map((schedule) => {
      const [hours, minutes] = schedule.time.split(':').map(Number)

      const next = new Date(now)
      next.setHours(hours, minutes, 0, 0)

      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }

      return {
        ...schedule,
        nextDate: next,
      }
    })
    .sort((a, b) => a.nextDate - b.nextDate)

  return upcoming[0]
}

export default function FeedingSchedule() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    setLoading(true)

    try {
      const data = await sensorService.getSchedules()
      setSchedules(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(err.message || 'Unable to load feeding schedules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const nextSchedule = useMemo(
    () => getNextSchedule(schedules),
    [schedules]
  )

  const activeSchedules = schedules.filter(
    (schedule) => schedule.enabled
  ).length

  const openAdd = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      time: '06:30',
      duration: 10,
      frequency: 'Daily',
      enabled: true,
    })
    setShowModal(true)
  }

  const openEdit = (schedule) => {
    setEditingId(schedule.id)

    setForm({
      time: schedule.time || '06:30',
      duration: Number(schedule.duration) || 10,
      frequency: schedule.frequency || 'Daily',
      enabled: schedule.enabled !== false,
    })

    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) return

    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!form.time) {
      toast.error('Please select a feeding time')
      return
    }

    if (!form.duration || form.duration < 1) {
      toast.error('Feeding duration must be at least 1 second')
      return
    }

    if (form.duration > 300) {
      toast.error('Feeding duration cannot exceed 300 seconds')
      return
    }

    setSaving(true)

    try {
      const payload = {
        time: form.time,
        duration: Number(form.duration),
        frequency: form.frequency,
        enabled: form.enabled,
      }

      if (editingId) {
        await sensorService.updateSchedule(editingId, payload)
        toast.success('Feeding schedule updated')
      } else {
        await sensorService.addSchedule(payload)
        toast.success('Feeding schedule added')
      }

      closeModal()
      await load()
    } catch (err) {
      toast.error(err.message || 'Unable to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this feeding schedule?'
    )

    if (!confirmed) return

    setDeletingId(id)

    try {
      await sensorService.deleteSchedule(id)
      toast.success('Feeding schedule deleted')
      await load()
    } catch (err) {
      toast.error(err.message || 'Unable to delete schedule')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleEnabled = async (schedule) => {
    try {
      await sensorService.updateSchedule(schedule.id, {
        enabled: !schedule.enabled,
      })

      toast.success(
        schedule.enabled
          ? 'Schedule disabled'
          : 'Schedule enabled'
      )

      await load()
    } catch (err) {
      toast.error(err.message || 'Unable to update schedule')
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy-900">
            Feeding Schedule
          </h2>

          <p className="mt-1 text-sm text-navy-800/55">
            Configure when the automatic feeder should dispense feed.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <Plus size={17} />
          Add Schedule
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Next Feeding */}
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-navy-800/55">
                Next Scheduled Feeding
              </p>

              {nextSchedule ? (
                <>
                  <p className="mt-2 text-2xl font-bold text-navy-900">
                    {formatTime(nextSchedule.time)}
                  </p>

                  <p className="mt-1 text-xs text-navy-800/50">
                    {nextSchedule.duration} seconds ·{' '}
                    {nextSchedule.frequency}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-lg font-semibold text-navy-800/50">
                  No active schedule
                </p>
              )}
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <CalendarClock size={21} />
            </div>
          </div>
        </div>

        {/* Active schedules */}
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-navy-800/55">
                Active Schedules
              </p>

              <p className="mt-2 text-2xl font-bold text-navy-900">
                {activeSchedules}
              </p>

              <p className="mt-1 text-xs text-navy-800/50">
                {schedules.length} total schedule
                {schedules.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <CheckCircle2 size={21} />
            </div>
          </div>
        </div>

        {/* Feeder information */}
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-navy-800/55">
                Feeder Mode
              </p>

              <p className="mt-2 text-lg font-bold text-navy-900">
                Automatic
              </p>

              <p className="mt-1 text-xs text-navy-800/50">
                Schedule execution is handled by the IoT device.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Timer size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Important information */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0 text-sky-600"
        />

        <div>
          <p className="text-sm font-semibold text-navy-900">
            How automatic feeding works
          </p>

          <p className="mt-1 text-xs leading-5 text-navy-800/65">
            Schedules saved here are sent to the backend and made available
            to the IoT device. The ESP32 uses its RTC clock to determine
            when a scheduled feeding should occur and activates the feeder
            relay for the configured duration.
          </p>
        </div>
      </div>

      {/* Schedule table */}
      <div className="card overflow-hidden">

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-sky-50 animate-pulse"
              />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
              <Clock3
                className="text-sky-600"
                size={27}
              />
            </div>

            <p className="font-semibold text-navy-900">
              No feeding schedules yet
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm text-navy-800/50">
              Add a schedule to configure when the automatic feeder
              should dispense feed.
            </p>

            <button
              onClick={openAdd}
              className="btn-primary mt-5 inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add First Schedule
            </button>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[720px] text-sm">

              <thead>
                <tr className="border-b border-sky-100 text-left text-navy-800/50">
                  <th className="px-6 py-4 font-medium">
                    Feeding Time
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Duration
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Frequency
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {schedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-b border-sky-50 last:border-0 hover:bg-sky-50/30 transition-colors"
                  >

                    {/* Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                          <Clock3 size={17} />
                        </div>

                        <div>
                          <p className="font-semibold text-navy-900">
                            {formatTime(schedule.time)}
                          </p>

                          <p className="text-xs text-navy-800/40">
                            Scheduled feeding
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-navy-800/75">
                        {schedule.duration} sec
                      </span>
                    </td>

                    {/* Frequency */}
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                        {schedule.frequency}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <button
                        onClick={() => toggleEnabled(schedule)}
                        aria-label={
                          schedule.enabled
                            ? 'Disable schedule'
                            : 'Enable schedule'
                        }
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          schedule.enabled
                            ? 'bg-sky-600'
                            : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            schedule.enabled
                              ? 'translate-x-5'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>

                      <span
                        className={`ml-2 text-xs font-medium ${
                          schedule.enabled
                            ? 'text-emerald-600'
                            : 'text-navy-800/40'
                        }`}
                      >
                        {schedule.enabled ? 'Active' : 'Disabled'}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">

                        <button
                          onClick={() => openEdit(schedule)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-sky-600 transition hover:bg-sky-50"
                          title="Edit schedule"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(schedule.id)}
                          disabled={deletingId === schedule.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                          title="Delete schedule"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 p-4">

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            {/* Close */}
            <button
              onClick={closeModal}
              disabled={saving}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-navy-800/40 transition hover:bg-sky-50 hover:text-navy-800 disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6 pr-8">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarClock size={21} />
              </div>

              <h3 className="text-lg font-semibold text-navy-900">
                {editingId
                  ? 'Edit Feeding Schedule'
                  : 'Add Feeding Schedule'}
              </h3>

              <p className="mt-1 text-sm text-navy-800/50">
                Configure the time and duration for automatic feeding.
              </p>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-5"
            >

              {/* Time */}
              <div>
                <label className="label-text">
                  Feeding Time
                </label>

                <input
                  type="time"
                  required
                  className="input-field"
                  value={form.time}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      time: e.target.value,
                    })
                  }
                />

                <p className="mt-1.5 text-xs text-navy-800/45">
                  The ESP32 RTC will use this time for automatic feeding.
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="label-text">
                  Feeding Duration
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    required
                    className="input-field pr-16"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duration: Number(e.target.value),
                      })
                    }
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-navy-800/40">
                    seconds
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-navy-800/45">
                  The feeder relay will remain active for this duration.
                </p>
              </div>

              {/* Frequency */}
              <div>
                <label className="label-text">
                  Frequency
                </label>

                <div className="relative">
                  <select
                    className="input-field appearance-none pr-10"
                    value={form.frequency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <option value="Daily">
                      Daily
                    </option>

                    <option value="Weekdays">
                      Weekdays
                    </option>

                    <option value="Weekends">
                      Weekends
                    </option>

                    <option value="Once">
                      Once
                    </option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-800/40"
                  />
                </div>
              </div>

              {/* Enable */}
              <div className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/50 p-4">

                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    Enable Schedule
                  </p>

                  <p className="mt-0.5 text-xs text-navy-800/50">
                    Allow the IoT device to execute this schedule.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      enabled: !form.enabled,
                    })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    form.enabled
                      ? 'bg-sky-600'
                      : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.enabled
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="w-full rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-medium text-navy-800 transition hover:bg-sky-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Add Schedule'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}