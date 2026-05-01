import { createClient } from '@/lib/supabase'
import { calcMetas } from '@/lib/tmb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const metas = calcMetas(body)

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...body, ...metas })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
