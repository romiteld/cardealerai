import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { vehicleType, prompt } = await req.json()

    if (!vehicleType || !prompt) {
      return NextResponse.json(
        { error: 'Vehicle type and prompt are required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert automotive content writer. Create a compelling and detailed vehicle description that highlights the key features and benefits. Focus on creating engaging, professional content that would appeal to potential buyers.`

    const userPrompt = `Create a detailed description for a ${vehicleType} with the following details:\n${prompt}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 750,
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated')
    }

    return NextResponse.json({ content: generatedContent })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
} 