import { Link, useLocation } from 'react-router-dom'
import { Waves } from 'lucide-react'

export default function Navbar() {
  const { pathname } = useLocation()
  const linkClass = (path) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-cyan-600 text-white'
        : 'text-slate-300 hover:text-white hover:bg-slate-700'
    }`

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Waves className="text-cyan-400" size={22} />
            <span className="font-bold text-white text-base tracking-tight">Wave Monitor BR</span>
          </div>
          <div className="flex gap-2">
            <Link to="/" className={linkClass('/')}>Sobre</Link>
            <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
