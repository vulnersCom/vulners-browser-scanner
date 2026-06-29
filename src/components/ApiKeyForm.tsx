import { useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListSubheader,
  TextField,
  Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { MONO } from '../themes/tokens';
import { useSettingsStore } from '../stores/Settings';

const useStyles = makeStyles()((theme) => {
  const { tokens } = theme;
  return {
    subheader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 4,
      width: 320,
      fontSize: 16,
      fontWeight: 600,
      color: tokens.text,
      background: tokens.bg,
    },
    form: {
      flex: 1,
    },
    link: {
      textDecoration: 'none',
      color: tokens.accent,
    },
  };
});

interface OwnProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ApiKeyForm: FC<OwnProps> = ({ onClose, onSuccess }) => {
  const { classes, theme } = useStyles();
  const { tokens } = theme;
  const apiKey = useSettingsStore((s) => s.apiKey);
  const validateAPIKey = useSettingsStore((s) => s.validateAPIKey);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const [value, setValue] = useState(apiKey);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSaveKey = () => {
    const key = value.trim();
    if (!key) {
      return setError('API Key can not be empty');
    }

    setSaving(true);
    validateAPIKey(key, (response) => {
      setSaving(false);
      if (response.valid) {
        setApiKey(key);
        onSuccess();
      } else {
        setError('API Key is not valid');
      }
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setValue(e.target.value);
  };

  return (
    <List
      style={{ height: '100%' }}
      subheader={
        <ListSubheader component="div" className={classes.subheader}>
          <div>Change Api Key</div>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </ListSubheader>
      }
    >
      <Box sx={{ p: 2, mt: 1 }}>
        <Typography variant="body1">
          Follow{' '}
          <a
            className={classes.link}
            href="https://vulners.com/userinfo?tab=api-keys"
            target="_blank"
            rel="noreferrer"
          >
            vulners.com
          </a>{' '}
          to create new api key
        </Typography>
      </Box>
      <Box className={classes.form} sx={{ p: 2 }}>
        <TextField
          label="API Key"
          fullWidth
          type={visible ? 'text' : 'password'}
          value={value}
          error={!!error}
          helperText={error}
          onChange={handleChange}
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
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={visible ? 'Hide API key' : 'Show API key'}
                    onClick={() => setVisible((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {visible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleSaveKey}
            disabled={saving}
            sx={{
              textTransform: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              borderRadius: '10px',
              padding: '8px 18px',
              background: tokens.surface2,
              color: tokens.text,
              border: `1px solid ${tokens.line}`,
              '&:hover': { background: tokens.surface2, borderColor: tokens.accent },
            }}
          >
            {saving ? 'Checking…' : 'Save'}
          </Button>
        </Box>
      </Box>
    </List>
  );
};

export default ApiKeyForm;
