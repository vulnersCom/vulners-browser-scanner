/**
 * Design tokens for the redesign (see design_handoff_vulners_redesign/README.md).
 * Light/dark surface systems, semantic colors, and the severity-band scale.
 * Exposed on the MUI theme as `theme.tokens` (see src/mui.d.ts).
 */

export const MONO = '"IBM Plex Mono", ui-monospace, monospace';
export const SANS = '"IBM Plex Sans", sans-serif';

export interface DesignTokens {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  text: string;
  text2: string;
  text3: string;
  header: string;
  headerText: string;
  accent: string;
  /** semantic */
  exploit: string;
  clean: string;
  /** severity-chip tint/border mix percentages over the surface */
  chipTint: number;
  chipBorder: number;
  /** elevated card shadow */
  shadow: string;
}

export const lightTokens: DesignTokens = {
  bg: '#ffffff',
  surface: '#ffffff',
  surface2: '#f5f5f6',
  line: '#ececed',
  text: '#1a1a1c',
  text2: '#6c6c72',
  text3: '#a2a2a8',
  header: '#0a0a0b',
  headerText: '#fafafa',
  accent: '#ff6600',
  exploit: '#e5484d',
  clean: '#2ea043',
  chipTint: 14,
  chipBorder: 32,
  shadow: '0 1px 2px rgba(10,10,20,.05), 0 12px 32px rgba(20,20,30,.10)',
};

export const darkTokens: DesignTokens = {
  bg: '#161719',
  surface: '#1e1f22',
  surface2: '#25262a',
  line: '#313238',
  text: '#f1f1f3',
  text2: '#a1a2a9',
  text3: '#6e6f76',
  header: '#0c0c0e',
  headerText: '#f3f3f5',
  accent: '#ff6600',
  exploit: '#ff7a7e',
  clean: '#4ade80',
  chipTint: 22,
  chipBorder: 42,
  shadow: '0 1px 2px rgba(0,0,0,.4), 0 16px 40px rgba(0,0,0,.55)',
};

export interface SeverityBand {
  label: string;
  color: string;
}

/** Fold a 0-10 CVSS score into one of four accessible severity bands. */
export function severityBand(score: number): SeverityBand {
  if (score >= 9) return { label: 'Critical', color: '#e5484d' };
  if (score >= 7) return { label: 'High', color: '#f5750b' };
  if (score >= 4) return { label: 'Medium', color: '#dca000' };
  return { label: 'Low', color: '#2ea043' };
}

/** CSS `color-mix` over a surface (Chrome-only extension, so this is safe). */
export const mix = (color: string, pct: number, over: string): string =>
  `color-mix(in srgb, ${color} ${pct}%, ${over})`;
