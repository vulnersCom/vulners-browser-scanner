import type { HostData } from './types';

export function matchesHostSearch(domain: HostData, searchValue: string): boolean {
  const needle = searchValue.trim().toLocaleLowerCase();
  if (!needle) return true;

  const haystack = `${domain.name} ${Object.keys(domain.software).join(' ')}`.toLocaleLowerCase();
  return haystack.includes(needle);
}
