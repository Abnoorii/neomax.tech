import type { Article } from './types'

export const seoPlaybook: Article = {
  slug: 'the-2026-seo-playbook-for-ai-first-search',
  category: 'SEO',
  title: 'The 2026 SEO Playbook for AI-First Search',
  summary:
    'Generated answers now sit between your page and the person who needed it. What that changes about measurement, page structure, and the pages worth writing at all.',
  publishedAt: '2026-04-22',
  updatedAt: '2026-06-10',
  readingMinutes: 8,
  author: { name: 'NEOMAX Growth Team', role: 'Performance Marketing practice' },
  relatedServices: ['performance-marketing'],
  status: 'draft',
  verificationStatus: 'pending',
  body: [
    {
      type: 'paragraph',
      text: 'Organic search did not stop working. What changed is where the answer gets assembled. A generated summary increasingly resolves the question on the results page, and the click that used to follow now happens only when the reader needs something the summary could not give them.',
    },
    {
      type: 'paragraph',
      text: 'That single shift breaks a lot of reporting. It also makes a specific kind of page more valuable than it has been in years. Both effects are worth planning for deliberately rather than reacting to.',
    },
    {
      type: 'heading',
      id: 'measurement-breaks-first',
      text: 'Measurement breaks before traffic does',
    },
    {
      type: 'paragraph',
      text: 'The first symptom is not a traffic drop. It is a widening gap between impressions and clicks on informational queries, while conversions hold roughly steady. If you read that as a ranking problem you will rewrite pages that were never the issue.',
    },
    {
      type: 'paragraph',
      text: 'Split your query set before drawing any conclusion. Informational and commercial-intent queries are now on genuinely different trajectories, and a blended organic number averages them into something that describes neither.',
    },
    {
      type: 'data',
      caption: 'Segment organic reporting by intent before diagnosing a decline',
      columns: ['Segment', 'What to watch', 'What a decline usually means'],
      rows: [
        ['Informational', 'Impressions vs. clicks', 'Answer resolved before the click; not necessarily a ranking loss'],
        ['Commercial', 'Clicks and assisted conversions', 'A real competitive or relevance problem worth fixing'],
        ['Branded', 'Click share', 'A brand-demand issue, not an SEO one'],
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not average intents together',
      text: 'A blended organic figure hides the only distinction that currently matters. Informational click-through can fall while commercial performance is flat or rising, and the blended line will show a decline that no page-level fix will address.',
    },
    {
      type: 'heading',
      id: 'structure-for-extraction',
      text: 'Structure pages so they can be extracted',
    },
    {
      type: 'paragraph',
      text: 'If a system is going to summarise your page, the page should be easy to summarise correctly. This is less about a new markup trick than about the discipline good technical writing already asks for.',
    },
    {
      type: 'list',
      items: [
        'Answer the question in the first paragraph under the heading that asks it, not four scrolls down.',
        'Use headings that state a claim rather than a topic. "Server-side tracking reduces event loss" beats "Tracking".',
        'Keep one idea per section, so an extracted passage is not missing the qualifier that made it true.',
        'Put figures in real tables. A number inside a sentence inside a paragraph travels badly.',
        'State the conditions under which your claim holds. Summaries strip hedges; explicit conditions survive better than implied ones.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Structured data still helps, but it is a description of the page, not a substitute for one. Mark up what is genuinely on the page and nothing else.',
    },
    {
      type: 'code',
      language: 'json',
      caption: 'FAQ schema should only describe questions the page visibly answers',
      code: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Does server-side tracking change reported conversions?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Usually yes. Deduplicated server-side events typically report fewer, more accurate conversions than browser-only tracking."
    }
  }]
}`,
    },
    {
      type: 'heading',
      id: 'pages-worth-writing',
      text: 'The pages that are worth more now',
    },
    {
      type: 'paragraph',
      text: 'Anything a generated answer can fully satisfy has lost most of its commercial value. What it cannot satisfy is a page grounded in something only you have: your own data, your own methodology, or a decision framework built from work you actually did.',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Original measurement. Numbers from your own engagements cannot be synthesised from public sources.',
        'Methodology. How you decide, in enough detail that a reader could apply it, is not a definition anyone can look up.',
        'Comparison under constraints. "Which of these fits a team with two people and no engineering support" is judgement, not retrieval.',
        'Documentation of failure. What did not work, and why, is almost never published and is disproportionately useful.',
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The practical test',
      text: 'Before commissioning a piece, ask whether a competent generated answer would make it redundant. If it would, the brief is wrong — not the channel.',
    },
    {
      type: 'heading',
      id: 'what-to-do-this-quarter',
      text: 'What to change this quarter',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Split organic reporting by intent, and set separate expectations for each segment.',
        'Audit your top informational pages for whether they carry anything proprietary. Consolidate the ones that do not.',
        'Restructure your highest-value commercial pages so the claim appears directly under the heading that asks for it.',
        'Stop treating total organic sessions as the headline metric. Report assisted conversions from organic alongside it.',
      ],
    },
    {
      type: 'paragraph',
      text: 'None of this is a defensive posture. The pages that survive this shift are the ones that were always the most useful — the change is that thin content no longer gets a click it did not earn.',
    },
  ],
}
