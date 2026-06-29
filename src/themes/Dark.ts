import { createTheme } from '@mui/material/styles';
import { darkTokens, SANS } from './tokens';

const Dark = createTheme({
  typography: { fontFamily: SANS },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 12 } },
    },
  },
  palette: {
    mode: 'dark',
    common: { black: '#000', white: '#fff' },
    primary: { main: darkTokens.accent, contrastText: '#fff' },
    secondary: { main: '#fafafa', dark: '#bdbdbd', contrastText: darkTokens.text },
    default: {
      main: darkTokens.text,
      light: darkTokens.text2,
      dark: darkTokens.header,
      contrastText: '#fff',
    },
    background: { default: darkTokens.bg, paper: darkTokens.surface },
    text: { primary: darkTokens.text, secondary: darkTokens.text2, disabled: darkTokens.text3 },
    divider: darkTokens.line,
    error: { main: darkTokens.exploit },
    success: { main: darkTokens.clean },
  },
  tokens: darkTokens,
});

export default Dark;
