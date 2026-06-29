import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { useSettingsStore } from '../stores/Settings';

const Error: FC = () => {
  const error = useSettingsStore((s) => s.error);

  return error ? (
    <Box style={{ background: '#f44336', color: '#fff' }} sx={{ p: 2 }}>
      <Typography variant="body2">{error}</Typography>
    </Box>
  ) : null;
};

export default Error;
