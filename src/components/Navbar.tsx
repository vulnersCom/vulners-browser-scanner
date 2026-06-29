import { useState } from 'react';
import type { FC } from 'react';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import Footer from './Footer';
import ApiKeyForm from './ApiKeyForm';
import Settings from './Settings';
import { useSettingsStore } from '../stores/Settings';

const useStyles = makeStyles()((theme) => ({
  drawerPaper: {
    width: 360,
    maxWidth: 'calc(100vw - 40px)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.tokens.bg,
    backgroundImage: 'none',
  },
}));

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
      <Box
        component="header"
        sx={{
          height: 56,
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          borderBottom: (t) => `1px solid ${t.tokens.line}`,
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>
          Settings
        </Typography>
        <IconButton
          onClick={closeSettings}
          aria-label="Close settings"
          sx={{
            ml: 'auto',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: (t) => t.tokens.surface2,
            color: (t) => t.tokens.text2,
            '&:hover': { backgroundColor: (t) => t.tokens.line },
          }}
        >
          <Close sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {apiKeyOpen ? (
        <ApiKeyForm onClose={() => setApiKeyOpen(false)} onSuccess={handleSuccess} />
      ) : (
        <Settings setApiKeyOpen={setApiKeyOpen} />
      )}
      <Footer />
    </Drawer>
  );
};

export default Navbar;
