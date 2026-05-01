'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Meal, Profile } from '@/types'
import Link from 'next/link'

const MEAL_LABELS: Record<string, string> = {
  cafe: '☕ Café da Manhã',
  almoco: '🍽️ Almoço',
  jantar: '🌙 Jantar',
  lanche: '🍎 Lanche',
}

function MacroBar({ label, value, goal, color }: any) {
  const pct = Math.min((value / goal) * 100, 100)
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round(value)}g</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>meta {goal}g</div>
    </div>
  )
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [waterMl, setWaterMl] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    async function load() {
      const [profileRes, mealsRes, waterRes] = await Promise.all([
        fetch('/api/profile'),
        fetch(`/api/meals?date=${new Date().toISOString().split('T')[0]}`),
        fetch(`/api/water?date=${new Date().toISOString().split('T')[0]}`),
      ])
      const [p, m, w] = await Promise.all([profileRes.json(), mealsRes.json(), waterRes.json()])
      setProfile(p)
      setMeals(Array.isArray(m) ? m : [])
      setWaterMl(w.total_ml || 0)
      setLoading(false)
    }
    load()
  }, [])

  async function addWater(ml: number) {
    await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_ml: ml }),
    })
    setWaterMl(prev => prev + ml)
  }

  async function deleteMeal(id: string) {
    await fetch(`/api/meals/${id}`, { method: 'DELETE' })
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  const totalKcal = meals.reduce((s, m) => s + m.total_kcal, 0)
  const totalProtein = meals.reduce((s, m) => s + m.total_protein_g, 0)
  const totalCarb = meals.reduce((s, m) => s + m.total_carb_g, 0)
  const totalFat = meals.reduce((s, m) => s + m.total_fat_g, 0)
  const kcalPct = profile ? Math.min((totalKcal / profile.daily_kcal_goal) * 100, 100) : 0
  const waterGlasses = Math.round(waterMl / 250)

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
    </div>
  )

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'capitalize' }}>{today}</p>
          <h1 style={{ fontSize: 26, lineHeight: 1.2 }}>Olá, {profile?.name?.split(' ')[0]} 👋</h1>
        </div>
        <Link href="/log">
          <button className="btn btn-primary" style={{ padding: '10px 16px', fontSize: 13 }}>+ Refeição</button>
        </Link>
      </div>

      {/* Kcal ring */}
      <div className="card fade-up" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Circular progress SVG */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="var(--surface2)" strokeWidth="8" />
              <circle cx="45" cy="45" r="38" fill="none" stroke="var(--accent)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - kcalPct / 100)}`}
                transform="rotate(-90 45 45)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{Math.round(totalKcal)}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>kcal</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Consumido</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                {profile ? `Meta ${profile.daily_kcal_goal} kcal` : ''}
              </span>
            </div>
            <div className="progress-bar" style={{ height: 10, marginBottom: 8 }}>
              <div className="progress-fill" style={{ width: `${kcalPct}%`, background: 'var(--accent)' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {profile ? `${Math.round(profile.daily_kcal_goal - totalKcal)} kcal restantes` : ''}
            </p>
          </div>
        </div>

        {/* Macros */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {profile && <>
            <MacroBar label="Proteína" value={totalProtein} goal={profile.daily_protein_goal} color="var(--protein)" />
            <MacroBar label="Carbo" value={totalCarb} goal={profile.daily_carb_goal} color="var(--carb)" />
            <MacroBar label="Gordura" value={totalFat} goal={profile.daily_fat_goal} color="var(--fat)" />
          </>}
        </div>
      </div>

      {/* Água */}
      <div className="card fade-up" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, fontFamily: 'DM Sans', fontWeight: 600 }}>💧 Água</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{(waterMl / 1000).toFixed(1)}L de 2L</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[250, 500].map(ml => (
              <button key={ml} className="btn btn-ghost"
                onClick={() => addWater(ml)}
                style={{ padding: '8px 12px', fontSize: 13 }}>
                +{ml}ml
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 8, borderRadius: 99,
              background: i < waterGlasses ? 'var(--water)' : 'var(--surface2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Refeições do dia */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Refeições de hoje</h2>
        {meals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🍽️</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhuma refeição registrada hoje</p>
            <Link href="/log">
              <button className="btn btn-primary" style={{ marginTop: 16, fontSize: 13 }}>Registrar primeira refeição</button>
            </Link>
          </div>
        ) : (
          meals.map(meal => (
            <div key={meal.id} className="card fade-up" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span className="meal-chip">{MEAL_LABELS[meal.meal_type]}</span>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(meal.logged_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{Math.round(meal.total_kcal)} kcal</span>
                  <button onClick={() => deleteMeal(meal.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>
                    ×
                  </button>
                </div>
              </div>

              {meal.meal_items && meal.meal_items.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {meal.meal_items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>{item.food_name} <span style={{ color: 'var(--text-muted)' }}>({item.quantity_g}g)</span></span>
                      <span style={{ color: 'var(--text-muted)' }}>{Math.round(item.kcal)} kcal</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'P', value: meal.total_protein_g, color: 'var(--protein)' },
                  { label: 'C', value: meal.total_carb_g, color: 'var(--carb)' },
                  { label: 'G', value: meal.total_fat_g, color: 'var(--fat)' },
                ].map(m => (
                  <span key={m.label} style={{ fontSize: 12 }}>
                    <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}> {Math.round(m.value)}g</span>
                  </span>
                ))}
                {meal.confidence < 0.7 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--carb)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    ⚠️ estimativa baixa
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
