import type { FC } from 'react';
import { ArrowBack, Settings as SettingsIcon } from '@mui/icons-material';
import { Box, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../img/icon.svg';
import { MONO } from '../themes/tokens';
import { useDataStore } from '../stores/Data';
import { useSettingsStore } from '../stores/Settings';

interface StatProps {
  label: string;
  value: number | string;
  color: string;
}

const Stat: FC<StatProps> = ({ label, value, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
    <Typography
      component="span"
      sx={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, lineHeight: 1, color }}
    >
      {value}
    </Typography>
    <Typography
      component="span"
      sx={{ fontSize: 11, lineHeight: 1, color: 'rgba(255,255,255,.6)' }}
    >
      {label}
    </Typography>
  </Box>
);

const Header: FC = () => {
  const { tokens } = useTheme();

  const stat = useDataStore((s) => s.stat);
  const loaded = useDataStore((s) => s.loaded);
  const open = useSettingsStore((s) => s.open);
  const openSettings = useSettingsStore((s) => s.openSettings);
  const closeSettings = useSettingsStore((s) => s.closeSettings);
  const navigate = useNavigate();
  const location = useLocation();

  const isAbout = location.pathname === '/about';

  return (
    <Box
      sx={{
        height: 54,
        flex: '0 0 auto',
        background: tokens.header,
        color: tokens.headerText,
        display: 'flex',
        alignItems: 'center',
        gap: '13px',
        px: '14px',
      }}
    >
      {isAbout ? (
        <IconButton
          onClick={() => navigate('/')}
          sx={{ ml: '-8px', color: tokens.headerText }}
          aria-label="Back"
        >
          <ArrowBack />
        </IconButton>
      ) : (
        <Link
          href="https://vulners.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'inline-flex', flex: '0 0 auto' }}
        >
          <Box
            component="img"
            src={Icon}
            alt="Vulners"
            sx={{ width: 23, height: 25, display: 'block' }}
          />
        </Link>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Tooltip title="Number of websites where vulnerabilities were found">
          <span>
            <Stat
              label="Vulnerable"
              value={loaded ? stat.vulnerable || 0 : '—'}
              color={tokens.accent}
            />
          </span>
        </Tooltip>
        <Box sx={{ width: '1px', height: 15, background: 'rgba(255,255,255,.16)' }} />
        <Tooltip title="Number of websites the extension has ever scanned">
          <span>
            <Stat label="Scanned" value={stat.scanned || 0} color={tokens.headerText} />
          </span>
        </Tooltip>
      </Box>

      <IconButton
        onClick={() => (!open ? openSettings() : closeSettings())}
        aria-label="Settings"
        sx={{
          ml: 'auto',
          width: 32,
          height: 32,
          borderRadius: '8px',
          color: tokens.headerText,
        }}
      >
        <SettingsIcon sx={{ fontSize: 19 }} />
      </IconButton>
    </Box>
  );
};

export default Header;
