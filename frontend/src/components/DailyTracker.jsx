const NUTRIENTS = [
  { label: "Calories", key: "calories", unit: " kcal", color: '#10b981' },
  { label: "Protein", key: "protein", unit: "g", color: '#3b82f6' },
  { label: "Carbs", key: "carbs", unit: "g", color: '#f59e0b' },
  { label: "Fat", key: "fat", unit: "g", color: '#f97316' },
]

function ProgressBar({ label, consumed, goal, unit, color }) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0
  const remaining = Math.max(goal - consumed, 0)
  const over = consumed > goal
  const barPct = over ? 100 : pct

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-slate-600">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold" style={{ color: over ? '#ef4444' : '#2d3748' }}>
            {Math.round(consumed)}
          </span>
          <span className="text-base text-slate-400">/ {goal}{unit}</span>
        </div>
      </div>
      <div className="relative w-full rounded-full h-4 overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${barPct}%`,
            background: over
              ? 'linear-gradient(to right, #ef4444, #f87171)'
              : `linear-gradient(to right, ${color}, ${color}bb)`,
          }}
        />
        {pct > 0 && pct < 100 && (
          <div className="absolute inset-y-0 left-0 rounded-full overflow-hidden" style={{ width: `${barPct}%` }}>
            <div className="absolute inset-0 shimmer" />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1.5">
        <p className="text-sm" style={{ color: over ? '#ef4444' : '#94a3b8' }}>
          {over ? `${Math.round(consumed - goal)}${unit} over` : `${Math.round(remaining)}${unit} left`}
        </p>
        <p className="text-sm text-slate-400">{Math.round(pct)}%</p>
      </div>
    </div>
  )
}

function DailyTracker({ goals, consumed }) {
  if (!goals) return null
  return (
    <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', boxShadow: '0 4px 12px rgba(6,182,212,0.2)' }}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700">Daily Progress</h2>
          <p className="text-base text-slate-400">Track your nutritional intake</p>
        </div>
      </div>
      {NUTRIENTS.map((n) => (
        <ProgressBar key={n.key} label={n.label} consumed={consumed[n.key]} goal={goals[n.key]} unit={n.unit} color={n.color} />
      ))}
    </div>
  )
}

export default DailyTracker
