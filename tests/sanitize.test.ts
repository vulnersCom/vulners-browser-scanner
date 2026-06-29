import { safeColor, clampLength, urlSegment } from '../src/sanitize';

describe('safeColor', () => {
  it('passes valid hex colors through', () => {
    expect(safeColor('#fff')).toBe('#fff');
    expect(safeColor('#00c400')).toBe('#00c400');
  });

  it('rejects non-hex / injected values', () => {
    expect(safeColor('red; background: url(javascript:alert(1))')).toBe('inherit');
    expect(safeColor('rgb(0,0,0)')).toBe('inherit');
    expect(safeColor(undefined)).toBe('inherit');
    expect(safeColor('')).toBe('inherit');
  });

  it('uses the provided fallback', () => {
    expect(safeColor('nope', '#000')).toBe('#000');
  });
});

describe('clampLength', () => {
  it('truncates over-long strings', () => {
    expect(clampLength('a'.repeat(100), 10)).toHaveLength(10);
  });

  it('leaves short strings untouched', () => {
    expect(clampLength('1.2.3', 64)).toBe('1.2.3');
  });
});

describe('urlSegment', () => {
  it('encodes path-breaking characters', () => {
    expect(urlSegment('../../etc/passwd')).toBe('..%2F..%2Fetc%2Fpasswd');
    expect(urlSegment('a b/c?d#e')).toBe('a%20b%2Fc%3Fd%23e');
  });
});
