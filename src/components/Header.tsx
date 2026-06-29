import type { FC } from 'react';
import { makeStyles } from 'tss-react/mui';
import { inject, observer } from 'mobx-react';
import { ArrowBack, Settings as SettingsIcon } from '@mui/icons-material';
import { Box, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import Icon from '../img/icon.svg';
import type { Stores } from '../stores/types';

const useStyles = makeStyles()((theme) => ({
  header: {
    background: '#030303',
    color: theme.palette.secondary.main,
  },
  icon: {
    width: 42,
    height: 42,
  },
}));

const Header: FC<Stores> = ({ dataStore, settingsStore }) => {
  const { classes } = useStyles();

  const { stat } = dataStore;
  const { open } = settingsStore;
  const history = useHistory();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      className={classes.header}
      pr={1}
    >
      <Box display="flex" alignItems="center">
        <Box p={1}>
          {history.location.pathname === '/about' ? (
            <IconButton onClick={() => history.push('/')}>
              <ArrowBack />
            </IconButton>
          ) : (
            <Link href="https://vulners.com" target="_blank" rel="noopener noreferrer">
              <img src={Icon} className={classes.icon} alt="Vulners" />
            </Link>
          )}
        </Box>
        <Box ml={2}>
          <Tooltip title="Number of websites where vulnerabilities were found">
            <span>
              <span>Vulnerable&nbsp;&nbsp;</span>
              <Typography component="span" variant="body1" color="primary">
                {stat.vulnerable || 0}
              </Typography>
            </span>
          </Tooltip>
        </Box>
        <Box ml={2}>
          <Tooltip title="Number of websites the extension has ever scanned">
            <span>
              <span>Scanned&nbsp;&nbsp;</span>
              <Typography component="span" variant="body1" color="primary">
                {stat.scanned || 0}
              </Typography>
            </span>
          </Tooltip>
        </Box>
      </Box>
      <IconButton
        color="secondary"
        onClick={() => (!open ? settingsStore.openSettings() : settingsStore.closeSettings())}
      >
        <SettingsIcon />
      </IconButton>
    </Box>
  );
};

export default inject('dataStore', 'settingsStore')(observer(Header)) as unknown as FC;
