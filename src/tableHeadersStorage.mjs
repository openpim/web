export function serializeTableHeaders (headers) {
  return JSON.stringify((headers || []).map(({ filter, filterType, ...header }) => header))
}
