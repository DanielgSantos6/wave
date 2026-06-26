import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Waves, TrendingUp, AlertTriangle, Wind,
  Activity, MapPin, RefreshCw,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import BrazilHeatMap from '../components/BrazilHeatMap'
import { ranking, temporal, daily_stats } from '../data/mockData'

const ALERT_THRESHOLD = 2.5

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl">
      <div className="font-semibold mb-1 text-slate-100">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          {p.name.includes('height') || p.name.includes('Ondas') ? ' m' : ''}
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [alertThreshold, setAlertThreshold] = useState(ALERT_THRESHOLD)
  const [selectedBeach, setSelectedBeach] = useState(null)
  const [lastUpdate] = useState(new Date().toLocaleString('pt-BR'))

  // KPIs globais
  const kpis = useMemo(() => {
    const avgWave = ranking.reduce((s, b) => s + b.avg_wave_height, 0) / ranking.length
    const maxWave = Math.max(...ranking.map((b) => b.max_wave_height))
    const alertBeaches = ranking.filter((b) => b.avg_wave_height >= alertThreshold).length
    const avgCurrent = ranking.reduce((s, b) => s + (b.avg_current || 0), 0) / ranking.length
    return { avgWave, maxWave, alertBeaches, avgCurrent }
  }, [alertThreshold])

  // Temporal chart — last 24 h
  const temporalChart = useMemo(() => {
    const slice = temporal.slice(-24)
    return slice.map((t) => ({
      time: new Date(t.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      'Média (m)': t.avg_wave_height,
      'Máx (m)': t.max_wave_height,
    }))
  }, [])

  // Ranking top 10
  const top10 = useMemo(() => ranking.slice(0, 10), [])

  // Beach filter for daily stats
  const beachNames = useMemo(() => [...new Set(daily_stats.map((d) => d.beach_name))].sort(), [])
  const selectedBeachData = useMemo(() => {
    const beach = selectedBeach || beachNames[0]
    return daily_stats
      .filter((d) => d.beach_name === beach)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        date: d.date.slice(5),
        'Média (m)': d.avg_wave_height,
        'Máx (m)': d.max_wave_height,
        'Mín (m)': d.min_wave_height,
      }))
  }, [selectedBeach, beachNames])

  const alerts = useMemo(
    () => ranking.filter((b) => b.avg_wave_height >= alertThreshold),
    [alertThreshold]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Waves className="text-cyan-400" size={20} />
            Dashboard — Ondas e Marés no Brasil
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dados simulados gerados pelo pipeline Python/PySpark · Atualizado: {lastUpdate}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw size={13} />
          <span>Fonte: Open-Meteo Marine API</span>
        </div>
      </div>

      {/* Aviso */}
      <div className="bg-slate-800/60 border border-amber-600/30 rounded-lg px-4 py-2 flex gap-2 items-start text-xs text-amber-300">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>Projeto de estudo. Dados com fins exclusivamente educacionais. Não use para navegação ou segurança marítima.</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Waves} label="Altura Média" value={kpis.avgWave.toFixed(2)} unit="m" color="cyan" sub="Todas as praias · 24 h" />
        <StatCard icon={TrendingUp} label="Máxima do Dia" value={kpis.maxWave.toFixed(2)} unit="m" color="amber" sub="Pico registrado" />
        <StatCard icon={AlertTriangle} label="Alertas Ativos" value={kpis.alertBeaches} unit="praias" color="rose" sub={`Acima de ${alertThreshold} m`} />
        <StatCard icon={Activity} label="Corrente Média" value={kpis.avgCurrent.toFixed(2)} unit="m/s" color="violet" sub="Velocidade oceânica" />
      </div>

      {/* Threshold control */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-300 shrink-0">
          <AlertTriangle size={15} className="text-rose-400" />
          Limiar de Alerta:
          <span className="font-bold text-rose-400">{alertThreshold.toFixed(1)} m</span>
        </div>
        <input
          type="range" min="0.5" max="5" step="0.1"
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(parseFloat(e.target.value))}
          className="flex-1 accent-rose-500"
        />
        {alerts.length > 0 && (
          <div className="text-xs text-rose-300 flex gap-1 flex-wrap">
            {alerts.map((b) => (
              <span key={b.beach_name} className="bg-rose-900/50 border border-rose-700 rounded px-2 py-0.5">
                ⚠ {b.beach_name} ({b.avg_wave_height} m)
              </span>
            ))}
          </div>
        )}
        {alerts.length === 0 && (
          <span className="text-xs text-emerald-400">Nenhum alerta no momento.</span>
        )}
      </div>

      {/* Temporal chart + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1">
            <Activity size={14} className="text-cyan-400" />
            Evolução Temporal — Últimas 24 h (média Brasil)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={temporalChart} margin={{ top: 4, right: 12, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" m" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Média (m)" stroke="#22d3ee" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Máx (m)" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <BrazilHeatMap data={ranking} />
      </div>

      {/* Ranking */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1">
          <TrendingUp size={14} className="text-amber-400" />
          Ranking — Top 10 Praias com Maiores Ondas (24 h)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 90 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" m" />
            <YAxis dataKey="beach_name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avg_wave_height" name="Média (m)" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            <Bar dataKey="max_wave_height" name="Máx (m)" fill="#f97316" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Beach detail */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1 shrink-0">
            <MapPin size={14} className="text-cyan-400" />
            Evolução por Praia — Últimos 7 dias
          </h3>
          <select
            value={selectedBeach || beachNames[0]}
            onChange={(e) => setSelectedBeach(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {beachNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={selectedBeachData} margin={{ top: 4, right: 16, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" m" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Média (m)" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Máx (m)" stroke="#f97316" strokeWidth={1.5} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Mín (m)" stroke="#6366f1" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="3 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Full ranking table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Tabela Completa — Todas as Praias</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                {['#', 'Praia', 'UF', 'Média (m)', 'Máx (m)', 'Swell (m)', 'Período (s)', 'Corrente (m/s)', 'Alertas'].map((h) => (
                  <th key={h} className="pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranking.map((b, i) => (
                <tr
                  key={b.beach_name}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                    b.avg_wave_height >= alertThreshold ? 'text-rose-300' : 'text-slate-300'
                  }`}
                >
                  <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium whitespace-nowrap">{b.beach_name}</td>
                  <td className="py-2 pr-4 text-slate-400">{b.state}</td>
                  <td className="py-2 pr-4">{b.avg_wave_height}</td>
                  <td className="py-2 pr-4">{b.max_wave_height}</td>
                  <td className="py-2 pr-4">{b.avg_swell ?? '—'}</td>
                  <td className="py-2 pr-4">{b.avg_period ?? '—'}</td>
                  <td className="py-2 pr-4">{b.avg_current ?? '—'}</td>
                  <td className="py-2 pr-4">
                    {(b.alert_hours || 0) > 0
                      ? <span className="text-rose-400">⚠ {b.alert_hours} h</span>
                      : <span className="text-emerald-400">—</span>
                    }
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
