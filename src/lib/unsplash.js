import { TAG_KEYWORDS } from './constants'
import { getMockPhotos } from './mockPhotos'

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || ''

export async function searchPhotos(query, count = 10, page = 1) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&page=${page}&orientation=landscape`
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  })

  if (!res.ok) {
    console.error('Unsplash API error:', res.status)
    return []
  }

  const data = await res.json()
  return data.results || []
}

export function assignTags(photo) {
  const text = [
    photo.description || '',
    photo.alt_description || '',
    ...(photo.tags || []).map(t => t.title || ''),
  ].join(' ').toLowerCase()

  const scores = {}

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += 1
      }
    }
    if (score > 0) scores[tag] = score
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag)

  // If we couldn't find 3 tags, fill with defaults based on the photo
  while (sorted.length < 3) {
    const defaults = ['modern', 'neutral-palette', 'natural-light', 'warm-tones', 'minimalist']
    for (const d of defaults) {
      if (!sorted.includes(d) && sorted.length < 3) {
        sorted.push(d)
      }
    }
  }

  return sorted
}

export async function fetchPhotosForSubcategory(keywords, backupKeywords = 'interior design') {
  // Use mock photos if no Unsplash API key configured
  if (!UNSPLASH_ACCESS_KEY) {
    return getMockPhotos(keywords)
  }

  let photos = await searchPhotos(keywords, 10)

  if (photos.length < 10) {
    const backupPhotos = await searchPhotos(backupKeywords, 10 - photos.length)
    photos = [...photos, ...backupPhotos]
  }

  return photos.slice(0, 10).map(photo => ({
    id: photo.id,
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    description: photo.alt_description || photo.description || '',
    tags: assignTags(photo),
    photographer: photo.user?.name || 'Unknown',
    photographerUrl: photo.user?.links?.html || '',
    unsplashTags: (photo.tags || []).map(t => t.title),
  }))
}
