import type { Article } from './types'

export const roasAttribution: Article = {
  slug: 'why-your-roas-is-lying-to-you',
  category: 'Paid Ads',
  title: 'Why Your ROAS Is Lying to You',
  summary:
    'Platform-reported return counts conversions each platform believes it caused. Add them up and you own more revenue than your bank does. Here is where the gap comes from and how to close it.',
  publishedAt: '2026-04-18',
  readingMinutes: 6,
  author: { name: 'NEOMAX Growth Team', role: 'Performance Marketing practice' },
  relatedServices: ['performance-marketing', 'revenue-sales'],
  status: 'draft',
  verificationStatus: 'pending',
  body: [
    {
      type: 'paragraph',
      text: 'Open three ad platforms, add up the revenue each one claims, and compare the total to what actually landed. For most accounts running more than one channel, the platforms collectively claim more revenue than the business earned.',
    },
    {
      type: 'paragraph',
      text: 'Nothing is broken. Each platform is answering a narrower question than the one you are asking: not "what did this channel produce" but "of the conversions I could see, which ones had touched an ad of mine inside my attribution window".',
    },
    {
      type: 'heading',
      id: 'where-the-gap-comes-from',
      text: 'Where the gap comes from',
    },
    {
      type: 'data',
      caption: 'Four independent sources of overstatement, all present in a typical multi-channel account',
      columns: ['Cause', 'What it does', 'Direction'],
      rows: [
        ['Overlapping credit', 'Two platforms both count the same order', 'Overstates'],
        ['View-through windows', 'An impression with no interaction takes credit', 'Overstates'],
        ['Modelled conversions', 'Unobserved conversions are estimated and added', 'Usually overstates'],
        ['Consent and blocking loss', 'Real conversions never reach the platform', 'Understates'],
      ],
    },
    {
      type: 'paragraph',
      text: 'The first three inflate the number and the fourth deflates it, which is why the errors do not cancel out into something usable. They move different channels by different amounts, so the ranking between channels is distorted even when the totals look plausible.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The distortion is not uniform',
      text: 'Channels running heavy view-through attribution absorb credit from channels that do not. Reallocating budget on platform-reported ROAS therefore tends to move spend toward whichever channel counts most generously, not toward whichever produces most.',
    },
    {
      type: 'heading',
      id: 'the-number-that-does-not-lie',
      text: 'The number that does not lie',
    },
    {
      type: 'paragraph',
      text: 'Blended return is unglamorous and much harder to argue with: total revenue over total spend, taken from your own system of record.',
    },
    {
      type: 'code',
      language: 'text',
      caption: 'Blended return on ad spend',
      code: `blendedROAS = totalRevenue / totalAdSpend

Where:
  totalRevenue  comes from your order or CRM system, not an ad platform
  totalAdSpend  includes every paid channel, plus agency and tooling fees
                if you want a figure that reflects true cost`,
    },
    {
      type: 'paragraph',
      text: 'Blended return will not tell you which channel to cut. That is a separate question, and it needs a method that can observe a difference rather than a report that assigns credit.',
    },
    {
      type: 'heading',
      id: 'testing-for-incrementality',
      text: 'Testing what a channel actually adds',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Geo holdout: suspend a channel in a set of comparable regions and measure the revenue difference against matched control regions.',
        'Scheduled pause: turn a channel off for a defined period long enough to clear its conversion lag, then compare against the equivalent prior period.',
        'Spend step change: move budget in deliberate, sizeable steps and watch blended return, rather than editing daily and reading noise as signal.',
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Wait out the lag before reading a test',
      text: 'A pause test read before the conversion lag has cleared will show a decline that is simply delayed reporting. Establish the lag from your own data first, then set the test window to at least twice it.',
    },
    {
      type: 'heading',
      id: 'fix-the-inputs-too',
      text: 'Fix the inputs while you are here',
    },
    {
      type: 'list',
      items: [
        'Deduplicate events between browser and server so one order is not counted twice.',
        'Shorten view-through windows, or exclude view-through from the number used for budget decisions.',
        'Import offline conversions where the real outcome happens after the click, such as a booked meeting or a closed deal.',
        'Reconcile against your order system on a fixed schedule and record the variance rather than explaining it away each time.',
      ],
    },
    {
      type: 'paragraph',
      text: 'The goal is not a perfect number. It is a number stable enough that a change in it means something happened, and consistent enough that two people reading the same dashboard reach the same decision.',
    },
  ],
}
