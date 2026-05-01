'use client'
import { useEffect, useState } from 'react'
import { Meal } from '@/types'

const MEAL_LABELS: Record<string, string> = {
  cafe: '☕ Café',
  almoco: '🍽️ Almoço',
  jantar: '🌙 Jantar',
  lanche: '🍎 Lanche',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function HistoricoPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/meals?date=${date}`)
      const data = await res.json()
      setMeals(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [date])

  const total = {
    kcal: meals.reduce((s, m) => s + m.total_kcal, 0),
    protein: meals.reduce((s, m) => s + m.total_protein_g, 0),
    carb: meals.reduce((s, m) => s + m.total_carb_g, 0),
    fat: meals.reduce((s, m) => s + m.total_fat_g, 0),
  }

  function prevDay() {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d.toISOString().split('T')[0])
  }

  function nextDay() {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    const today = new Date().toISOString().split('T')[0]
    if (d.toISOString().split('T')[0] <= today) setDate(d.toISOString().split('T')[0])
  }

  const isToday = date === new Date().toISOString().split('T')[0]

  return (
    <div className="page">
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Histórico</h1>

      {/* Date nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevDay} className="btn btn-ghost" style={{ padding: '8px 14px' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontWeight: 600, fontSize: 15, textAlign: 'center' }}
          />
          {isToday && <p style={{ fontSize: 11, color: 'var(--accent)' }}>Hoje</p>}
        </div>
        <button onClick={nextDay} className="btn btn-ghost" style={{ padding: '8px 14px' }} disabled={isToday}>→</button>
      </div>

      {/* Daily totals */}
      {meals.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div><p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{Math.round(total.kcal)}</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>kcal</p></div>
            <div><p style={{ fontSize: 18, fontWeight: 600, color: 'var(--protein)' }}>{Math.round(total.protein)}g</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>proteína</p></div>
            <div><p style={{ fontSize: 18, fontWeight: 600, color: 'var(--carb)' }}>{Math.round(total.carb)}g</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>carbo</p></div>
            <div><p style={{ fontSize: 18, fontWeight: 600, color: 'var(--fat)' }}>{Math.round(total.fat)}g</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>gordura</p></div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Carregando...</p>
      ) : meals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 32 }}>🍽️</p>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Nenhuma refeição neste dia</p>
        </div>
      ) : (
        meals.map(meal => (
          <div key={meal.id} className="card fade-up" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="meal-chip">{MEAL_LABELS[meal.meal_type]}</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>{Math.round(meal.total_kcal)} kcal</span>
            </div>
            {meal.meal_items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.food_name} ({item.quantity_g}g)</span>
                <span>{Math.round(item.kcal)} kcal</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
