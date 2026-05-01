import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const start = `${date}T00:00:00.000Z`
  const end = `${date}T23:59:59.999Z`

  const { data, error } = await supabase
    .from('meals')
    .select('*, meal_items(*)')
    .eq('user_id', user.id)
    .gte('logged_at', start)
    .lte('logged_at', end)
    .order('logged_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const { meal_type, description, image_url, ai_result } = body

  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .insert({
      user_id: user.id,
      meal_type,
      description,
      image_url: image_url || null,
      ai_response: ai_result,
      total_kcal: ai_result.total_kcal,
      total_protein_g: ai_result.total_protein_g,
      total_carb_g: ai_result.total_carb_g,
      total_fat_g: ai_result.total_fat_g,
      confidence: ai_result.confidence,
    })
    .select()
    .single()

  if (mealError) return NextResponse.json({ error: mealError.message }, { status: 500 })

  const items = ai_result.items.map((item: any) => ({
    meal_id: meal.id,
    food_name: item.food_name,
    quantity_g: item.quantity_g,
    kcal: item.kcal,
    protein_g: item.protein_g,
    carb_g: item.carb_g,
    fat_g: item.fat_g,
    source: 'gemini',
  }))

  await supabase.from('meal_items').insert(items)

  return NextResponse.json(meal)
}
