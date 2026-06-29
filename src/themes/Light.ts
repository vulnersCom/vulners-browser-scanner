import { createTheme } from '@mui/material/styles';
import { lightTokens, SANS } from './tokens';

const Light = createTheme({
  typography: { fontFamily: SANS },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 12 } },
    },
  },
  palette: {
    mode: 'light',
    common: { black: '#000', white: '#fff' },
    primary: { main: lightTokens.accent, contrastText: '#fff' },
    secondary: { main: '#fafafa', dark: '#bdbdbd', contrastText: lightTokens.text },
    default: {
      main: lightTokens.text,
      light: lightTokens.text2,
      dark: lightTokens.header,
      contrastText: '#fff',
    },
    background: { default: lightTokens.bg, paper: lightTokens.surface },
    text: { primary: lightTokens.text, secondary: lightTokens.text2, disabled: lightTokens.text3 },
    divider: lightTokens.line,
    error: { main: lightTokens.exploit },
    success: { main: lightTokens.clean },
  },
  tokens: lightTokens,
});

export default Light;
