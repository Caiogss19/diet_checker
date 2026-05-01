'use client'
import { useEffect, useState } from 'react'
import { Profile } from '@/types'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentário', light: 'Levemente ativo', moderate: 'Moderado',
  active: 'Ativo', very_active: 'Muito ativo'
}
const GOAL_LABELS: Record<string, string> = {
  lose: '🔥 Emagrecer', maintain: '⚖️ Manter peso', gain: '💪 Ganhar massa'
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      setProfile(d)
      setForm(d)
    })
  }, [])

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const updated = await res.json()
    setProfile(updated)
    setEditing(false)
    setSaving(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!profile) return <div className="page"><p style={{ color: 'var(--text-muted)' }}>Carregando...</p></div>

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Perfil</h1>
        <button className="btn btn-ghost" onClick={() => setEditing(!editing)} style={{ fontSize: 13 }}>
          {editing ? 'Cancelar' : '✏️ Editar'}
        </button>
      </div>

      {!editing ? (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#0f0f0f', fontWeight: 700, flexShrink: 0 }}>
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 18 }}>{profile.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {profile.age} anos · {profile.sex === 'M' ? 'Masculino' : 'Feminino'}
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Peso', value: `${profile.weight_kg}kg` },
                { label: 'Altura', value: `${profile.height_cm}cm` },
                { label: 'Objetivo', value: GOAL_LABELS[profile.goal]?.split(' ')[1] },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 15, marginBottom: 12 }}>🎯 Metas Diárias (calculadas)</h3>
            {[
              { label: 'Calorias', value: `${profile.daily_kcal_goal} kcal`, color: 'var(--accent)' },
              { label: 'Proteína', value: `${profile.daily_protein_goal}g`, color: 'var(--protein)' },
              { label: 'Carboidratos', value: `${profile.daily_carb_goal}g`, color: 'var(--carb)' },
              { label: 'Gorduras', value: `${profile.daily_fat_goal}g`, color: 'var(--fat)' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{m.label}</span>
                <span style={{ fontWeight: 600, color: m.color }}>{m.value}</span>
              </div>
            ))}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
              Atividade: {ACTIVITY_LABELS[profile.activity_level]} · {GOAL_LABELS[profile.goal]}
            </p>
          </div>

          <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
              <span style={{ fontWeight: 600 }}>Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
            </div>
            <button className="btn btn-ghost" onClick={toggleTheme} style={{ padding: '6px 12px', fontSize: 13 }}>
              Alternar
            </button>
          </div>

          <button className="btn btn-ghost" onClick={logout} style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            Sair da conta
          </button>
        </>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nome</label>
              <input value={form.name || ''} onChange={e => set('name', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Peso (kg)</label>
                <input type="number" step="0.1" value={form.weight_kg || ''} onChange={e => set('weight_kg', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Altura (cm)</label>
                <input type="number" value={form.height_cm || ''} onChange={e => set('height_cm', e.target.value)} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Objetivo</label>
              <select value={form.goal} onChange={e => set('goal', e.target.value)}>
                <option value="lose">Emagrecer</option>
                <option value="maintain">Manter peso</option>
                <option value="gain">Ganhar massa</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nível de atividade</label>
              <select value={form.activity_level} onChange={e => set('activity_level', e.target.value)}>
                <option value="sedentary">Sedentário</option>
                <option value="light">Levemente ativo</option>
                <option value="moderate">Moderado</option>
                <option value="active">Ativo</option>
                <option value="very_active">Muito ativo</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ marginTop: 4 }}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
