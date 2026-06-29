import { matchesHostSearch } from '../src/search';
import type { HostData } from '../src/types';

const host: HostData = {
  name: 'example.com',
  vulnerable: true,
  software: {
    nginx: { software: 'nginx', version: '1.24.0', vulnerabilities: [] },
    React: { software: 'React', version: '19.0.0', vulnerabilities: [] },
  },
};

describe('matchesHostSearch', () => {
  it('matches host and software names case-insensitively', () => {
    expect(matchesHostSearch(host, 'EXAMPLE')).toBe(true);
    expect(matchesHostSearch(host, 'react')).toBe(true);
  });

  it('treats user input as literal text, not a regular expression', () => {
    expect(() => matchesHostSearch(host, '[')).not.toThrow();
    expect(matchesHostSearch(host, '[')).toBe(false);
  });
});
