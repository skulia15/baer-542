'use client'

import { Bell, CalendarDays, Settings, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomTabsProps {
  unreadCount: number
}

export function BottomTabs({ unreadCount }: BottomTabsProps) {
  const pathname = usePathname()

  const tabs = [
    { href: '/dagatal', label: 'Dagatal', Icon: CalendarDays },
    { href: '/tilkynningar', label: 'Tilkynningar', Icon: Bell },
    { href: '/innkaup', label: 'Innkaup', Icon: ShoppingCart },
    { href: '/stillingar', label: 'Stillingar', Icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-[430px] items-center justify-around">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          const isNotif = href === '/tilkynningar'
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-green-700' : 'text-stone-400'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
              <span>{label}</span>
              {isNotif && unreadCount > 0 && (
                <span className="absolute right-4 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
