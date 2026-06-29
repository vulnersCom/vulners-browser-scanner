import { useState } from 'react';
import type { FC } from 'react';
import { Drawer } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import Footer from './Footer';
import ApiKeyForm from './ApiKeyForm';
import Settings from './Settings';
import { useSettingsStore } from '../stores/Settings';

const useStyles = makeStyles()({
  drawerPaper: {
    width: 360,
    maxWidth: 'calc(100vw - 40px)',
    display: 'flex',
    flexDirection: 'column',
  },
});

const Navbar: FC = () => {
  const { classes } = useStyles();
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const open = useSettingsStore((s) => s.open);
  const closeSettings = useSettingsStore((s) => s.closeSettings);

  const handleSuccess = () => {
    closeSettings();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeSettings}
      classes={{ paper: classes.drawerPaper }}
    >
      {apiKeyOpen ? (
        <ApiKeyForm onClose={() => setApiKeyOpen(false)} onSuccess={handleSuccess} />
      ) : (
        <Settings setApiKeyOpen={setApiKeyOpen} />
      )}
      <br />
      <Footer />
    </Drawer>
  );
};

export default Navbar;
