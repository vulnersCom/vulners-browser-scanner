import type { FC, ReactNode } from 'react';
import { Box, Switch, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import {
  ChevronRight,
  DeleteOutlined,
  DarkModeOutlined,
  HelpOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import { MONO } from '../themes/tokens';
import { useDataStore } from '../stores/Data';
import { useSettingsStore, THEMES } from '../stores/Settings';

/** Custom toggle: 42×24 track, 18px knob; accent track on, line track off. */
const TokenSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 3,
    transitionDuration: '150ms',
    '&.Mui-checked': {
      transform: 'translateX(18px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.tokens.accent,
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 18,
    height: 18,
    boxShadow: '0 1px 2px rgba(0,0,0,.25)',
    color: '#fff',
  },
  '& .MuiSwitch-track': {
    borderRadius: 12,
    backgroundColor: theme.tokens.line,
    opacity: 1,
    transition: theme.transitions.create(['background-color'], { duration: 150 }),
  },
}));

const SectionLabel: FC<{ children: ReactNode }> = ({ children }) => (
  <Typography
    component="div"
    sx={{
      fontFamily: MONO,
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: '.6px',
      textTransform: 'uppercase',
      color: (t) => t.tokens.text3,
      mx: '2px',
      mb: 1,
    }}
  >
    {children}
  </Typography>
);

const Card: FC<{ children: ReactNode }> = ({ children }) => (
  <Box
    sx={{
      border: (t) => `1px solid ${t.tokens.line}`,
      borderRadius: '12px',
      backgroundColor: (t) => t.tokens.surface,
      overflow: 'hidden',
    }}
  >
    {children}
  </Box>
);

const RowDivider: FC = () => (
  <Box sx={{ height: '1px', mx: '14px', backgroundColor: (t) => t.tokens.line }} />
);

interface RowProps {
  label: ReactNode;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}

const Row: FC<RowProps> = ({ label, leadingIcon, trailing, onClick, destructive }) => (
  <Box
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: '14px',
      py: '13px',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { backgroundColor: (t) => t.tokens.surface2 } : undefined,
    }}
  >
    {leadingIcon && (
      <Box
        sx={{
          display: 'flex',
          color: (t) => (destructive ? t.tokens.exploit : t.tokens.text2),
          '& svg': { fontSize: 18 },
        }}
      >
        {leadingIcon}
      </Box>
    )}
    <Typography
      sx={{
        flex: 1,
        fontSize: 13.5,
        fontWeight: destructive ? 500 : 400,
        color: (t) => (destructive ? t.tokens.exploit : t.tokens.text),
      }}
    >
      {label}
    </Typography>
    {trailing}
  </Box>
);

interface OwnProps {
  setApiKeyOpen: (open: boolean) => void;
}

const Settings: FC<OwnProps> = ({ setApiKeyOpen }) => {
  const showAllDomains = useSettingsStore((s) => s.showAllDomains);
  const showOnlyVulnerable = useSettingsStore((s) => s.showOnlyVulnerable);
  const doExtraScan = useSettingsStore((s) => s.doExtraScan);
  const theme = useSettingsStore((s) => s.theme);
  const closeSettings = useSettingsStore((s) => s.closeSettings);
  const setShowAllDomains = useSettingsStore((s) => s.setShowAllDomains);
  const setShowNotVulnerable = useSettingsStore((s) => s.setShowNotVulnerable);
  const setDoExtraScan = useSettingsStore((s) => s.setDoExtraScan);
  const changeTheme = useSettingsStore((s) => s.changeTheme);
  const clearData = useDataStore((s) => s.clearData);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2,
        pt: 2,
        pb: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.25,
      }}
    >
      <Box>
        <SectionLabel>Display</SectionLabel>
        <Card>
          <Row
            label="Show all domains"
            onClick={setShowAllDomains}
            trailing={<TokenSwitch checked={showAllDomains} disableRipple />}
          />
          <RowDivider />
          <Row
            label="Show only vulnerable hosts"
            onClick={setShowNotVulnerable}
            trailing={<TokenSwitch checked={showOnlyVulnerable} disableRipple />}
          />
        </Card>
      </Box>

      <Box>
        <SectionLabel>Scanning</SectionLabel>
        <Card>
          <Row
            label="Extra scan of page resources"
            onClick={setDoExtraScan}
            trailing={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpOutlined
                  titleAccess="Extra scan fetches static resources and checks them for vulnerable CDNs"
                  sx={{ fontSize: 16, color: (t: Theme) => t.tokens.text3 }}
                />
                <TokenSwitch checked={doExtraScan} disableRipple />
              </Box>
            }
          />
          <RowDivider />
          <Row
            label="Dark theme"
            leadingIcon={<DarkModeOutlined />}
            onClick={changeTheme}
            trailing={<TokenSwitch checked={theme === THEMES.DARK} disableRipple />}
          />
        </Card>
      </Box>

      <Box>
        <SectionLabel>Account</SectionLabel>
        <Card>
          <Row
            label="Change API key"
            leadingIcon={<VpnKeyOutlined />}
            onClick={() => setApiKeyOpen(true)}
            trailing={<ChevronRight sx={{ fontSize: 16, color: (t: Theme) => t.tokens.text3 }} />}
          />
          <RowDivider />
          <Row
            label="Clear all scans"
            leadingIcon={<DeleteOutlined />}
            destructive
            onClick={() => {
              closeSettings();
              clearData();
            }}
          />
        </Card>
      </Box>
    </Box>
  );
};

export default Settings;
