'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const STEPS = ['Conta', 'Perfil', 'Objetivo']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    email: '', password: '', name: '',
    sex: 'M', age: '', weight_kg: '', height_cm: '',
    activity_level: 'moderate', goal: 'lose',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError || !authData.user) {
      setError(authError?.message || 'Erro ao criar conta')
      setLoading(false)
      return
    }

    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        sex: form.sex,
        age: parseInt(form.age),
        weight_kg: parseFloat(form.weight_kg),
        height_cm: parseFloat(form.height_cm),
        activity_level: form.activity_level,
        goal: form.goal,
      }),
    })

    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Criar conta</h1>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{
                height: 4, width: 40, borderRadius: 99,
                background: i <= step ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.3s'
              }} />
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Passo {step + 1} de {STEPS.length}: {STEPS[step]}</p>
        </div>

        <div className="card">
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nome</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Seu nome" />
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" />
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Senha</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" />
              <button className="btn btn-primary" onClick={() => setStep(1)} style={{ width: '100%' }}
                disabled={!form.name || !form.email || form.password.length < 6}>
                Próximo →
              </button>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Sexo</label>
                  <select value={form.sex} onChange={e => set('sex', e.target.value)}>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Idade</label>
                  <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Peso (kg)</label>
                  <input type="number" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="70" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Altura (cm)</label>
                  <input type="number" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} placeholder="170" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep(0)} style={{ flex: 1 }}>← Voltar</button>
                <button className="btn btn-primary" onClick={() => setStep(2)} style={{ flex: 2 }}
                  disabled={!form.age || !form.weight_kg || !form.height_cm}>
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Objetivo</label>
                {[
                  { v: 'lose', label: '🔥 Emagrecer', desc: '-500 kcal/dia' },
                  { v: 'maintain', label: '⚖️ Manter peso', desc: 'TDEE calculado' },
                  { v: 'gain', label: '💪 Ganhar massa', desc: '+300 kcal/dia' },
                ].map(opt => (
                  <div key={opt.v} onClick={() => set('goal', opt.v)}
                    style={{
                      padding: '12px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      border: `2px solid ${form.goal === opt.v ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.goal === opt.v ? 'var(--accent-alpha)' : 'transparent',
                      marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background-color 0.3s ease, border-color 0.3s ease'
                    }}>
                    <span style={{ fontWeight: 500 }}>{opt.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</span>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nível de atividade</label>
                <select value={form.activity_level} onChange={e => set('activity_level', e.target.value)}>
                  <option value="sedentary">Sedentário</option>
                  <option value="light">Levemente ativo (1-3x/sem)</option>
                  <option value="moderate">Moderado (3-5x/sem)</option>
                  <option value="active">Ativo (6-7x/sem)</option>
                  <option value="very_active">Muito ativo</option>
                </select>
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Voltar</button>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Criando...' : '🚀 Começar'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
