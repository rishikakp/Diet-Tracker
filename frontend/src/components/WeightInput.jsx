import { useState } from "react"

function WeightInput({ onWeightSet }) {
  const [weight, setWeight] = useState(() => localStorage.getItem("bodyWeight") || "")
  const [unit, setUnit] = useState(() => localStorage.getItem("weightUnit") || "kg")

  const handleSubmit = (e) => {
    e.preventDefault()
    const val = parseFloat(weight); if (val <= 0) return
    localStorage.setItem("bodyWeight", weight); localStorage.setItem("weightUnit", unit)
    onWeightSet(unit === "lbs" ? val * 0.453592 : val)
  }

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return
    const val = parseFloat(weight)
    if (isNaN(val) || val <= 0) { setUnit(newUnit); return }
    setWeight(String(newUnit === "lbs" ? Math.round(val * 2.20462) : Math.round(val * 0.453592)))
    setUnit(newUnit)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </div>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
          placeholder={`Weight (${unit})`} min="1" max="500"
          className="w-full rounded-xl px-3 py-3 pl-10 text-base transition-all"
          style={{ background: 'rgba(20,30,55,0.8)', border: '1px solid rgba(80,120,200,0.15)', color: '#e2e8f0' }} />
      </div>
      <select value={unit} onChange={(e) => handleUnitChange(e.target.value)}
        className="rounded-xl px-3 py-3 text-base transition-all cursor-pointer"
        style={{ background: 'rgba(20,30,55,0.8)', border: '1px solid rgba(80,120,200,0.15)', color: '#94a3b8' }}>
        <option value="kg">kg</option>
        <option value="lbs">lbs</option>
      </select>
      <button type="submit"
        className="px-6 py-3 rounded-xl font-semibold text-white transition-all btn-press text-base"
        style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', boxShadow: '0 4px 16px rgba(6,182,212,0.3)' }}>
        Set
      </button>
    </form>
  )
}

export default WeightInput
