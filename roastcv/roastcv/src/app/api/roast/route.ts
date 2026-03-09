import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobTarget } = await req.json()

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({ error: 'CV terlalu pendek atau kosong.' }, { status: 400 })
    }

    const prompt = `Kamu adalah "RoastBot" — AI reviewer CV yang jujur, blak-blakan, tapi tetap helpful. Gaya bahasa: campur Indonesia-Inggris, santai kayak teman yang jujur, sedikit humor tapi tetap profesional.

CV yang disubmit:
"""
${cvText}
"""

${jobTarget ? `Target posisi: ${jobTarget}` : ''}

Analisis CV ini secara menyeluruh dan return HANYA JSON valid (tanpa markdown, tanpa backtick) dengan format PERSIS ini:

{
  "score": <angka 0-100>,
  "scoreLabel": "<label singkat berdasarkan skor: 0-30='Kritis', 31-50='Lemah', 51-70='Lumayan', 71-85='Oke', 86-100='Mantap'>",
  "roastOpening": "<1-2 kalimat opening roast yang blak-blakan tapi lucu, langsung ke inti masalah terbesar CV ini>",
  "categories": {
    "format": <0-100>,
    "content": <0-100>,
    "impact": <0-100>,
    "ats": <0-100>,
    "relevance": <0-100>
  },
  "issues": [
    {
      "severity": "fatal|major|minor",
      "title": "<judul masalah singkat>",
      "roast": "<komentar roast blak-blakan tentang masalah ini, 1-2 kalimat>",
      "fix": "<saran konkret cara fixnya, actionable, 1-2 kalimat>"
    }
  ],
  "strengths": ["<hal positif 1>", "<hal positif 2>", "<hal positif 3 jika ada>"],
  "topFix": "<1 hal paling penting yang HARUS difix sekarang, spesifik>",
  "verdict": "<verdict akhir 2-3 kalimat: ringkasan jujur kondisi CV + motivasi untuk improve>"
}

Rules:
- issues: minimal 3, maksimal 6 isu terpenting
- severity fatal = dealbreaker/langsung reject, major = signifikan, minor = nitpick
- Tetap constructive, tujuannya bantu user improve bukan down
- Bahasa Indonesia-Inggris campur, santai tapi insightful
- Skor jujur, jangan terlalu baik/buruk kalau tidak sesuai kenyataan`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal analisis CV. Coba lagi.' }, { status: 500 })
  }
}
