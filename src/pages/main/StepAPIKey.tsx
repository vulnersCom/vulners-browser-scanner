import { useState } from 'react';
import type { FC } from 'react';
import {
  Box,
  Button,
  Collapse,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { inject, observer } from 'mobx-react';
import type { Stores } from '../../stores/types';

const SERVER_URL = 'https://vulners.com';

interface OwnProps {
  classes: Record<string, string>;
  onNextClick: () => void;
}

type Props = OwnProps & Pick<Stores, 'settingsStore'>;

const StepAPIKey: FC<Props> = ({ classes, onNextClick, settingsStore }) => {
  const [apiKey, setApiKey] = useState(settingsStore.apiKey);
  const [apiKeyError, setApiKeyError] = useState('');
  const [fieldOpen, setFieldOpen] = useState(false);
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
    settingsStore.validateAPIKey(key, (response) => {
      setSaving(false);
      if (response.valid) {
        settingsStore.setApiKey(key);
        onNextClick();
      } else {
        setApiKeyError('API Key is not valid');
      }
    });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      flex={1}
      p={1}
      m={1}
    >
      <Paper>
        <Box p={2}>
          <Typography variant="h5">API Key</Typography>
          <Typography variant="subtitle1">
            Extension requires API Key to work properly Generate it by clicking button below
          </Typography>
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              href={SERVER_URL + '/userinfo?tab=api-keys'}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="contained"
            >
              Get API KEY
            </Button>
          </Box>

          <br />

          <ListItem button onClick={() => setFieldOpen(!fieldOpen)}>
            <ListItemText>Or add key manually</ListItemText>
            <ListItemIcon>
              <ExpandMore
                style={{ transition: 'all 0.5s', transform: fieldOpen ? 'rotate(0.5turn)' : '' }}
              />
            </ListItemIcon>
          </ListItem>
          <Collapse in={fieldOpen}>
            <Typography variant="body2" component="div">
              <ul>
                <li>
                  Go to{' '}
                  <a
                    href="https://vulners.com/userinfo?tab=api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className={classes.link}
                  >
                    vulners.com/userinfo?tab=api-keys
                  </a>
                </li>
                <li>
                  Create API Key with scope <i>scan</i> or use WebExtension Template
                </li>
                <li>Insert generated key below</li>
              </ul>
            </Typography>
            <TextField
              label="API Key"
              fullWidth
              value={apiKey}
              onChange={(e) => handleChangeKey(e.target.value)}
            />

            <Box display="flex" justifyContent="center" mt={3}>
              <Button disabled={!apiKey || saving} color="primary" onClick={handleSaveKey}>
                {saving ? 'Checking…' : 'Save'}
              </Button>
            </Box>
          </Collapse>
          {apiKeyError && <Box className={classes.link}>{apiKeyError}</Box>}
        </Box>
      </Paper>
    </Box>
  );
};

export default inject('settingsStore')(observer(StepAPIKey)) as unknown as FC<OwnProps>;
