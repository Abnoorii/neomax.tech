import type { LegalDocument as LegalDocumentType } from '@/content/legal'
import { legalReviewNotice } from '@/content/legal'
import { UnverifiedNotice } from '@/components/site/ui/UnverifiedNotice'

export function LegalDocumentBody({ document }: { document: LegalDocumentType }) {
  return (
    <div className="max-w-measure">
      <UnverifiedNotice className="mb-10">{legalReviewNotice}</UnverifiedNotice>

      <p className="text-body-lg text-slate-strong">{document.intro}</p>

      <div className="mt-12 space-y-10">
        {document.sections.map(section => (
          <section key={section.heading}>
            <h2 className="font-display text-heading text-navy">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map(paragraph => (
                <p key={paragraph.slice(0, 40)} className="text-body text-slate-strong">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.list ? (
              <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-violet-500">
                {section.list.map(item => (
                  <li key={item} className="pl-1 text-body text-slate-strong">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  )
}
