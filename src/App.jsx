import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame'
import Landing from './pages/Landing'
import SwipePage from './pages/SwipePage'
import WaitingRoom from './pages/WaitingRoom'
import EloPage from './pages/EloPage'
import MatchReport from './pages/MatchReport'

function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/session/:sessionId/player/:playerNumber" element={<SwipePage />} />
          <Route path="/session/:sessionId/player/:playerNumber/waiting" element={<WaitingRoom />} />
          <Route path="/session/:sessionId/player/:playerNumber/elo" element={<EloPage />} />
          <Route path="/session/:sessionId/results" element={<MatchReport />} />
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  )
}

export default App
