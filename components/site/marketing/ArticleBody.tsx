import type { Block } from '@/content/articles'
import { Info, AlertTriangle } from 'lucide-react'

/**
 * Renders a typed article body. Headings carry stable ids so the table of
 * contents can link to them, and every block type has one semantic mapping —
 * which is the reason bodies are typed blocks rather than raw HTML.
 */
export function ArticleBody({ body }: { body: Block[] }) {
  return (
    <div className="space-y-6">
      {body.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2
                key={block.id}
                id={block.id}
                className="!mt-14 font-display text-display-md text-balance text-navy first:!mt-0"
              >
                {block.text}
              </h2>
            )

          case 'subheading':
            return (
              <h3 key={`${block.text}-${index}`} className="!mt-10 text-heading text-navy">
                {block.text}
              </h3>
            )

          case 'paragraph':
            return (
              <p key={index} className="max-w-measure text-body-lg text-slate-strong">
                {block.text}
              </p>
            )

          case 'list':
            return block.ordered ? (
              <ol key={index} className="max-w-measure list-decimal space-y-3 pl-6 marker:font-mono marker:text-slate">
                {block.items.map(item => (
                  <li key={item} className="pl-1.5 text-body-lg text-slate-strong">
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={index} className="max-w-measure list-disc space-y-3 pl-6 marker:text-violet-500">
                {block.items.map(item => (
                  <li key={item} className="pl-1.5 text-body-lg text-slate-strong">
                    {item}
                  </li>
                ))}
              </ul>
            )

          case 'callout': {
            const Icon = block.tone === 'warning' ? AlertTriangle : Info
            return (
              <aside
                key={index}
                className={`!my-10 max-w-measure rounded-lg border-l-2 p-6 ${
                  block.tone === 'warning'
                    ? 'border-l-danger-strong bg-danger-strong/[0.04]'
                    : 'border-l-violet-500 bg-violet-500/[0.04]'
                }`}
              >
                <p className="flex items-center gap-2.5 text-subheading text-navy">
                  <Icon
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 ${
                      block.tone === 'warning' ? 'text-danger-strong' : 'text-violet-600'
                    }`}
                  />
                  {block.title}
                </p>
                <p className="mt-2.5 text-body text-slate-strong">{block.text}</p>
              </aside>
            )
          }

          case 'quote':
            return (
              <figure key={index} className="!my-10 max-w-measure border-l-2 border-navy pl-6">
                <blockquote>
                  <p className="font-display text-heading text-navy">{block.text}</p>
                </blockquote>
                {block.attribution ? (
                  <figcaption className="mt-3 text-body-sm text-slate">
                    {block.attribution}
                  </figcaption>
                ) : null}
              </figure>
            )

          case 'code':
            return (
              <figure key={index} className="!my-10">
                <div className="overflow-x-auto rounded-lg border border-white/10 bg-ink p-5">
                  <pre className="text-body-sm leading-relaxed text-white/90">
                    <code className="font-mono">{block.code}</code>
                  </pre>
                </div>
                {block.caption ? (
                  <figcaption className="mt-2.5 text-body-sm text-slate">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            )

          case 'data':
            return (
              <figure key={index} className="!my-10">
                <div className="overflow-x-auto rounded-lg border border-soft-gray">
                  <table className="w-full min-w-[34rem] border-collapse text-left">
                    <caption className="sr-only">{block.caption}</caption>
                    <thead>
                      <tr className="border-b border-soft-gray bg-off-white">
                        {block.columns.map(column => (
                          <th
                            key={column}
                            scope="col"
                            className="px-4 py-3 text-body-sm font-medium text-navy"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map(row => (
                        <tr key={row.join('|')} className="border-b border-soft-gray last:border-b-0">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={`${cell}-${cellIndex}`}
                              className="px-4 py-3 align-top text-body-sm text-slate-strong"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <figcaption className="mt-2.5 text-body-sm text-slate">{block.caption}</figcaption>
              </figure>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
