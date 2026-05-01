import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })
    .limit(90)

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { weight_kg } = await req.json()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('weight_logs')
    .upsert({ user_id: user.id, weight_kg, logged_at: today }, { onConflict: 'user_id,logged_at' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
