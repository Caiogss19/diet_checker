'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GeminiResult } from '@/types'

const MEAL_TYPES = [
  { v: 'cafe', label: '☕ Café da Manhã' },
  { v: 'almoco', label: '🍽️ Almoço' },
  { v: 'jantar', label: '🌙 Jantar' },
  { v: 'lanche', label: '🍎 Lanche' },
]

function currentMealType() {
  const h = new Date().getHours()
  if (h < 10) return 'cafe'
  if (h < 14) return 'almoco'
  if (h < 19) return 'jantar'
  return 'lanche'
}

export default function LogPage() {
  const [mealType, setMealType] = useState(currentMealType())
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<GeminiResult | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
  }

  async function analyze() {
    if (!text && !image) return
    setAnalyzing(true)
    setError('')
    setResult(null)

    const fd = new FormData()
    if (text) fd.append('text', text)
    if (image) fd.append('image', image)

    const res = await fetch('/api/analyze', { method: 'POST', body: fd })
    const data = await res.json()

    if (data.error) {
      setError('Não foi possível analisar. Tente descrever melhor a refeição.')
    } else {
      setResult(data)
    }
    setAnalyzing(false)
  }

  async function save() {
    if (!result) return
    setSaving(true)

    let image_url = null
    if (image) {
      // Upload to Supabase Storage
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const ext = image.name.split('.').pop()
      const path = `${user?.id}/${Date.now()}.${ext}`
      const { data } = await supabase.storage.from('meal-images').upload(path, image)
      image_url = data?.path || null
    }

    await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_type: mealType, description: text, image_url, ai_result: result }),
    })

    router.push('/dashboard')
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 24 }}>Registrar Refeição</h1>
      </div>

      {/* Meal type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {MEAL_TYPES.map(t => (
          <button key={t.v} onClick={() => setMealType(t.v)}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              background: mealType === t.v ? 'var(--accent-alpha)' : 'var(--surface)',
              border: `2px solid ${mealType === t.v ? 'var(--accent)' : 'var(--border)'}`,
              fontSize: 13,
              transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Image upload */}
      <div className="card" style={{ marginBottom: 16, textAlign: 'center', cursor: 'pointer' }}
        onClick={() => fileRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <div style={{ padding: '24px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 28, marginBottom: 6 }}>📸</p>
            <p style={{ fontSize: 14 }}>Tirar foto ou escolher da galeria</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>JPEG, PNG — máx. 10MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} style={{ display: 'none' }} />
      </div>

      {/* Text input */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setResult(null) }}
          placeholder="Ou descreva o que comeu: ex. 'arroz, feijão, frango grelhado 150g e salada'"
          rows={3}
        />
      </div>

      {/* Analyze button */}
      {!result && (
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }}
          onClick={analyze} disabled={analyzing || (!text && !image)}>
          {analyzing ? '🔍 Analisando com IA...' : '✨ Analisar com IA'}
        </button>
      )}

      {error && (
        <div style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 16 }}>
          <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Result preview */}
      {result && (
        <div className="card fade-up" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontFamily: 'DM Sans', fontWeight: 600 }}>Resultado da análise</h3>
            <span style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 99,
              background: result.confidence >= 0.8 ? 'rgba(52,211,153,0.15)' : result.confidence >= 0.7 ? 'rgba(251,191,36,0.15)' : 'rgba(255,82,82,0.15)',
              color: result.confidence >= 0.8 ? 'var(--water)' : result.confidence >= 0.7 ? 'var(--carb)' : 'var(--danger)',
            }}>
              {result.confidence >= 0.8 ? '✓ Alta confiança' : result.confidence >= 0.7 ? '~ Confiança média' : '⚠ Baixa confiança'}
            </span>
          </div>

          {result.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span>{item.food_name} <span style={{ color: 'var(--text-muted)' }}>({item.quantity_g}g)</span></span>
              <span style={{ fontWeight: 600 }}>{Math.round(item.kcal)} kcal</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{Math.round(result.total_kcal)}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>kcal</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--protein)' }}>{Math.round(result.total_protein_g)}g</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>proteína</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--carb)' }}>{Math.round(result.total_carb_g)}g</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>carbo</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--fat)' }}>{Math.round(result.total_fat_g)}g</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>gordura</p>
            </div>
          </div>

          {result.notes && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic' }}>
              💡 {result.notes}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setResult(null)} style={{ flex: 1, fontSize: 13 }}>
              ↩ Refazer
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ flex: 2, fontSize: 13 }}>
              {saving ? 'Salvando...' : '✓ Salvar refeição'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
