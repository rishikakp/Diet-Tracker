import { useState, useMemo, useEffect, useRef } from "react"
import FoodCapture from "./components/FoodCapture"
import NutritionCard from "./components/NutritionCard"
import WeightInput from "./components/WeightInput"
import DailyTracker from "./components/DailyTracker"
import AuthPage from "./components/AuthPage"
import Profile from "./components/Profile"
import {
  isLoggedIn, login, register, getProfile, updateProfile,
  analyzeFood, logIntake, getTodayIntake, clearTodayIntake, clearToken,
} from "./services/api"

function Logo() {
  return (
    <div className="w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer border-animated" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 16px rgba(99,102,241,0.2)' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #818cf8, #22d3ee)' }} />
      <svg className="w-6 h-6 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'logoPulse 2.5s ease-in-out infinite' }}>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    </div>
  )
}

function UserAvatar({ username, onClick }) {
  return (
    <button onClick={onClick} className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base transition-all duration-200 hover:scale-105" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
      {username?.charAt(0).toUpperCase() || "?"}
    </button>
  )
}

function Navbar({ user, onProfileClick }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="max-w-4xl mx-auto flex items-center justify-between px-5 sm:px-6 h-16">
        <div className="flex items-center gap-3.5">
          <Logo />
          <div>
            <h1 className="text-xl font-bold leading-tight"><span className="text-gray-700">DIET </span><span className="text-indigo-500">TRACKER</span></h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase font-medium">AI Nutrition</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && <UserAvatar username={user.username} onClick={onProfileClick} />}
        </div>
      </div>
    </nav>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

function calculateDailyGoals(weightKg) {
  return {
    calories: Math.round(weightKg * 35),
    protein: Math.round(weightKg * 1.0),
    carbs: Math.round(weightKg * 4.5),
    fat: Math.round(weightKg * 1.0),
  }
}

function App() {
  const [user, setUser] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    if (isLoggedIn()) {
      getProfile().then((u) => { setUser(u); loadTodayIntake(u) }).catch(() => clearToken())
    }
  }, [])

  const loadTodayIntake = async (u) => {
    try { const d = await getTodayIntake(); setResults(d.history || []) } catch {}
  }

  const weightKg = user?.weight_kg
  const goals = useMemo(() => (weightKg ? calculateDailyGoals(weightKg) : null), [weightKg])
  const consumed = useMemo(() => {
    const t = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    results.forEach((r) => {
      t.calories += r.calories || r.nutrition?.calories || 0
      t.protein += r.protein || r.nutrition?.protein || 0
      t.carbs += r.carbs || r.nutrition?.carbs || 0
      t.fat += r.fat || r.nutrition?.fat || 0
    })
    return t
  }, [results])

  const handleAuth = async (type, username, password, weight) => {
    const u = type === "login"
      ? await login(username, password)
      : await register(username, password, weight)
    setUser(u)
    if (u.weight_kg) { const d = await getTodayIntake(); setResults(d.history || []) }
  }

  const handleLogout = () => { clearToken(); setUser(null); setResults([]); setShowProfile(false) }

  const handleCapture = async (imageBlob) => {
    setLoading(true); setError(null)
    try {
      const data = await analyzeFood(imageBlob)
      const n = data.nutrition
      await logIntake({ food: data.food, calories: n.calories, protein: n.protein, carbs: n.carbs, fat: n.fat, confidence: data.confidence })
      setResults((prev) => [{ ...data, time: new Date().toISOString() }, ...prev])
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  const handleWeightSet = async (kg) => {
    try { await updateProfile(kg); setUser((p) => ({ ...p, weight_kg: kg })) } catch {}
  }

  const handleClear = async () => { try { await clearTodayIntake(); setResults([]) } catch {} }

  if (!user) return <AuthPage onAuth={handleAuth} />

  return (
    <div className="bg-main relative">
      <div className="food-symbols">
        {['🍴','🍽️','🥄','🥗','🍎','🥩','🥑','🍳','🥣','🍋'].map((s, i) => (
          <div key={i} className="food-symbol">{s}</div>
        ))}
      </div>
      <div className="particles">
        {[...Array(8)].map((_, i) => <div key={i} className="particle" />)}
      </div>

      <Navbar user={user} onProfileClick={() => setShowProfile(!showProfile)} />

      {showProfile && (
        <>
          <div className="profile-overlay" onClick={() => setShowProfile(false)} />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
            <div ref={profileRef} className="w-full max-w-lg pointer-events-auto animate-fade-in-down max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <Profile user={user} onUpdate={handleWeightSet} onLogout={handleLogout} onClose={() => setShowProfile(false)} />
            </div>
          </div>
        </>
      )}

      <main className="relative z-10 max-w-2xl mx-auto px-5 pt-24 pb-8">
        <div className="mb-8 animate-fade-in-down">
          <h2 className="text-3xl font-bold text-gray-800">{getGreeting()}, <span className="text-gradient">{user.username}</span></h2>
          <p className="text-lg text-gray-400 mt-1">Track your daily nutrition intake</p>
        </div>

        <div className="space-y-6">
          {!user.weight_kg && (
            <div className="card border-animated p-6 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">Set your body weight</p>
                  <p className="text-base text-gray-400">Required to calculate daily goals</p>
                </div>
              </div>
              <WeightInput onWeightSet={handleWeightSet} />
            </div>
          )}

          <FoodCapture onCapture={handleCapture} />

          {loading && (
            <div className="card border-animated p-10 flex flex-col items-center gap-4 animate-fade-in">
              <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-lg text-gray-400 font-medium">Analyzing your food...</p>
            </div>
          )}

          {error && (
            <div className="card p-5 animate-shake" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <p className="text-red-500 text-base text-center font-semibold">{error}</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4 animate-fade-in-up">
              <NutritionCard result={results[0]} />
              {results.length > 1 && (
                <button onClick={handleClear} className="w-full py-3.5 rounded-2xl text-base font-semibold transition-all btn-press" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                  Clear today's intake
                </button>
              )}
            </div>
          )}

          {goals && <DailyTracker goals={goals} consumed={consumed} />}
        </div>
      </main>
    </div>
  )
}

export default App
