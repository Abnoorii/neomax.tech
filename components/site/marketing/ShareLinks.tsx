'use client'

import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { site } from '@/content/site'

/**
 * Social sharing. Only channels with a real, parameterised share URL are
 * offered, plus copy-link, which works everywhere and needs no third party.
 */
export function ShareLinks({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false)
  const url = new URL(path, site.url).toString()

  const targets = [
    { label: 'X', href: `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked by permissions; the visible URL is the fallback.
      setCopied(false)
    }
  }

  return (
    <div>
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">Share</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {targets.map(target => (
          <li key={target.label}>
            <a
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center rounded-sm border border-soft-gray px-3 text-body-sm text-slate-strong transition-colors duration-fast hover:border-navy hover:text-navy"
            >
              {target.label}
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-sm border border-soft-gray px-3 text-body-sm text-slate-strong transition-colors duration-fast hover:border-navy hover:text-navy"
          >
            {copied ? (
              <Check aria-hidden="true" className="h-3.5 w-3.5 text-success-strong" />
            ) : (
              <Link2 aria-hidden="true" className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </li>
      </ul>
      <p aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </p>
    </div>
  )
}
