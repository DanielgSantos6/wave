export default function StatCard({ icon: Icon, label, value, unit, color = 'cyan', sub }) {
  const colors = {
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
  }
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
        {Icon && <Icon size={14} className={colors[color]} />}
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${colors[color]}`}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  )
}
