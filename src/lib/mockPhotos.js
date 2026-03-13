import { ROOM_TYPES } from './constants'

// Map each subcategory to its Picsum seed and pre-assigned tags
const MOCK_SUBCATEGORIES = {
  // KITCHEN
  'kitchen-overall-style': {
    tags: ['modern', 'warm-tones', 'natural-light'],
    description: 'A modern kitchen with warm tones and natural lighting',
  },
  'kitchen-cabinets-storage': {
    tags: ['hidden-storage', 'modern', 'wood'],
    description: 'Kitchen cabinets with modern design and hidden storage',
  },
  'kitchen-countertops-backsplash': {
    tags: ['marble', 'modern', 'bold-color'],
    description: 'Kitchen countertops and backsplash with marble and bold colors',
  },
  'kitchen-lighting-fixtures': {
    tags: ['statement-lighting', 'modern', 'natural-light'],
    description: 'Kitchen with statement lighting fixtures',
  },
  'kitchen-layout-space': {
    tags: ['open-shelving', 'modern', 'natural-light'],
    description: 'Open and spacious kitchen layout with natural light',
  },

  // LIVING ROOM
  'living-room-overall-style': {
    tags: ['scandinavian', 'neutral-palette', 'natural-light'],
    description: 'A Scandinavian living room with neutral palette',
  },
  'living-room-seating-sofas': {
    tags: ['minimalist', 'warm-tones', 'natural-materials'],
    description: 'Living room with minimalist seating and natural materials',
  },
  'living-room-lighting-ambiance': {
    tags: ['statement-lighting', 'warm-tones', 'natural-light'],
    description: 'Living room with statement lighting creating warm ambiance',
  },
  'living-room-storage-shelving': {
    tags: ['open-shelving', 'minimalist', 'wood'],
    description: 'Living room storage and shelving with minimalist wood design',
  },
  'living-room-color-texture': {
    tags: ['neutral-palette', 'warm-tones', 'natural-materials'],
    description: 'Living room with neutral colors and natural texture materials',
  },

  // BEDROOM
  'bedroom-overall-style': {
    tags: ['minimalist', 'cool-tones', 'natural-light'],
    description: 'A minimalist bedroom with cool tones and natural light',
  },
  'bedroom-bed-headboard': {
    tags: ['natural-materials', 'warm-tones', 'wood'],
    description: 'Bedroom bed and headboard with natural wood materials',
  },
  'bedroom-lighting-mood': {
    tags: ['statement-lighting', 'natural-light', 'cool-tones'],
    description: 'Bedroom lighting that sets a calm, cool mood',
  },
  'bedroom-storage-wardrobes': {
    tags: ['hidden-storage', 'minimalist', 'wood'],
    description: 'Bedroom storage and wardrobes with minimalist wood design',
  },
  'bedroom-color-materials': {
    tags: ['neutral-palette', 'natural-materials', 'warm-tones'],
    description: 'Bedroom with neutral colors and natural material textures',
  },
}

// Build a keywords → subcategory ID mapping for lookup
const KEYWORDS_TO_ID = {}
for (const [roomId, room] of Object.entries(ROOM_TYPES)) {
  for (const sub of room.subcategories) {
    KEYWORDS_TO_ID[sub.keywords] = `${roomId}-${sub.id}`
  }
}

export function getMockPhotos(keywords) {
  // Find which subcategory these keywords belong to
  const subId = KEYWORDS_TO_ID[keywords]
  if (!subId) {
    console.warn(`Unknown keywords: ${keywords}`)
    return []
  }

  const subConfig = MOCK_SUBCATEGORIES[subId]
  if (!subConfig) {
    console.warn(`No mock config for subcategory: ${subId}`)
    return []
  }

  // Generate 10 photos for this subcategory with deterministic seeds
  // Use keywords string hash for a consistent, deterministic base seed
  let hash = 0
  for (let i = 0; i < keywords.length; i++) {
    hash = ((hash << 5) - hash) + keywords.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  const baseIndex = Math.abs(hash) % 1000

  const photos = []
  for (let i = 0; i < 10; i++) {
    const seed = baseIndex * 100 + i
    photos.push({
      id: `mock-${subId}-${i}`,
      url: `https://picsum.photos/seed/${seed}/800/600`,
      thumbUrl: `https://picsum.photos/seed/${seed}/200/150`,
      description: subConfig.description,
      tags: subConfig.tags,
      photographer: 'Picsum Photos',
      photographerUrl: 'https://picsum.photos',
      unsplashTags: [], // Mock photos don't have raw Unsplash tags
    })
  }

  return photos
}
