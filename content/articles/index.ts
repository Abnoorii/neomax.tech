import type { Article } from './types'
import { seoPlaybook } from './seo-playbook-2026'
import { roasAttribution } from './why-your-roas-is-lying'
import { aovFunnel } from './anatomy-of-a-5x-aov-shopify-funnel'

export * from './types'

export const articles: Article[] = [seoPlaybook, roasAttribution, aovFunnel]

export function getArticle(slug: string): Article | undefined {
  return articles.find(article => article.slug === slug)
}

export const articleCategories = Array.from(
  new Set(articles.map(article => article.category)),
).sort()

export function relatedArticles(slug: string, limit = 2): Article[] {
  const current = getArticle(slug)
  if (!current) return articles.slice(0, limit)
  const sameCategory = articles.filter(a => a.slug !== slug && a.category === current.category)
  const rest = articles.filter(a => a.slug !== slug && a.category !== current.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
}
