import type { Thing } from '@/lib/structured-data';

/**
 * One `<script type="application/ld+json">`.
 *
 * The escaping is not decoration. Provider names, addresses and notes come out
 * of the database, and a value containing `</script>` would otherwise close
 * this element early and let the rest of the string be parsed as markup. Only
 * `<` needs escaping to prevent it, and `<` is valid inside a JSON string,
 * so the document a crawler parses is unchanged.
 *
 * Rendered inside the page body rather than the head: JSON-LD is valid in
 * either, and the body is where a server component can put it without the
 * metadata API having to carry arbitrary objects.
 */
export function JsonLd({ data }: { data: Thing }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
