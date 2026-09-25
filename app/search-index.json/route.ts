import { getSearchDocuments } from "@/lib/glossary";

export const dynamic = "force-static";

/** Static search index consumed by the client-side search engine. */
export function GET() {
  return Response.json(getSearchDocuments());
}
