import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  text: {
    color: theme.palette.text.primary,
  },
}));

const NotFound: FC = () => {
  const { classes } = useStyles();

  return (
    <Box display="flex" alignItems="center" justifyContent="center" style={{ height: '100%' }}>
      <Typography className={classes.text}>Nothing found</Typography>
    </Box>
  );
};

export default NotFound;
