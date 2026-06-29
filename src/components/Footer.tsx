import type { FC } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { useSettingsStore, THEMES } from '../stores/Settings';
import Logo from '../img/logo.svg';

const Footer: FC = () => {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === THEMES.DARK;

  return (
    <Box
      component="footer"
      sx={{
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: '14px',
        backgroundColor: isDark ? '#0c0c0e' : '#18181a',
        borderTop: isDark ? (t) => `1px solid ${t.tokens.line}` : 'none',
      }}
    >
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href="https://vulners.com?utm_source=scanner&utm_medium=chromePlugin&utm_campaign=scan"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Box
          component="img"
          src={Logo}
          alt="Vulners"
          sx={{ height: 22, filter: 'brightness(2.2)' }}
        />
      </Link>
      <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>
        &copy; {new Date().getUTCFullYear()} vulners.com
      </Typography>
    </Box>
  );
};

export default Footer;
