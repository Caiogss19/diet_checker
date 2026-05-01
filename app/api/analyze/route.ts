import { analyzeFood } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const text = formData.get('text') as string | null
    const file = formData.get('image') as File | null

    if (!text && !file) {
      return NextResponse.json({ error: 'Envie texto ou imagem' }, { status: 400 })
    }

    let imageBase64: string | undefined
    let mimeType: string | undefined

    if (file) {
      const bytes = await file.arrayBuffer()
      imageBase64 = Buffer.from(bytes).toString('base64')
      mimeType = file.type
    }

    const result = await analyzeFood({
      text: text || undefined,
      imageBase64,
      mimeType,
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Não foi possível analisar o alimento' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
