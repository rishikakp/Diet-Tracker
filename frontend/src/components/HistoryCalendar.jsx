import { useState, useEffect } from "react"
import { getHistory, getDayIntake } from "../services/api"

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function calculateGoals(weightKg) {
  if (!weightKg) return null
  return {
    calories: Math.round(weightKg * 35),
    protein: Math.round(weightKg * 1.0),
    carbs: Math.round(weightKg * 4.5),
    fat: Math.round(weightKg * 1.0),
  }
}

function getCompletionPct(calories, goals) {
  if (!goals || !calories) return 0
  return Math.min(calories / goals.calories, 1)
}

function getCircleStyle(pct) {
  if (pct === 0) return null
  if (pct >= 0.85) return { background: 'rgba(16,185,129,0.2)', border: '2px solid #10b981', color: '#059669' }
  if (pct >= 0.6)  return { background: 'rgba(234,179,8,0.18)', border: '2px solid #eab308', color: '#b45309' }
  if (pct >= 0.3)  return { background: 'rgba(249,115,22,0.15)', border: '2px solid #f97316', color: '#c2410c' }
  return { background: 'rgba(239,68,68,0.15)', border: '2px solid #ef4444', color: '#dc2626' }
}

function HistoryCalendar({ weightKg }) {
  const [history, setHistory] = useState([])
  const [apiWeightKg, setApiWeightKg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayDetail, setDayDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    getHistory().then((d) => {
      setHistory(d.days || [])
      if (d.weight_kg) setApiWeightKg(d.weight_kg)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const effectiveWeightKg = weightKg || apiWeightKg
  const goals = calculateGoals(effectiveWeightKg)

  const historyMap = {}
  history.forEach((d) => { historyMap[d.date] = d })

  const today = new Date()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
    setSelectedDay(null); setDayDetail(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
    setSelectedDay(null); setDayDetail(null)
  }

  const handleDayClick = async (day) => {
    if (!day) return
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDay(day)
    setDetailLoading(true)
    try {
      const d = await getDayIntake(dateStr)
      setDayDetail(d)
    } catch { setDayDetail(null) }
    setDetailLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{MONTHS[currentMonth]}</p>
          <p className="text-sm text-gray-400">{currentYear}</p>
        </div>
        <button onClick={nextMonth} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
          const isSelected = selectedDay === day
          const data = historyMap[dateStr]
          const pct = data ? getCompletionPct(data.calories, goals) : 0
          const circleStyle = getCircleStyle(pct)

          let style = { color: '#94a3b8', background: 'transparent', border: '2px solid transparent' }
          if (isSelected) {
            style = { background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transform: 'scale(1.15)' }
          } else if (isToday) {
            style = { background: '#eef2ff', color: '#6366f1', fontWeight: 700, border: '2px solid #c7d2fe' }
          } else if (circleStyle) {
            style = circleStyle
          }

          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className="relative aspect-square rounded-full flex items-center justify-center text-sm transition-all duration-200 font-medium"
              style={style}
            >
              {day}
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <div className="mt-4 pt-4 animate-fade-in" style={{ borderTop: '1px solid #e2e8f0' }}>
          {detailLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : dayDetail && dayDetail.history.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold text-gray-800">
                  {MONTHS_SHORT[currentMonth]} {selectedDay}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-base font-bold text-indigo-500">{Math.round(dayDetail.totals.calories)}</span>
                  <span className="text-sm text-gray-400">kcal</span>
                </div>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {dayDetail.history.map((item, j) => (
                  <div key={j} className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <span className="text-sm font-medium text-gray-600 capitalize">{item.food?.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-gray-400 font-medium">{Math.round(item.calories)} kcal</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-3">No intake logged this day</p>
          )}
        </div>
      )}

      {!goals && (
        <p className="text-sm text-gray-400 text-center mt-3">Set your weight to see color-coded calendar</p>
      )}
    </div>
  )
}

export default HistoryCalendar
