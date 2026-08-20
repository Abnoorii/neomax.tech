import Link from 'next/link'
import { Mail } from 'lucide-react'
import { footerNav } from '@/content/navigation'
import { site } from '@/content/site'
import { isVerified } from '@/content/verification'
import { Container } from './Container'
import { Wordmark } from './Wordmark'

export function Footer() {
  const year = new Date().getFullYear()
  const showIncorporation = isVerified(site.incorporation)

  return (
    <footer className="bg-ink text-white neomax-dark">
      <Container className="py-section-sm">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark className="min-h-[44px] text-white" />
            <p className="mt-5 max-w-measure-sm text-body-sm text-muted-dark">
              {site.shortDescription}
            </p>

            {site.contact.email.configured ? (
              <a
                href={`mailto:${site.contact.email.value}`}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-body-sm text-white transition-colors duration-fast hover:text-lime"
              >
                <Mail aria-hidden="true" className="h-4 w-4" />
                {site.contact.email.value}
              </a>
            ) : (
              <Link
                href="/contact"
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-body-sm text-white transition-colors duration-fast hover:text-lime"
              >
                <Mail aria-hidden="true" className="h-4 w-4" />
                Contact us
              </Link>
            )}
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {footerNav.map(group => (
              <div key={group.title}>
                <h2 className="font-mono text-label uppercase text-muted-dark">{group.title}</h2>
                <ul className="mt-4 space-y-1">
                  {group.links.map(link => (
                    <li key={group.title + link.href + link.label}>
                      <Link
                        href={link.href}
                        className="flex min-h-[36px] items-center text-body-sm text-white/75 transition-colors duration-fast hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-sm text-muted-dark">
            © {year} {site.legalName}.
            {/* Incorporation is a legal statement — printed only once verified. */}
            {showIncorporation ? ` ${site.incorporation.statement}.` : ''} All rights reserved.
          </p>

          {/* Social links render only when real profile URLs have been supplied. */}
          {site.social.length > 0 ? (
            <ul className="flex items-center gap-4">
              {site.social.map(profile => (
                <li key={profile.url}>
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm text-muted-dark transition-colors duration-fast hover:text-white"
                  >
                    {profile.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </footer>
  )
}
