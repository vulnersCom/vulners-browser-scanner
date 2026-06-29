import type { FC } from 'react';
import { makeStyles } from 'tss-react/mui';
import { inject, observer } from 'mobx-react';
import { ArrowBack, Settings as SettingsIcon } from '@mui/icons-material';
import { Box, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      className={classes.header}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pr: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ p: 1 }}>
          {location.pathname === '/about' ? (
            <IconButton onClick={() => navigate('/')}>
              <ArrowBack />
            </IconButton>
          ) : (
            <Link href="https://vulners.com" target="_blank" rel="noopener noreferrer">
              <img src={Icon} className={classes.icon} alt="Vulners" />
            </Link>
          )}
        </Box>
        <Box sx={{ ml: 2 }}>
          <Tooltip title="Number of websites where vulnerabilities were found">
            <span>
              <span>Vulnerable&nbsp;&nbsp;</span>
              <Typography component="span" variant="body1" color="primary">
                {stat.vulnerable || 0}
              </Typography>
            </span>
          </Tooltip>
        </Box>
        <Box sx={{ ml: 2 }}>
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
