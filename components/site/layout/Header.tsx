'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { primaryNav } from '@/content/navigation'
import { ButtonLink } from '@/components/site/ui/Button'
import { cn } from '@/lib/utils'
import { Wordmark } from './Wordmark'
import { MobileNavigation } from './MobileNavigation'

/** Fixed header height. The hero reserves this space so nothing shifts on load. */
export const HEADER_HEIGHT = 72

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Solid background once the page moves off the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Route change closes any open dropdown.
  useEffect(() => setOpenMenu(null), [pathname])

  // Escape closes the dropdown; a click outside dismisses it.
  useEffect(() => {
    if (!openMenu) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
        // Return focus to the trigger so keyboard users are not stranded.
        navRef.current?.querySelector<HTMLButtonElement>(`[data-menu-trigger="${openMenu}"]`)?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [openMenu])

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140)
  }

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false
    return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-base ease-entrance',
        // Solid rather than translucent: a blurred bar reads lighter than the
        // dark sections behind it, which looked like an unrelated grey band.
        scrolled || openMenu
          ? 'border-b border-white/10 bg-ink'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div
        className="mx-auto flex max-w-container items-center justify-between gap-6 px-edge"
        style={{ height: HEADER_HEIGHT }}
      >
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center rounded-sm text-white transition-opacity duration-fast hover:opacity-80"
          aria-label="NEOMAX — home"
        >
          <Wordmark />
        </Link>

        <div ref={navRef} className="hidden items-center gap-1 lg:flex">
          <nav aria-label="Main">
            <ul className="flex items-center gap-1">
              {primaryNav.map(item =>
                item.children ? (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => {
                      cancelClose()
                      setOpenMenu(item.label)
                    }}
                    onMouseLeave={scheduleClose}
                  >
                    <button
                      type="button"
                      data-menu-trigger={item.label}
                      aria-expanded={openMenu === item.label}
                      aria-controls={`menu-${item.label}`}
                      onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                      className={cn(
                        'flex h-10 items-center gap-1.5 rounded-md px-3 text-body-sm transition-colors duration-fast',
                        isActive(item.href) ? 'text-white' : 'text-white/70 hover:text-white',
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'h-4 w-4 transition-transform duration-fast',
                          openMenu === item.label && 'rotate-180',
                        )}
                      />
                    </button>

                    {openMenu === item.label ? (
                      <div
                        id={`menu-${item.label}`}
                        className="absolute left-0 top-[calc(100%+8px)] w-[26rem] rounded-lg border border-white/12 bg-surface-dark p-2 shadow-2xl shadow-black/40"
                      >
                        <ul>
                          {item.children.map(child => (
                            <li key={child.href + child.label}>
                              <Link
                                href={child.href}
                                className="block rounded-md px-3 py-3 transition-colors duration-fast hover:bg-white/[0.06]"
                              >
                                <span className="block text-body-sm font-medium text-white">
                                  {child.label}
                                </span>
                                {child.description ? (
                                  <span className="mt-1 block text-body-sm leading-snug text-muted-dark">
                                    {child.description}
                                  </span>
                                ) : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'flex h-10 items-center rounded-md px-3 text-body-sm transition-colors duration-fast',
                        isActive(item.href) ? 'text-white' : 'text-white/70 hover:text-white',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <ButtonLink href="/contact" size="sm" className="ml-3">
            Book a Call
          </ButtonLink>
        </div>

        <MobileNavigation />
      </div>
    </header>
  )
}
