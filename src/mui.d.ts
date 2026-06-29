/* Module augmentation: the app themes define a custom `default` palette color
   (used as `theme.palette.default.main`). Teach Material-UI's types about it. */
import '@material-ui/core/styles/createPalette';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    default: Palette['primary'];
  }
  interface PaletteOptions {
    default?: PaletteOptions['primary'];
  }
}
