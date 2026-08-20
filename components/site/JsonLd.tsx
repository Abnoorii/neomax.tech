/**
 * Renders a JSON-LD block. Lives in its own component so `lib/site/seo.ts`
 * stays a plain module of schema builders with no JSX.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[]
}) {
  return (
    <script
      type="application/ld+json"
      // Schema content is authored in this repo, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
