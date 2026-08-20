import type { Metadata, Viewport } from 'next'
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'

/**
 * Root layout only owns <html>/<body> and the font variables. Page-level
 * metadata is set by the route-group layouts so the marketing site and the
 * internal payroll app can each describe themselves correctly.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'NEOMAX Technologies',
  description: 'Global growth and technology partner for ambitious companies.',
}

export const viewport: Viewport = {
  themeColor: '#080B12',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
