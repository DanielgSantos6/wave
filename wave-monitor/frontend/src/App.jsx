import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AboutPage from './pages/AboutPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="pb-12">
        <Routes>
          <Route path="/" element={<AboutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
