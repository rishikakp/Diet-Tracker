import { useState } from "react"
import HistoryCalendar from "./HistoryCalendar"

function Profile({ user, onUpdate, onLogout, onClose }) {
  const [tab, setTab] = useState("profile")
  const [editing, setEditing] = useState(false)
  const [weight, setWeight] = useState(user?.weight_kg ? String(Math.round(user.weight_kg)) : "")
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "?"

  const handleSave = async (e) => {
    e.preventDefault(); setMsg(""); setError("")
    try {
      await onUpdate(weight ? parseFloat(weight) : null, null)
      setMsg("Saved!")
      setEditing(false)
      setTimeout(() => setMsg(""), 2000)
    } catch (err) { setError(err.message) }
  }

  const goals = user?.weight_kg ? {
    calories: Math.round(user.weight_kg * 35),
    protein: Math.round(user.weight_kg * 1),
    carbs: Math.round(user.weight_kg * 4.5),
    fat: Math.round(user.weight_kg * 1),
  } : null

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '480px' }}>
      <div className="card overflow-hidden" style={{ borderRadius: '24px' }}>

        {/* Header */}
        <div className="relative p-6 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100" style={{ color: '#94a3b8' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
              {initial}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user?.username}</h3>
              <p className="text-sm text-gray-400 mt-0.5">{user?.weight_kg ? `${user.weight_kg} kg` : "No weight set"}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 mb-4">
          <div className="flex rounded-xl p-1" style={{ background: '#f1f5f9' }}>
            <button onClick={() => setTab("profile")} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all" style={tab === "profile" ? { background: '#fff', color: '#6366f1', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } : { color: '#94a3b8' }}>
              Profile
            </button>
            <button onClick={() => setTab("history")} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all" style={tab === "history" ? { background: '#fff', color: '#6366f1', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } : { color: '#94a3b8' }}>
              History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {tab === "profile" ? (
            <div className="space-y-4">
              {!editing ? (
                <>
                  {/* Daily Goals */}
                  {goals && (
                    <div className="rounded-2xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Daily Goals</p>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Cal', value: goals.calories, unit: 'kcal', color: '#6366f1' },
                          { label: 'Pro', value: goals.protein, unit: 'g', color: '#3b82f6' },
                          { label: 'Carb', value: goals.carbs, unit: 'g', color: '#f59e0b' },
                          { label: 'Fat', value: goals.fat, unit: 'g', color: '#f97316' },
                        ].map(g => (
                          <div key={g.label} className="text-center">
                            <p className="text-lg font-bold" style={{ color: g.color }}>{g.value}</p>
                            <p className="text-xs text-gray-400">{g.unit}</p>
                            <p className="text-xs text-gray-500 font-medium">{g.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setEditing(true)} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white btn-press" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 16px rgba(99,102,241,0.2)' }}>Update Weight</button>
                    <button onClick={onLogout} className="py-3.5 px-6 rounded-2xl text-sm font-semibold btn-press transition-all" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>Logout</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 mb-2 block">Body Weight (kg)</label>
                    <input type="number" placeholder="Enter your weight" value={weight} onChange={(e) => setWeight(e.target.value)} min="1" max="500" autoFocus
                      className="w-full rounded-2xl px-5 py-4 text-lg font-medium transition-all" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', color: '#1e293b' }} />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white btn-press" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 16px rgba(99,102,241,0.2)' }}>Save</button>
                    <button type="button" onClick={() => { setEditing(false); setError("") }} className="py-3.5 px-6 rounded-2xl text-sm font-semibold transition-all" style={{ background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
                  </div>
                  {msg && <p className="text-sm text-center font-semibold animate-bounce-in" style={{ color: '#10b981' }}>{msg}</p>}
                  {error && <p className="text-sm text-center font-semibold animate-shake" style={{ color: '#ef4444' }}>{error}</p>}
                </form>
              )}
            </div>
          ) : (
            <HistoryCalendar weightKg={user?.weight_kg} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
