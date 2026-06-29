import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { inject, observer } from 'mobx-react';
import type { Stores } from '../stores/types';

const Error: FC<Pick<Stores, 'settingsStore'>> = ({ settingsStore }) =>
  settingsStore.error ? (
    <Box style={{ background: '#f44336', color: '#fff' }} sx={{ p: 2 }}>
      <Typography variant="body2">{settingsStore.error}</Typography>
    </Box>
  ) : null;

export default inject('settingsStore')(observer(Error)) as unknown as FC;
