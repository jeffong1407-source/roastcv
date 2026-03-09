import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RoastCV — AI Roast CV Lo, Gratis!',
  description: 'Upload CV lo, AI kasih roast brutal + feedback actionable buat ningkatin peluang kerja lo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: '#09070f', minHeight: '100vh' }}>{children}</body>
    </html>
  )
}
