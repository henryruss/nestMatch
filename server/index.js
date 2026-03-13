import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
app.use(express.json())

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

app.post('/api/claude/style-summary', async (req, res) => {
  const { name, tags, roomType } = req.body

  const tagList = Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => `${tag} (${count}x)`)
    .join(', ')

  const prompt = `Based on these interior design style tags and their frequencies from someone's choices for their dream ${roomType}: ${tagList}

Write a warm, specific 2-3 sentence personal style summary for ${name}. Be specific about materials, colors, and moods — not generic. Start with their name.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    res.json({ summary: message.content[0].text })
  } catch (error) {
    console.error('Claude API error:', error)
    res.json({
      summary: `${name}, your style choices reveal a distinctive eye for design — a blend of comfort and intention that makes any space feel like home.`
    })
  }
})

app.post('/api/claude/couple-summary', async (req, res) => {
  const { name1, name2, tags1, tags2, roomType } = req.body

  const tagList1 = Object.entries(tags1)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => `${tag} (${count}x)`)
    .join(', ')

  const tagList2 = Object.entries(tags2)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => `${tag} (${count}x)`)
    .join(', ')

  const prompt = `Two people are designing their dream ${roomType} together. Person 1 (${name1}) prefers: ${tagList1}. Person 2 (${name2}) prefers: ${tagList2}. Write a warm, specific 3-4 sentence summary of their shared aesthetic — like a talented interior designer describing their combined vision. Name specific materials, moods, lighting styles, and textures. End with one sentence that captures the feeling of being in the room.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    res.json({ summary: message.content[0].text })
  } catch (error) {
    console.error('Claude API error:', error)
    res.json({
      summary: `${name1} and ${name2} share a beautiful vision — a space that balances both of their instincts into something neither could have imagined alone. Their dream ${roomType} is waiting to be built.`
    })
  }
})

app.post('/api/claude/dream-room', async (req, res) => {
  const { name1, name2, topTags, roomType } = req.body

  const tagString = topTags.join(', ')

  const prompt = `Write a single evocative paragraph describing ${name1} and ${name2}'s dream ${roomType} as if you are standing in it right now. Base it on these shared style preferences: ${tagString}. Be sensory and specific — describe light, materials, textures, and the feeling of the space. Do not use bullet points. Write in present tense. Make it feel aspirational but real.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    res.json({ narrative: message.content[0].text })
  } catch (error) {
    console.error('Claude API error:', error)
    res.json({
      narrative: `Step into ${name1} and ${name2}'s dream ${roomType} and you'll feel it immediately — a space that breathes with warmth and intention, where every surface tells a story and every corner invites you to linger a little longer.`
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`NestMatch API server running on port ${PORT}`)
})
