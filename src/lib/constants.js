export const ROOM_TYPES = {
  kitchen: {
    label: 'Kitchen',
    emoji: '',
    subcategories: [
      { id: 'overall-style', label: 'Overall Style', keywords: 'kitchen interior design style' },
      { id: 'cabinets-storage', label: 'Cabinets & Storage', keywords: 'modern kitchen cabinets interior' },
      { id: 'countertops-backsplash', label: 'Countertops & Backsplash', keywords: 'kitchen countertop backsplash design' },
      { id: 'lighting-fixtures', label: 'Lighting & Fixtures', keywords: 'kitchen lighting fixtures pendant' },
      { id: 'layout-space', label: 'Layout & Space', keywords: 'kitchen layout open plan design' },
    ],
  },
  'living-room': {
    label: 'Living Room',
    emoji: '',
    subcategories: [
      { id: 'overall-style', label: 'Overall Style', keywords: 'living room interior design style' },
      { id: 'seating-sofas', label: 'Seating & Sofas', keywords: 'living room sofa seating design' },
      { id: 'lighting-ambiance', label: 'Lighting & Ambiance', keywords: 'living room lighting ambiance cozy' },
      { id: 'storage-shelving', label: 'Storage & Shelving', keywords: 'living room shelving storage design' },
      { id: 'color-texture', label: 'Color & Texture', keywords: 'living room color texture interior' },
    ],
  },
  bedroom: {
    label: 'Bedroom',
    emoji: '',
    subcategories: [
      { id: 'overall-style', label: 'Overall Style', keywords: 'bedroom interior design style' },
      { id: 'bed-headboard', label: 'Bed & Headboard', keywords: 'bedroom bed headboard design' },
      { id: 'lighting-mood', label: 'Lighting & Mood', keywords: 'bedroom lighting mood ambient' },
      { id: 'storage-wardrobes', label: 'Storage & Wardrobes', keywords: 'bedroom wardrobe storage design' },
      { id: 'color-materials', label: 'Color & Materials', keywords: 'bedroom color materials texture' },
    ],
  },
}

export const TAG_TAXONOMY = [
  'modern', 'traditional', 'rustic', 'minimalist', 'maximalist',
  'warm-tones', 'cool-tones', 'natural-materials', 'marble', 'wood',
  'open-shelving', 'hidden-storage', 'industrial', 'scandinavian',
  'mediterranean', 'bold-color', 'neutral-palette', 'statement-lighting',
  'natural-light',
]

export const TAG_KEYWORDS = {
  'modern': ['modern', 'contemporary', 'sleek', 'clean lines', 'minimal'],
  'traditional': ['traditional', 'classic', 'ornate', 'antique', 'heritage'],
  'rustic': ['rustic', 'farmhouse', 'cottage', 'country', 'reclaimed', 'barn'],
  'minimalist': ['minimalist', 'minimal', 'simple', 'clean', 'sparse', 'less is more'],
  'maximalist': ['maximalist', 'eclectic', 'bold', 'layered', 'rich', 'ornate', 'pattern'],
  'warm-tones': ['warm', 'terracotta', 'amber', 'ochre', 'beige', 'cream', 'tan', 'gold', 'honey', 'earth'],
  'cool-tones': ['cool', 'blue', 'gray', 'silver', 'icy', 'slate', 'navy', 'teal'],
  'natural-materials': ['natural', 'organic', 'linen', 'cotton', 'jute', 'rattan', 'bamboo', 'stone'],
  'marble': ['marble', 'granite', 'quartz', 'veined', 'stone slab'],
  'wood': ['wood', 'wooden', 'timber', 'oak', 'walnut', 'pine', 'teak', 'cedar'],
  'open-shelving': ['open shelving', 'floating shelves', 'display', 'shelf'],
  'hidden-storage': ['hidden', 'concealed', 'built-in', 'integrated', 'seamless', 'flush'],
  'industrial': ['industrial', 'metal', 'steel', 'exposed brick', 'concrete', 'pipe', 'loft'],
  'scandinavian': ['scandinavian', 'nordic', 'hygge', 'scandi', 'swedish', 'danish'],
  'mediterranean': ['mediterranean', 'tuscan', 'spanish', 'greek', 'tile', 'mosaic', 'arch'],
  'bold-color': ['bold', 'vibrant', 'colorful', 'accent', 'pop of color', 'bright', 'saturated'],
  'neutral-palette': ['neutral', 'muted', 'soft', 'calm', 'subtle', 'monochrome', 'tonal'],
  'statement-lighting': ['statement', 'chandelier', 'pendant', 'fixture', 'lamp', 'sconce'],
  'natural-light': ['natural light', 'window', 'sunlight', 'bright', 'airy', 'skylight'],
}

export const ELO_DEFAULT = 1500
export const ELO_K_FACTOR = 32
export const ELO_COMPARISONS_PER_PLAYER = 15
export const PHOTOS_PER_SUBCATEGORY = 5
