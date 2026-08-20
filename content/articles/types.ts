import type { VerificationStatus } from '../verification'
import type { ServiceSlug } from '../services'

/**
 * Structured content layer for insights.
 *
 * Bodies are authored as typed blocks rather than raw HTML so the renderer can
 * guarantee semantic headings, generate a table of contents, and keep callouts
 * and data tables accessible.
 */
export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; id: string; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; tone: 'note' | 'warning'; title: string; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'code'; language: string; code: string; caption?: string }
  | {
      type: 'data'
      caption: string
      columns: string[]
      rows: string[][]
    }

export type Article = {
  slug: string
  category: 'SEO' | 'Paid Ads' | 'E-commerce'
  title: string
  summary: string
  /** ISO date strings. */
  publishedAt: string
  updatedAt?: string
  readingMinutes: number
  /** Attributed to the practice, not to an invented individual. */
  author: { name: string; role: string }
  relatedServices: ServiceSlug[]
  /**
   * Editorial state. `draft` renders a visible draft notice and is excluded
   * from the sitemap; only `published` articles are treated as final.
   */
  status: 'draft' | 'published'
  verificationStatus: VerificationStatus
  body: Block[]
}

export function articleHeadings(article: Article) {
  return article.body.filter(
    (block): block is Extract<Block, { type: 'heading' }> => block.type === 'heading',
  )
}
