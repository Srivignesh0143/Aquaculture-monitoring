import { useEffect, useState } from 'react'
import {
  Database,
  HardDrive,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock3,
  Wifi,
  WifiOff,
  FileDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sensorService } from '../services/sensorService.js'

const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}) : 'Not reported')

const bytesToLabel = (bytes) => {
  if (!bytes) return 'Not reported'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`
}

export default function DataSync() {
  const [syncing, setSyncing] = useState(false)
  const [syncData, setSyncData] = useState(null)
  const [error, setError] = useState('')

  const loadSyncStatus = async () => {
    try {
      setError('')
      const status = await sensorService.getSyncStatus()
      setSyncData({
        ...status,
        sdConnected: status.sdConnected ?? false,
        wifiConnected: status.status === 'online' && status.wifi !== 'Disconnected',
        freeSpace: bytesToLabel(status.freeSpaceBytes),
        totalSpace: bytesToLabel(status.totalSpaceBytes),
        pendingRecords: status.pendingRecords ?? 0,
        syncedRecords: status.syncedRecords ?? 0,
        lastSync: formatDate(status.lastSyncAt),
        lastWrite: formatDate(status.lastWriteAt),
      })
      return status
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadSyncStatus()
  }, [])

  const handleSync = async () => {
    if (!syncData) return
    if (!syncData.wifiConnected) {
      toast.error('The device is offline. It will sync automatically when it reconnects.')
      return
    }

    setSyncing(true)
    const refreshedStatus = await loadSyncStatus()
    setSyncing(false)
    if (refreshedStatus?.pendingRecords > 0) {
      toast.success('Sync status refreshed. The device uploads pending records automatically.')
    } else {
      toast.success('All available device data is synchronized.')
    }
  }

  const handleDownload = () => {
    toast.success('Preparing sensor data CSV...')
    
    // Demo CSV
    const csv = `Timestamp,Temperature,pH,Water Level (cm),Turbidity
27-09-2026 18:30,28.4,7.35,6.8,3.2
27-09-2026 18:31,28.5,7.36,6.7,3.3
27-09-2026 18:32,28.5,7.34,6.7,3.4
27-09-2026 18:33,28.6,7.33,6.6,3.5`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'aquaculture-sensor-data.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  if (!syncData) {
    return <div className="card p-6 text-sm text-navy-800/60">{error || 'Loading synchronization status...'}</div>
  }

  const storagePercentage = syncData.totalSpaceBytes
    ? (syncData.freeSpaceBytes / syncData.totalSpaceBytes) * 100
    : 0
  const syncHistory = syncData.lastSyncAt
    ? [{ time: syncData.lastSync, records: syncData.syncedRecords, duration: 'Reported by device', status: 'Success' }]
    : []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-semibold text-navy-900 text-lg">
          Data Sync
        </h2>

        <p className="text-sm text-navy-800/50 mt-1">
        Monitor device-side offline data and cloud synchronization.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* SD Card */}
        <div className="card p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-navy-800/50">
                SD Card
              </p>

              <p className="font-semibold text-navy-900 mt-1">
                {syncData.sdConnected ? 'Connected' : 'Not reported'}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
              <HardDrive className="text-sky-600" size={22} />
            </div>

          </div>

          <div className="flex items-center gap-2 mt-4 text-sm">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                syncData.sdConnected
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />

            {syncData.freeSpace} free of {syncData.totalSpace}
          </div>
        </div>

        {/* Sync Status */}
        <div className="card p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-navy-800/50">
                Sync Status
              </p>

              <p className="font-semibold text-navy-900 mt-1">
                {syncData.pendingRecords === 0
                  ? 'All Data Synced'
                  : `${syncData.pendingRecords} Pending`}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2
                className="text-green-600"
                size={22}
              />
            </div>

          </div>

          <p className="text-sm text-navy-800/50 mt-4">
            Last sync: {syncData.lastSync}
          </p>
        </div>

        {/* Pending Records */}
        <div className="card p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-navy-800/50">
                Pending Records
              </p>

              <p className="text-2xl font-bold text-navy-900 mt-1">
                {syncData.pendingRecords}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Database
                className="text-amber-600"
                size={22}
              />
            </div>

          </div>

          <p className="text-sm text-navy-800/50 mt-3">
            {syncData.syncedRecords.toLocaleString()} records synced
          </p>
        </div>

      </div>

      {/* Main Sync Card */}
      <div className="card p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <h3 className="font-semibold text-navy-900">
              Synchronization
            </h3>

            <p className="text-sm text-navy-800/50 mt-1">
              The device uploads SD-card records automatically after reconnecting.
              This page only refreshes the reported synchronization status.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={16}
              className={syncing ? 'animate-spin' : ''}
            />

            {syncing ? 'Refreshing...' : 'Refresh Status'}
          </button>

        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          <div className="rounded-xl bg-sky-50 p-4 flex items-center gap-3">
            <Wifi
              size={20}
              className="text-sky-600"
            />

            <div>
              <p className="text-sm font-semibold text-navy-900">
                Wi-Fi Connection
              </p>

              <p className="text-xs text-navy-800/50">
                {syncData.wifiConnected
                  ? 'Device connected to network'
                  : 'Device is offline'}
              </p>
            </div>

            <span
              className={`ml-auto text-xs font-semibold ${
                syncData.wifiConnected
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {syncData.wifiConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div className="rounded-xl bg-sky-50 p-4 flex items-center gap-3">
            <HardDrive
              size={20}
              className="text-sky-600"
            />

            <div>
              <p className="text-sm font-semibold text-navy-900">
                SD Card
              </p>

              <p className="text-xs text-navy-800/50">
                Last write reported by device: {syncData.lastWrite}
              </p>
            </div>

            <span className="ml-auto text-xs font-semibold text-green-600">
              READY
            </span>
          </div>

        </div>

        {/* Storage */}
        <div className="mt-6">

          <div className="flex justify-between text-sm mb-2">
            <span className="text-navy-800/60">
              SD Card Storage
            </span>

            <span className="font-semibold text-navy-900">
              {syncData.freeSpace} free
            </span>
          </div>

          <div className="h-2 bg-sky-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full"
              style={{
                width: `${100 - storagePercentage}%`,
              }}
            />
          </div>

        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <button
          onClick={handleSync}
          className="card p-5 text-left hover:border-sky-200 transition-colors"
        >
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
              <RefreshCw
                size={19}
                className="text-sky-600"
              />
            </div>

            <div>
              <p className="font-semibold text-navy-900">
                Synchronize Data
              </p>

              <p className="text-xs text-navy-800/50 mt-1">
                Upload pending offline records
              </p>
            </div>

          </div>
        </button>

        <button
          onClick={handleDownload}
          className="card p-5 text-left hover:border-sky-200 transition-colors"
        >
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <FileDown
                size={19}
                className="text-green-600"
              />
            </div>
            <div>
              <p className="font-semibold text-navy-900">
                Download Sensor Data
              </p>

              <p className="text-xs text-navy-800/50 mt-1">
                Export sensor readings as CSV
              </p>
            </div>

          </div>
        </button>

      </div>

      {/* Sync History */}
      <div className="card overflow-hidden">

        <div className="p-5 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <Clock3 size={18} className="text-sky-600" />

            <h3 className="font-semibold text-navy-900">
              Synchronization History
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="text-left text-navy-800/50 border-b border-sky-100">

                <th className="px-5 py-3 font-medium">
                  Date & Time
                </th>

                <th className="px-5 py-3 font-medium">
                  Records
                </th>

                <th className="px-5 py-3 font-medium">
                  Duration
                </th>

                <th className="px-5 py-3 font-medium">
                  Status
                </th>

              </tr>
            </thead>

            <tbody>

              {syncHistory.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-sky-50 last:border-0"
                >

                  <td className="px-5 py-3.5 text-navy-900">
                    {item.time}
                  </td>

                  <td className="px-5 py-3.5 text-navy-800/70">
                    {item.records}
                  </td>

                  <td className="px-5 py-3.5 text-navy-800/70">
                    {item.duration}
                  </td>

                  <td className="px-5 py-3.5">

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <CheckCircle2 size={14} />
                      {item.status}
                    </span>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}