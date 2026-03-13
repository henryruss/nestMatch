const API_BASE = '/api'

async function apiCall(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error)
    return null
  }
}

export async function getStyleSummary(name, tags, roomType) {
  const result = await apiCall('/claude/style-summary', { name, tags, roomType })
  return result?.summary || `${name}, your style choices reveal a distinctive eye for design — a blend of comfort and intention that makes any space feel like home.`
}

export async function getCoupleSummary(name1, name2, tags1, tags2, roomType) {
  const result = await apiCall('/claude/couple-summary', { name1, name2, tags1, tags2, roomType })
  return result?.summary || `${name1} and ${name2} share a beautiful vision — a space that balances both of their instincts into something neither could have imagined alone.`
}

export async function getDreamRoom(name1, name2, topTags, roomType) {
  const result = await apiCall('/claude/dream-room', { name1, name2, topTags, roomType })
  return result?.narrative || `Step into ${name1} and ${name2}'s dream ${roomType} and you'll feel it immediately — a space that breathes with warmth and intention, where every surface tells a story.`
}
