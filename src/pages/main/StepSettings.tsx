import type { FC } from 'react';
import { Box, Button, Switch, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { HelpOutlined } from '@mui/icons-material';
import { useSettingsStore, THEMES } from '../../stores/Settings';
import { Stepper } from './Main';

interface OwnProps {
  classes: Record<string, string>;
  onNextClick: () => void;
  onPrevClick: () => void;
}

const StepSettings: FC<OwnProps> = ({ onNextClick, onPrevClick }) => {
  const { tokens } = useTheme();
  const theme = useSettingsStore((s) => s.theme);
  const doExtraScan = useSettingsStore((s) => s.doExtraScan);
  const setDoExtraScan = useSettingsStore((s) => s.setDoExtraScan);
  const changeTheme = useSettingsStore((s) => s.changeTheme);

  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', p: '22px' }}>
        <Box
          sx={{
            width: '100%',
            background: tokens.surface,
            border: `1px solid ${tokens.line}`,
            borderRadius: '16px',
            boxShadow: tokens.shadow,
            padding: '24px 22px',
          }}
        >
          <Typography
            component="h3"
            sx={{ fontSize: 21, fontWeight: 600, color: tokens.text, mb: '4px' }}
          >
            Defaults
          </Typography>
          <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, color: tokens.text2, mb: '22px' }}>
            Choose how the scanner behaves. You can change these any time in Settings.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              py: '14px',
              borderBottom: `1px solid ${tokens.line}`,
            }}
          >
            <Typography sx={{ fontSize: 14, color: tokens.text, flex: 1 }}>
              Extra scan of page resources
            </Typography>
            <Tooltip title="Extension will do second request to receive and parse content of static files (for example checking the vulnerable CDNs)">
              <HelpOutlined sx={{ fontSize: 18, color: tokens.text3, display: 'flex' }} />
            </Tooltip>
            <Switch
              color="primary"
              checked={doExtraScan}
              onChange={setDoExtraScan}
              name="doExtraScan"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', py: '14px' }}>
            <Typography sx={{ fontSize: 14, color: tokens.text, flex: 1 }}>Dark theme</Typography>
            <Switch
              color="primary"
              checked={theme === THEMES.DARK}
              onChange={changeTheme}
              name="changeTheme"
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: '22px',
          pb: '22px',
        }}
      >
        <Button
          onClick={onPrevClick}
          sx={{
            minWidth: 0,
            p: 0,
            textTransform: 'none',
            color: tokens.accent,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '.4px',
            '&:hover': { background: 'transparent' },
          }}
        >
          BACK
        </Button>
        <Stepper activeStep={1} />
        <Button
          onClick={onNextClick}
          sx={{
            minWidth: 0,
            p: 0,
            textTransform: 'none',
            color: tokens.accent,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '.4px',
            '&:hover': { background: 'transparent' },
          }}
        >
          NEXT
        </Button>
      </Box>
    </>
  );
};

export default StepSettings;
