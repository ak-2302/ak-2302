import { useEffect, useState } from 'react'

type SystemStats = {
  cpuPercent: number
  cpuModel: string
  cpuCores: number
  platform: string
  architecture: string
  nodeVersion: string
  loadAverage: number[]
  memoryPercent: number
  memoryUsedBytes: number
  memoryTotalBytes: number
  uptimeSeconds: number
  diskPercent: number
  diskUsedBytes: number
  diskTotalBytes: number
  updatedAt: string
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return `${days}日 ${hours}時間`
}

export default function ServerPanel() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/system-stats', { cache: 'no-store' })
        if (!response.ok) throw new Error('metrics unavailable')
        const next = await response.json() as SystemStats
        if (!cancelled) { setStats(next); setError(false) }
      } catch { if (!cancelled) setError(true) }
    }
    void load()
    const timer = window.setInterval(load, 5000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [])

  return (
    <div className="home-panel home-panel-server">
      <div className="home-server-metrics" aria-live="polite">
        <div className="home-server-metrics-heading"><span>Live server status</span><span className={stats ? 'status-live' : 'status-offline'}>{stats ? 'LIVE' : error ? 'OFFLINE' : 'LOADING'}</span></div>
        {stats ? <div className="home-server-metrics-grid">
          <div><span>CPU %</span><strong>{stats.cpuPercent}%</strong><meter min="0" max="100" value={stats.cpuPercent} /></div>
          <div><span>Uptime</span><strong>{formatUptime(stats.uptimeSeconds)}</strong></div>
          <div><span>Memory %</span><strong>{stats.memoryPercent}%</strong><meter min="0" max="100" value={stats.memoryPercent} /></div>
          <div><span>Memory used</span><strong>{formatBytes(stats.memoryUsedBytes)} / {formatBytes(stats.memoryTotalBytes)}</strong></div>
          <div><span>Storage %</span><strong>{stats.diskPercent}%</strong><meter min="0" max="100" value={stats.diskPercent} /></div>
          <div><span>Storage used</span><strong>{formatBytes(stats.diskUsedBytes)} / {formatBytes(stats.diskTotalBytes)}</strong></div>
        </div> : <p className="home-server-metrics-empty">サーバー情報を取得しています。</p>}
        {stats && <dl className="home-server-specs">
          <div><dt>CPU</dt><dd>{stats.cpuModel} · {stats.cpuCores} cores</dd></div>
          <div><dt>System</dt><dd>{stats.platform} · {stats.architecture}</dd></div>
          <div><dt>Runtime</dt><dd>Node.js {stats.nodeVersion}</dd></div>
        </dl>}
      </div>
    </div>
  )
}
