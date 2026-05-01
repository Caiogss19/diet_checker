'use client'
import { useEffect, useState } from 'react'
import { WeightLog } from '@/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ProgressoPage() {
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadWeights() }, [])

  async function loadWeights() {
    const res = await fetch('/api/weight')
    const data = await res.json()
    setWeights(Array.isArray(data) ? data : [])
  }

  async function saveWeight() {
    if (!newWeight) return
    setSaving(true)
    await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight_kg: parseFloat(newWeight) }),
    })
    setNewWeight('')
    await loadWeights()
    setSaving(false)
  }

  const chartData = weights.map(w => ({
    date: new Date(w.logged_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
    peso: w.weight_kg,
  }))

  const latest = weights[weights.length - 1]
  const first = weights[0]
  const diff = latest && first ? latest.weight_kg - first.weight_kg : 0

  return (
    <div className="page">
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Progresso</h1>

      {/* Registrar peso */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 12 }}>⚖️ Registrar peso de hoje</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            placeholder="Ex: 72.5"
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={saveWeight} disabled={saving || !newWeight} style={{ flexShrink: 0 }}>
            {saving ? '...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {latest && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Atual', value: `${latest.weight_kg}kg`, color: 'var(--accent)' },
            { label: 'Inicial', value: first ? `${first.weight_kg}kg` : '-', color: 'var(--text-muted)' },
            {
              label: 'Variação', value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg`,
              color: diff < 0 ? 'var(--water)' : diff > 0 ? 'var(--danger)' : 'var(--text-muted)'
            },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: 14 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 16 }}>📈 Evolução do peso</h3>
        {chartData.length < 2 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 32 }}>
            Registre pelo menos 2 pesagens para ver o gráfico
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                domain={['dataMin - 1', 'dataMax + 1']}
                width={40}
              />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-muted)' }}
                itemStyle={{ color: 'var(--accent)' }}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
