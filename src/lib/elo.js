import { ELO_DEFAULT, ELO_K_FACTOR } from './constants'

export function calculateElo(winnerRating, loserRating, kFactor = ELO_K_FACTOR) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400))
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400))

  const newWinnerRating = Math.round(winnerRating + kFactor * (1 - expectedWinner))
  const newLoserRating = Math.round(loserRating + kFactor * (0 - expectedLoser))

  return { winnerRating: newWinnerRating, loserRating: newLoserRating }
}

export function generateMatchups(photos, count = 15) {
  if (photos.length < 2) return []

  const matchups = []
  const used = new Set()

  // Generate all possible pairs
  const allPairs = []
  for (let i = 0; i < photos.length; i++) {
    for (let j = i + 1; j < photos.length; j++) {
      allPairs.push([photos[i], photos[j]])
    }
  }

  // Shuffle pairs
  for (let i = allPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPairs[i], allPairs[j]] = [allPairs[j], allPairs[i]]
  }

  // Take up to count matchups
  return allPairs.slice(0, Math.min(count, allPairs.length))
}

export function initializeScores(photos) {
  const scores = {}
  for (const photo of photos) {
    scores[photo.id] = ELO_DEFAULT
  }
  return scores
}
