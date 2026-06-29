import type { FC, MouseEventHandler } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { SoftwareEntry } from '../../../types';

const useStyles = makeStyles()((theme) => ({
  hidden: {
    fontWeight: 400,
    color: theme.palette.secondary.dark,
  },
}));

interface Props {
  soft?: SoftwareEntry[];
  onClick?: MouseEventHandler;
}

const HiddenSoft: FC<Props> = ({ soft, onClick }) => {
  const { classes } = useStyles();
  if (!soft || !soft.length) {
    return null;
  }

  return (
    <Box sx={{ justifyContent: 'flex-end', pr: 1, pb: 1 }}>
      <Typography variant="subtitle2" color="textSecondary" align="right">
        <Link href="#" onClick={onClick} className={classes.hidden}>
          {soft.length} fingerprint{soft.length > 1 && 's'}&nbsp;hidden
        </Link>
      </Typography>
    </Box>
  );
};

export default HiddenSoft;
