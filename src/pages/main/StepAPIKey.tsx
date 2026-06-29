import { useState } from 'react';
import type { FC } from 'react';
import { Box, Button, Link, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CallMade, VpnKey } from '@mui/icons-material';
import { mix, MONO } from '../../themes/tokens';
import { useSettingsStore } from '../../stores/Settings';
import { Stepper } from './Main';

const SERVER_URL = 'https://vulners.com';
const API_KEYS_URL = SERVER_URL + '/userinfo?tab=api-keys';

interface OwnProps {
  classes: Record<string, string>;
  onNextClick: () => void;
  onPrevClick: () => void;
}

const StepAPIKey: FC<OwnProps> = ({ onNextClick, onPrevClick }) => {
  const { tokens } = useTheme();
  const storeApiKey = useSettingsStore((s) => s.apiKey);
  const validateAPIKey = useSettingsStore((s) => s.validateAPIKey);
  const setStoreApiKey = useSettingsStore((s) => s.setApiKey);
  const [apiKey, setApiKey] = useState(storeApiKey);
  const [apiKeyError, setApiKeyError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangeKey = (key: string) => {
    setApiKey(key);
    setApiKeyError('');
  };

  const handleSaveKey = () => {
    const key = apiKey.trim();
    if (!key) {
      return setApiKeyError('API Key can not be empty');
    }

    setSaving(true);
    validateAPIKey(key, (response) => {
      setSaving(false);
      if (response.valid) {
        setStoreApiKey(key);
        onNextClick();
      } else {
        setApiKeyError('API Key is not valid');
      }
    });
  };

  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', p: '20px' }}>
        <Box
          sx={{
            width: '100%',
            background: tokens.surface,
            border: `1px solid ${tokens.line}`,
            borderRadius: '16px',
            boxShadow: tokens.shadow,
            padding: '22px 20px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '4px' }}>
            <VpnKey sx={{ fontSize: 20, color: tokens.accent }} />
            <Typography component="h3" sx={{ fontSize: 21, fontWeight: 600, color: tokens.text }}>
              API key
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: tokens.text2, mb: '16px' }}>
            The scanner needs a free Vulners API key to look up vulnerabilities.
          </Typography>

          <Button
            href={API_KEYS_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            disableElevation
            fullWidth
            endIcon={<CallMade sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              borderRadius: '10px',
              padding: '12px',
              background: tokens.accent,
              color: '#fff',
              boxShadow: `0 6px 16px ${mix(tokens.accent, 38, 'transparent')}`,
              '&:hover': { background: tokens.accent },
            }}
          >
            Generate API key
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', my: '16px' }}>
            <Box sx={{ flex: 1, height: '1px', background: tokens.line }} />
            <Typography sx={{ fontSize: 11.5, color: tokens.text3 }}>or add manually</Typography>
            <Box sx={{ flex: 1, height: '1px', background: tokens.line }} />
          </Box>

          <Box
            component="ol"
            sx={{
              m: '0 0 14px',
              pl: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
            }}
          >
            <Typography
              component="li"
              sx={{ fontSize: 12.5, lineHeight: 1.45, color: tokens.text2 }}
            >
              Open{' '}
              <Link
                href={API_KEYS_URL}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{ color: tokens.accent, fontFamily: MONO }}
              >
                vulners.com/userinfo
              </Link>
            </Typography>
            <Typography
              component="li"
              sx={{ fontSize: 12.5, lineHeight: 1.45, color: tokens.text2 }}
            >
              Create a key with the{' '}
              <Box component="b" sx={{ color: tokens.text }}>
                scan
              </Box>{' '}
              scope
            </Typography>
            <Typography
              component="li"
              sx={{ fontSize: 12.5, lineHeight: 1.45, color: tokens.text2 }}
            >
              Paste it below and save
            </Typography>
          </Box>

          <TextField
            placeholder="API key"
            fullWidth
            value={apiKey}
            error={!!apiKeyError}
            helperText={apiKeyError}
            onChange={(e) => handleChangeKey(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: tokens.surface2,
                borderRadius: '10px',
                fontFamily: MONO,
                fontSize: 13,
                color: tokens.text,
                '& fieldset': { borderColor: tokens.line },
                '&:hover fieldset': { borderColor: tokens.line },
                '&.Mui-focused fieldset': { borderColor: tokens.accent },
              },
              '& .MuiOutlinedInput-input': { padding: '11px 12px' },
            }}
          />

          <Button
            onClick={handleSaveKey}
            disabled={!apiKey || saving}
            fullWidth
            sx={{
              mt: '12px',
              textTransform: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              borderRadius: '10px',
              padding: '11px',
              background: tokens.surface2,
              color: tokens.text,
              border: `1px solid ${tokens.line}`,
              '&:hover': { background: tokens.surface2, borderColor: tokens.accent },
            }}
          >
            {saving ? 'Checking…' : 'Save key'}
          </Button>
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
        <Stepper activeStep={2} />
        <Button
          onClick={onNextClick}
          disabled={!storeApiKey}
          sx={{
            minWidth: 0,
            p: 0,
            textTransform: 'none',
            color: storeApiKey ? tokens.accent : tokens.text3,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '.4px',
            '&:hover': { background: 'transparent' },
            '&.Mui-disabled': { color: tokens.text3 },
          }}
        >
          DONE
        </Button>
      </Box>
    </>
  );
};

export default StepAPIKey;
