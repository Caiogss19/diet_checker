import { GoogleGenerativeAI } from '@google/generative-ai'
import { GeminiResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PROMPT = `Você é um nutricionista especialista em alimentos brasileiros.
Analise a refeição descrita ou fotografada e retorne APENAS JSON válido, sem markdown, sem texto fora do JSON.

Formato obrigatório:
{
  "items": [
    {
      "food_name": "Nome do alimento",
      "quantity_g": 150,
      "kcal": 195,
      "protein_g": 3.6,
      "carb_g": 43.2,
      "fat_g": 0.3
    }
  ],
  "total_kcal": 195,
  "total_protein_g": 3.6,
  "total_carb_g": 43.2,
  "total_fat_g": 0.3,
  "confidence": 0.85,
  "notes": "Observação sobre a estimativa"
}

Regras:
- Use valores da tabela TACO/IBGE como referência principal
- Estime porções visualmente quando necessário e mencione no notes
- confidence: 0.9+ alta | 0.7-0.9 média | <0.7 baixa
- Retorne JSON puro, sem nenhum texto fora do objeto`

export async function analyzeFood(input: {
  text?: string
  imageBase64?: string
  mimeType?: string
}): Promise<GeminiResult | null> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const parts: any[] = [{ text: PROMPT }]

  if (input.imageBase64) {
    parts.push({
      inlineData: {
        data: input.imageBase64,
        mimeType: input.mimeType || 'image/jpeg',
      },
    })
    parts.push({ text: 'Analise esta refeição:' })
  }

  if (input.text) {
    parts.push({ text: `Analise: ${input.text}` })
  }

  try {
    const result = await model.generateContent(parts)
    const raw = result.response.text()
    const match = raw.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  } catch {
    return null
  }
}
