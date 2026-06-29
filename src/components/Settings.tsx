import type { FC } from 'react';
import {
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Brightness4,
  Brightness5,
  Close,
  DeleteOutline,
  HelpOutline,
  VpnKey,
} from '@mui/icons-material';
import { inject, observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import type { Stores } from '../stores/types';

const useStyles = makeStyles()({
  subheader: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  spacer: {
    flex: 1,
  },
  listIcon: {
    minWidth: 'initial',
  },
  switch: {
    marginRight: 8,
  },
});

interface OwnProps {
  setApiKeyOpen: (open: boolean) => void;
}

type Props = OwnProps & Stores;

const Settings: FC<Props> = ({ dataStore, settingsStore, setApiKeyOpen }) => {
  const { classes } = useStyles();

  return (
    <>
      <List
        subheader={
          <ListSubheader component="div" className={classes.subheader}>
            <div>Settings</div>
            <IconButton onClick={settingsStore.closeSettings}>
              <Close />
            </IconButton>
          </ListSubheader>
        }
      >
        <ListItem button onChange={settingsStore.setShowAllDomains}>
          <FormControlLabel
            control={
              <Switch
                className={classes.switch}
                color="primary"
                checked={settingsStore.showAllDomains}
                name="showAllDomains"
              />
            }
            label="Show All Domains"
          />
        </ListItem>
        <ListItem button onChange={settingsStore.setShowNotVulnerable}>
          <FormControlLabel
            control={
              <Switch
                className={classes.switch}
                color="primary"
                checked={settingsStore.showOnlyVulnerable}
                name="showOnlyVulnerable"
              />
            }
            label="Show only vulnerable hosts"
          />
        </ListItem>
        <Divider />
        <ListItem button onChange={settingsStore.setDoExtraScan}>
          <FormControlLabel
            control={
              <Switch
                className={classes.switch}
                color="primary"
                checked={settingsStore.doExtraScan}
                name="doExtraScan"
              />
            }
            label="Do extra scan of resources"
          />
          <Tooltip title="extension will do second request to receive and parse content of static files (for example checking the vulnerable CDNs)">
            <ListItemIcon className={classes.listIcon}>
              <HelpOutline />
            </ListItemIcon>
          </Tooltip>
        </ListItem>
        <Divider />
        <ListItem button onClick={settingsStore.changeTheme}>
          <ListItemIcon>
            {settingsStore.theme === settingsStore.THEMES.DARK ? <Brightness5 /> : <Brightness4 />}
          </ListItemIcon>
          <ListItemText primary="Dark Theme" />
        </ListItem>
      </List>

      <div className={classes.spacer} />

      <List>
        <ListItem button onClick={() => setApiKeyOpen(true)}>
          <ListItemIcon>
            <VpnKey />
          </ListItemIcon>
          <ListItemText>
            <Typography align="left">Change API key</Typography>
          </ListItemText>
        </ListItem>
      </List>

      <List>
        <ListItem
          button
          onClick={() => {
            settingsStore.closeSettings();
            dataStore.clearData();
          }}
        >
          <ListItemIcon>
            <DeleteOutline />
          </ListItemIcon>
          <ListItemText>
            <Typography align="left">Clear all scans&nbsp;</Typography>
          </ListItemText>
        </ListItem>
      </List>
    </>
  );
};

export default inject('dataStore', 'settingsStore')(observer(Settings)) as unknown as FC<OwnProps>;
