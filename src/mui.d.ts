/* MUI module augmentation: the custom `default` palette color plus the
   redesign's `theme.tokens` design-token bag (see src/themes/tokens.ts). */
import '@mui/material/styles';
import type { DesignTokens } from './themes/tokens';

declare module '@mui/material/styles' {
  interface Palette {
    default: Palette['primary'];
  }
  interface PaletteOptions {
    default?: PaletteOptions['primary'];
  }
  interface Theme {
    tokens: DesignTokens;
  }
  interface ThemeOptions {
    tokens?: DesignTokens;
  }
}
