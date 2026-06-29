import type { FC, MouseEventHandler } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { SoftwareEntry } from '../../../types';

const useStyles = makeStyles()((theme) => ({
  hidden: {
    fontWeight: 400,
    color: theme.palette.primary.main,
  },
}));

interface Props {
  soft?: SoftwareEntry[];
  onClick?: MouseEventHandler;
  align?: 'center' | 'right';
}

const HiddenSoft: FC<Props> = ({ soft, onClick, align = 'right' }) => {
  const { classes } = useStyles();
  if (!soft || !soft.length) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : 'flex-end',
        pr: align === 'center' ? 0 : 1,
        pb: 1,
      }}
    >
      <Typography variant="subtitle2" color="textSecondary" align={align}>
        <Link href="#" onClick={onClick} className={classes.hidden}>
          {soft.length} fingerprint{soft.length > 1 && 's'}&nbsp;hidden
        </Link>
      </Typography>
    </Box>
  );
};

export default HiddenSoft;
