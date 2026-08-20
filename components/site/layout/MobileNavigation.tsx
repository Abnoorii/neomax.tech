'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { primaryNav } from '@/content/navigation'
import { ButtonLink } from '@/components/site/ui/Button'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen mobile menu.
 *
 * Implements the dialog pattern by hand rather than via a portal so the panel
 * stays inside the header's stacking context: focus is trapped, Escape closes,
 * body scroll locks, and focus returns to the trigger on close.
 */
export function MobileNavigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname])

  // Scroll lock. Padding compensates for the scrollbar so nothing shifts.
  useEffect(() => {
    if (!open) return
    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [open])

  // Escape to close, Tab cycles within the panel.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    // Move focus into the panel once it is mounted.
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-white transition-colors duration-fast hover:bg-white/10"
      >
        <Menu aria-hidden="true" className="h-6 w-6" />
        <span className="sr-only">Open menu</span>
      </button>

      {open ? (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink neomax-dark"
        >
          <div className="flex h-[72px] shrink-0 items-center justify-end px-edge">
            <button
              type="button"
              onClick={close}
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-white transition-colors duration-fast hover:bg-white/10"
            >
              <X aria-hidden="true" className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-edge pb-10">
            <nav aria-label="Mobile">
              <ul className="divide-y divide-white/10 border-y border-white/10">
                {primaryNav.map(item => (
                  <li key={item.label} className="py-2">
                    <Link
                      href={item.href}
                      className="flex min-h-[44px] items-center text-display-md font-display text-white"
                    >
                      {item.label}
                    </Link>
                    {item.children ? (
                      <ul className="mb-2 mt-1 space-y-1 border-l border-white/15 pl-4">
                        {item.children.map(child => (
                          <li key={child.href + child.label}>
                            <Link
                              href={child.href}
                              className="flex min-h-[44px] items-center text-body-sm text-muted-dark transition-colors duration-fast hover:text-white"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 space-y-3">
              <ButtonLink href="/contact" size="lg" full>
                Book a Free Strategy Call
              </ButtonLink>
              <ButtonLink href="/work" variant="outline-dark" size="lg" full>
                See Our Work
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
