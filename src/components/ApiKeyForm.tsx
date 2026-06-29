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
import { inject, observer } from 'mobx-react';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import type { Stores } from '../stores/types';

const useStyles = makeStyles()((theme) => ({
  subheader: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingRight: 4,
    width: 320,
  },
  form: {
    flex: 1,
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
}));

interface OwnProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Props = OwnProps & Pick<Stores, 'settingsStore'>;

const ApiKeyForm: FC<Props> = ({ settingsStore, onClose, onSuccess }) => {
  const { classes } = useStyles();
  const [value, setValue] = useState(settingsStore.apiKey);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSaveKey = () => {
    const apiKey = value.trim();
    if (!apiKey) {
      return setError('API Key can not be empty');
    }

    setSaving(true);
    settingsStore.validateAPIKey(apiKey, (response) => {
      setSaving(false);
      if (response.valid) {
        settingsStore.setApiKey(apiKey);
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
      <Box p={2} mt={1}>
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
      <Box p={2} className={classes.form}>
        <TextField
          label="API Key"
          fullWidth
          type={visible ? 'text' : 'password'}
          value={value}
          error={!!error}
          helperText={error}
          onChange={handleChange}
          InputProps={{
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
          }}
        />

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button color="primary" onClick={handleSaveKey} disabled={saving}>
            {saving ? 'Checking…' : 'Save'}
          </Button>
        </Box>
      </Box>
    </List>
  );
};

export default inject('settingsStore')(observer(ApiKeyForm)) as unknown as FC<OwnProps>;
