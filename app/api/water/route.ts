import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const date = new URL(req.url).searchParams.get('date') || new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', `${date}T00:00:00Z`)
    .lte('logged_at', `${date}T23:59:59Z`)

  const total = (data || []).reduce((sum, l) => sum + l.amount_ml, 0)
  return NextResponse.json({ logs: data, total_ml: total })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { amount_ml } = await req.json()

  const { data, error } = await supabase
    .from('water_logs')
    .insert({ user_id: user.id, amount_ml })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
