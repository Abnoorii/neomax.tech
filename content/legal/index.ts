export type LegalSection = { heading: string; paragraphs: string[]; list?: string[] }

export type LegalDocument = {
  slug: 'privacy' | 'terms'
  title: string
  /** ISO date. Update when the document text changes. */
  updatedAt: string
  intro: string
  sections: LegalSection[]
}

/**
 * Template legal copy.
 *
 * These documents are structurally complete but are NOT legal advice and have
 * not been reviewed by counsel. Company-specific details (registered entity,
 * address, supervisory authority, processor list) are marked inline and must be
 * completed before publication.
 */
export const legalReviewNotice =
  'This document is a template and has not been reviewed by legal counsel. Company-specific details must be completed and the text reviewed before publication.'

export const privacy: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  updatedAt: '2026-08-20',
  intro:
    'This policy explains what personal data NEOMAX collects through this website, why we collect it, and the choices available to you.',
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        'NEOMAX Technologies operates this website. The registered entity name, incorporation number, and registered address must be completed here before this policy is published.',
      ],
    },
    {
      heading: 'What we collect',
      paragraphs: ['We collect two categories of data through this website.'],
      list: [
        'Information you submit directly: the name, work email, company, website, country, budget range, revenue range, growth challenge, contact preference, and message you enter into our contact form.',
        'Technical information collected automatically: IP address, browser type, referring page, and pages viewed, used to keep the site secure and to understand aggregate usage.',
      ],
    },
    {
      heading: 'Why we use it',
      paragraphs: [
        'Enquiry data is used solely to respond to your enquiry, prepare for a strategy call, and maintain a record of our correspondence. Technical data is used for security, fraud prevention, and aggregate analytics.',
        'We do not sell personal data, and we do not use enquiry data for unrelated marketing without a separate opt-in.',
      ],
    },
    {
      heading: 'Legal basis',
      paragraphs: [
        'Where the GDPR or a comparable framework applies, we rely on your consent for enquiry submissions and on legitimate interests for site security and aggregate analytics. You may withdraw consent at any time.',
      ],
    },
    {
      heading: 'How long we keep it',
      paragraphs: [
        'Enquiry records are retained for as long as needed to respond and for a reasonable period afterwards for business record-keeping. The specific retention period must be confirmed and stated here before publication.',
      ],
    },
    {
      heading: 'Sharing and processors',
      paragraphs: [
        'We share personal data only with service providers who process it on our behalf, such as hosting, email delivery, and CRM providers. The complete list of processors and their locations must be completed here before publication.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: ['Depending on where you live, you may have the right to:'],
      list: [
        'Request a copy of the personal data we hold about you.',
        'Ask us to correct inaccurate data.',
        'Ask us to delete data we no longer need.',
        'Object to or restrict certain processing.',
        'Lodge a complaint with your local supervisory authority.',
      ],
    },
    {
      heading: 'Cookies and analytics',
      paragraphs: [
        'This site sets only the cookies required for it to function. If a privacy-respecting analytics provider is enabled, it is configured without cross-site tracking, and any provider requiring consent is loaded only after consent is given.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        'Privacy questions and rights requests can be sent to the contact address published on our contact page.',
      ],
    },
  ],
}

export const terms: LegalDocument = {
  slug: 'terms',
  title: 'Terms of Use',
  updatedAt: '2026-08-20',
  intro:
    'These terms govern your use of the NEOMAX website. They do not govern any engagement between NEOMAX and a client, which is covered by a separate signed agreement.',
  sections: [
    {
      heading: 'Using this site',
      paragraphs: [
        'You may use this website for lawful purposes only. You may not attempt to gain unauthorised access to any part of the site, interfere with its operation, or use automated means to extract content at a scale that degrades service for others.',
      ],
    },
    {
      heading: 'Information on this site',
      paragraphs: [
        'Content is provided for general information. Case studies, performance figures, and testimonials describe particular engagements under particular conditions and are not a prediction or guarantee of results in any other engagement.',
        'Any figures identified on this site as illustrative are exactly that, and must not be relied on as a statement of past performance.',
      ],
    },
    {
      heading: 'The ROI calculator',
      paragraphs: [
        'The calculator is a modelling tool. It performs arithmetic on figures you enter and makes no assessment of your business. Its output is not a forecast, a projection of NEOMAX performance, or a guarantee of any result.',
      ],
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        'The content, design, and code of this website belong to NEOMAX or its licensors. You may not reproduce or redistribute substantial parts of it without written permission.',
      ],
    },
    {
      heading: 'Third-party links',
      paragraphs: [
        'Where we link to third-party sites, we do so for convenience. We do not control those sites and are not responsible for their content or their privacy practices.',
      ],
    },
    {
      heading: 'Limitation of liability',
      paragraphs: [
        'To the fullest extent permitted by law, NEOMAX is not liable for indirect or consequential loss arising from use of this website. Nothing in these terms limits liability that cannot lawfully be limited. The governing law and jurisdiction must be completed here before publication.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'We may update these terms. The date at the top of this page shows when it was last changed.',
      ],
    },
  ],
}

export const legalDocuments = { privacy, terms }
