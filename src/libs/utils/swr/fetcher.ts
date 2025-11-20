/**
 * Fetcher function for SWR
 * Default GET request
 * @param url
 * @returns
 */
export async function globalFetcher(key: string | [string, ...any[]]) {
  // Get first element as url
  const url = Array.isArray(key) ? key[0] : key;

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }
  return res.json();
}
