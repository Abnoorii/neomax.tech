import Link from 'next/link'
import type { Metadata } from 'next'
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google'
import { ArrowRight } from 'lucide-react'
import { primaryNav } from '@/content/navigation'
import { Wordmark } from '@/components/site/layout/Wordmark'
import { ButtonLink } from '@/components/site/ui/Button'
import './globals.css'

/**
 * Root not-found. Next renders this outside the (site) route group, so it
 * carries its own shell rather than inheriting the marketing header/footer.
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div
      className={`${inter.variable} ${manrope.variable} ${mono.variable} neomax-root neomax-dark flex min-h-screen flex-col bg-ink font-sans text-white`}
    >
      <header className="mx-auto flex h-[72px] w-full max-w-container items-center px-edge">
        <Link href="/" className="inline-flex min-h-[44px] items-center text-white" aria-label="NEOMAX — home">
          <Wordmark />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-container flex-1 flex-col justify-center px-edge py-section">
        <p className="font-mono text-label uppercase text-lime">Error 404</p>
        <h1 className="mt-5 max-w-3xl font-display text-display-lg text-balance text-white">
          That page doesn’t exist.
        </h1>
        <p className="mt-5 max-w-measure text-body-lg text-muted-dark">
          The link may be out of date, or the page may have moved. Here is where most
          people are heading.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg" className="group">
            Back to home
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5"
            />
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline-dark" size="lg">
            Book a strategy call
          </ButtonLink>
        </div>

        <nav aria-label="Popular pages" className="mt-16 border-t border-white/12 pt-8">
          <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
            Popular pages
          </h2>
          <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {primaryNav.map(item => (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  className="flex min-h-[44px] items-center text-body text-white/80 transition-colors duration-fast hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  )
}
