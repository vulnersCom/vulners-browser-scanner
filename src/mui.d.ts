/* Module augmentation: the app themes define a custom `default` palette color
   (used as `theme.palette.default.main`). Teach Material-UI's types about it. */
import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    default: Palette['primary'];
  }
  interface PaletteOptions {
    default?: PaletteOptions['primary'];
  }
}
