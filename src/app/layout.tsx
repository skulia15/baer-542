import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bær 524',
  description: 'Sumarhúsakerfi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="is">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
