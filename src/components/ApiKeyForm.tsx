import { useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import { Box, Button, IconButton, List, ListSubheader, TextField, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { inject, observer } from 'mobx-react';
import { Close } from '@mui/icons-material';
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
  const [hidden, setHidden] = useState(true);
  const [error, setError] = useState('');

  const handleSaveKey = () => {
    if (!value) {
      return setError('API Key can not be empty');
    }

    settingsStore.validateAPIKey(value, (response) => {
      if (response.valid) {
        settingsStore.setApiKey(value);
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

  const displayValue = hidden
    ? value.slice(0, 3) + ' * * * * ' + value.slice(value.length - 3, value.length)
    : value;

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
          value={displayValue}
          error={!!error}
          helperText={error}
          onChange={handleChange}
          onClick={() => hidden && setHidden(false)}
        />

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button color="primary" onClick={handleSaveKey}>
            Save
          </Button>
        </Box>
      </Box>
    </List>
  );
};

export default inject('settingsStore')(observer(ApiKeyForm)) as unknown as FC<OwnProps>;
