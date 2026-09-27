import os from 'node:os'
import { statfsSync } from 'node:fs'

let previousCpu = null

function cpuSnapshot() {
  return os.cpus().reduce((total, cpu) => {
    const times = cpu.times
    return { idle: total.idle + times.idle, total: total.total + times.user + times.nice + times.sys + times.idle + times.irq }
  }, { idle: 0, total: 0 })
}

export function getSystemStats() {
  const current = cpuSnapshot()
  const previous = previousCpu
  previousCpu = current
  const idle = previous ? current.idle - previous.idle : 0
  const total = previous ? current.total - previous.total : 0
  const cpuPercent = total > 0 ? Math.round((1 - idle / total) * 100) : 0
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  const disk = statfsSync(process.cwd())
  const diskTotal = disk.blocks * disk.bsize
  const diskFree = disk.bavail * disk.bsize
  const load = os.loadavg()
  const cpuModel = os.cpus()[0]?.model?.replace(/\s+/g, ' ').trim() || 'Unknown CPU'

  return {
    cpuPercent,
    cpuModel,
    cpuCores: os.cpus().length,
    platform: `${os.type()} ${os.release()}`,
    architecture: os.arch(),
    nodeVersion: process.version,
    loadAverage: load.map((value) => Number(value.toFixed(2))),
    memoryPercent: Math.round(((totalMemory - freeMemory) / totalMemory) * 100),
    memoryUsedBytes: totalMemory - freeMemory,
    memoryTotalBytes: totalMemory,
    uptimeSeconds: Math.round(os.uptime()),
    diskPercent: diskTotal > 0 ? Math.round(((diskTotal - diskFree) / diskTotal) * 100) : 0,
    diskUsedBytes: diskTotal - diskFree,
    diskTotalBytes: diskTotal,
    updatedAt: new Date().toISOString(),
  }
}
