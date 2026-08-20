import type { Article } from './types'

export const aovFunnel: Article = {
  slug: 'anatomy-of-a-5x-aov-shopify-funnel',
  category: 'E-commerce',
  title: 'Anatomy of a 5x AOV Shopify Funnel',
  summary:
    'Average order value is the only growth lever that does not cost more to pull. A structural teardown of where basket value is actually created — and where it quietly leaks back out.',
  publishedAt: '2026-04-12',
  readingMinutes: 11,
  author: { name: 'NEOMAX Growth Team', role: 'E-commerce Growth practice' },
  relatedServices: ['ecommerce-growth'],
  status: 'draft',
  verificationStatus: 'pending',
  body: [
    {
      type: 'paragraph',
      text: 'Of the three ways to grow e-commerce revenue, two get more expensive as you push them. More traffic costs more per visit as you exhaust the cheapest audiences. Higher conversion rate runs into a ceiling set by how many visitors were ever going to buy. Average order value has neither property: it is the only lever where an improvement is close to pure margin.',
    },
    {
      type: 'paragraph',
      text: 'It is also the one most often approached backwards, by bolting an upsell app onto a checkout that was already leaking.',
    },
    {
      type: 'heading',
      id: 'where-basket-value-is-created',
      text: 'Basket value is created before the cart',
    },
    {
      type: 'paragraph',
      text: 'By the time a customer reaches the cart, the size of their order is largely decided. The decisions that set it happen on the product page, and mostly in the first screen.',
    },
    {
      type: 'data',
      caption: 'Where order value is decided, and what actually moves it at each step',
      columns: ['Step', 'Decision being made', 'What moves it'],
      rows: [
        ['Collection', 'Which tier am I shopping in', 'Anchoring: show the premium option first'],
        ['Product page', 'Which variant, how many', 'Quantity framing and variant defaults'],
        ['Add to cart', 'What goes with this', 'Complementary, not larger, suggestions'],
        ['Cart', 'Do I qualify for anything', 'Threshold progress made visible'],
        ['Checkout', 'Is this still worth it', 'No new costs revealed here'],
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Anchoring is set by the first price seen',
      text: 'A collection page sorted cheapest-first anchors the whole session low. Sorting to lead with a premium option changes what the mid-tier product feels like it costs, without changing any price.',
    },
    {
      type: 'heading',
      id: 'bundles-that-work',
      text: 'Bundles that raise value, and bundles that discount it away',
    },
    {
      type: 'paragraph',
      text: 'A bundle works when it removes a decision the customer did not want to make. It fails when it is simply a discount applied to things they were going to buy anyway.',
    },
    {
      type: 'list',
      items: [
        'Bundle complements, not substitutes. Two variants of the same product compete; a product and its consumable do not.',
        'Price the bundle against the convenience, not against the largest discount you can afford.',
        'Make the saving explicit in currency, not only as a percentage.',
        'Never let the bundle be cheaper per unit than your subscription option, or you have taught customers to avoid the subscription.',
      ],
    },
    {
      type: 'heading',
      id: 'the-threshold',
      text: 'The free-shipping threshold is a pricing decision',
    },
    {
      type: 'paragraph',
      text: 'Set the threshold from your basket distribution, not from a round number. The useful position sits just above where the bulk of orders already land — close enough that reaching it feels achievable, far enough that reaching it means adding something.',
    },
    {
      type: 'code',
      language: 'text',
      caption: 'A defensible starting point for a shipping threshold',
      code: `threshold ≈ median order value × 1.25

Then verify against margin:
  incrementalMargin = (addedItemValue × grossMargin) - shippingCost

If incrementalMargin is negative at the threshold you have set,
the threshold is buying revenue at a loss.`,
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A progress indicator is not decoration',
      text: 'A threshold the customer cannot see their distance from does almost nothing. The behaviour comes from the visible gap, not from the offer existing somewhere in the footer.',
    },
    {
      type: 'heading',
      id: 'where-it-leaks',
      text: 'Where the gains leak back out',
    },
    {
      type: 'paragraph',
      text: 'Most order-value programmes show a gain in the cart and give it back at checkout. The leaks are consistent and worth auditing before adding anything new.',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Costs revealed late. Any charge first seen at checkout re-opens a decision the customer had already closed.',
        'Upsells shown after payment intent. Interrupting a committed buyer costs completed orders more often than it adds revenue.',
        'Mobile drawers that hide the total. If the running total is not visible on a small screen, threshold mechanics stop working entirely.',
        'Discount fields that invite a detour. A prominent empty code field sends customers off-site to look for one, and many do not come back.',
      ],
    },
    {
      type: 'heading',
      id: 'sequencing',
      text: 'The order to work in',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Instrument the funnel and quantify value lost per step, so the work is ranked rather than guessed.',
        'Fix checkout leaks first. There is no point raising basket value into a step that drops it.',
        'Set the threshold from your own basket distribution and make progress visible.',
        'Add complementary bundling at the product page, where the decision is actually made.',
        'Only then consider post-purchase offers, which should never interrupt the original order.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Worked in that sequence, order value tends to move without a discount and without additional acquisition spend. Worked in the reverse order, it usually produces a busier checkout and roughly the same revenue.',
    },
  ],
}
