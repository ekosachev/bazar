export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function messageMatchesQuery(content: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return content.toLowerCase().includes(normalizedQuery)
}

export function filterMessagesByQuery<T extends { content: string }>(messages: T[], query: string) {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return messages
  }

  return messages.filter((message) => messageMatchesQuery(message.content, normalizedQuery))
}
