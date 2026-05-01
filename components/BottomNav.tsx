'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/dashboard', label: 'Início', icon: '🏠' },
  { href: '/log', label: 'Registrar', icon: '➕' },
  { href: '/historico', label: 'Histórico', icon: '📋' },
  { href: '/progresso', label: 'Progresso', icon: '📈' },
  { href: '/perfil', label: 'Perfil', icon: '👤' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="nav-bottom">
      {ITEMS.map(item => (
        <Link key={item.href} href={item.href}
          className={`nav-item ${path === item.href ? 'active' : ''}`}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
