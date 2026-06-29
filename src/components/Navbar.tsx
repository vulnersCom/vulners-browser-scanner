import { useState } from 'react';
import type { FC } from 'react';
import { Drawer } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core/styles';
import Footer from './Footer';
import ApiKeyForm from './ApiKeyForm';
import Settings from './Settings';
import type { Stores } from '../stores/types';

const useStyles = makeStyles({
  navbar: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '50%',
  },
});

const Navbar: FC<Pick<Stores, 'settingsStore'>> = ({ settingsStore }) => {
  const classes = useStyles();
  const [apiKeyOpen, setApiKeyOpen] = useState(false);

  const handleSuccess = () => {
    settingsStore.closeSettings();
  };

  return (
    <Drawer
      anchor="right"
      open={settingsStore.open}
      onClose={settingsStore.closeSettings}
      className={classes.navbar}
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

export default inject('settingsStore')(observer(Navbar)) as unknown as FC;
