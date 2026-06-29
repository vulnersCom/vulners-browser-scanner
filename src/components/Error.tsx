import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { inject, observer } from 'mobx-react';
import type { Stores } from '../stores/types';

const Error: FC<Pick<Stores, 'settingsStore'>> = ({ settingsStore }) =>
  settingsStore.error ? (
    <Box p={2} style={{ background: '#f44336', color: '#fff' }}>
      <Typography variant="body2">{settingsStore.error}</Typography>
    </Box>
  ) : null;

export default inject('settingsStore')(observer(Error)) as unknown as FC;
