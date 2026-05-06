import './globals.css'
import Providers from '@/components/Providers'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata = {
  title: 'Hariku',
  description: 'Your daily productivity companion',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased font-sans text-text-primary bg-background ${playfair.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
