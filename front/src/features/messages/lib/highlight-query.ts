import { escapeRegExp } from '@/features/messages/lib/search-query'

export function highlightQuery(text: string, query: string) {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return [{ text, highlight: false }]
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'gi'))

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlight: part.toLowerCase() === normalizedQuery.toLowerCase(),
    }))
}
