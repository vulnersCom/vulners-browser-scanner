import type { FC } from 'react';
import {
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Switch,
  Typography,
} from '@mui/material';
import {
  Brightness4,
  Brightness5,
  Close,
  DeleteOutlined,
  HelpOutlined,
  VpnKey,
} from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import { useDataStore } from '../stores/Data';
import { useSettingsStore, THEMES } from '../stores/Settings';

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
  helpIcon: {
    marginLeft: 6,
    verticalAlign: 'text-bottom',
  },
  labelWithIcon: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  settingRow: {
    gap: 8,
  },
  settingControl: {
    flex: 1,
    minWidth: 0,
    marginRight: 0,
  },
  switch: {
    marginRight: 8,
  },
});

interface OwnProps {
  setApiKeyOpen: (open: boolean) => void;
}

const Settings: FC<OwnProps> = ({ setApiKeyOpen }) => {
  const { classes } = useStyles();

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
    <>
      <List
        subheader={
          <ListSubheader component="div" className={classes.subheader}>
            <div>Settings</div>
            <IconButton onClick={closeSettings}>
              <Close />
            </IconButton>
          </ListSubheader>
        }
      >
        <ListItemButton onChange={setShowAllDomains} className={classes.settingRow}>
          <FormControlLabel
            className={classes.settingControl}
            control={
              <Switch
                className={classes.switch}
                color="primary"
                checked={showAllDomains}
                name="showAllDomains"
              />
            }
            label="Show All Domains"
          />
        </ListItemButton>
        <ListItemButton onChange={setShowNotVulnerable} className={classes.settingRow}>
          <FormControlLabel
            className={classes.settingControl}
            control={
              <Switch
                className={classes.switch}
                color="primary"
                checked={showOnlyVulnerable}
                name="showOnlyVulnerable"
              />
            }
            label="Show only vulnerable hosts"
          />
        </ListItemButton>
        <Divider />
        <ListItemButton onChange={setDoExtraScan} className={classes.settingRow}>
          <FormControlLabel
            className={classes.settingControl}
            control={
              <Switch
                className={classes.switch}
                color="primary"
                checked={doExtraScan}
                name="doExtraScan"
              />
            }
            label={
              <span className={classes.labelWithIcon}>
                Do extra scan of resources
                <HelpOutlined
                  className={classes.helpIcon}
                  fontSize="small"
                  color="action"
                  titleAccess="Extra scan fetches static resources and checks them for vulnerable CDNs"
                />
              </span>
            }
          />
        </ListItemButton>
        <Divider />
        <ListItemButton onClick={changeTheme}>
          <ListItemIcon>{theme === THEMES.DARK ? <Brightness5 /> : <Brightness4 />}</ListItemIcon>
          <ListItemText primary="Dark Theme" />
        </ListItemButton>
      </List>

      <div className={classes.spacer} />

      <List>
        <ListItemButton onClick={() => setApiKeyOpen(true)}>
          <ListItemIcon>
            <VpnKey />
          </ListItemIcon>
          <ListItemText>
            <Typography align="left">Change API key</Typography>
          </ListItemText>
        </ListItemButton>
      </List>

      <List>
        <ListItemButton
          onClick={() => {
            closeSettings();
            clearData();
          }}
        >
          <ListItemIcon>
            <DeleteOutlined />
          </ListItemIcon>
          <ListItemText>
            <Typography align="left">Clear all scans&nbsp;</Typography>
          </ListItemText>
        </ListItemButton>
      </List>
    </>
  );
};

export default Settings;
