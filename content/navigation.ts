export type NavLink = {
  label: string
  href: string
  description?: string
}

export type NavItem = NavLink & {
  children?: NavLink[]
}

export const primaryNav: NavItem[] = [
  {
    label: 'Services',
    href: '/services',
    children: [
      {
        label: 'Performance Marketing',
        href: '/services/performance-marketing',
        description: 'SEO, paid search, paid social, email, and creative testing built around ROI.',
      },
      {
        label: 'Revenue & Sales',
        href: '/services/revenue-sales',
        description: 'CRM, funnels, outbound, and SDR systems that turn demand into pipeline.',
      },
      {
        label: 'E-commerce Growth',
        href: '/services/ecommerce-growth',
        description: 'Storefront, product page, and checkout optimization for Shopify and Woo.',
      },
      {
        label: 'All services',
        href: '/services',
        description: 'How the three practices combine into one growth engine.',
      },
    ],
  },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
  { label: 'Pricing', href: '/#pricing' },
]

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Services',
    links: [
      { label: 'Performance Marketing', href: '/services/performance-marketing' },
      { label: 'Revenue & Sales', href: '/services/revenue-sales' },
      { label: 'E-commerce Growth', href: '/services/ecommerce-growth' },
      { label: 'All services', href: '/services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Work', href: '/work' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Insights',
    links: [
      { label: 'All insights', href: '/insights' },
      { label: 'SEO', href: '/insights?category=SEO' },
      { label: 'Paid Ads', href: '/insights?category=Paid+Ads' },
      { label: 'E-commerce', href: '/insights?category=E-commerce' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]
