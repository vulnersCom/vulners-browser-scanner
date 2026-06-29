import type { FC, ReactNode } from 'react';
import HiddenSoft from './HiddenSoft';
import { CloudDoneOutlined, OpenInBrowser } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { HostData } from '../../../types';

const useStyles = makeStyles()((theme) => ({
  box: {
    height: '100%',
    color: theme.palette.text.primary,
  },
  icon: {
    fontSize: 40,
    fontWeight: 200,
  },
  domain: {
    fontWeight: 300,
  },
}));

interface Props {
  url?: string;
  data?: HostData[];
  hiddenSoft?: HostData;
}

const DOMAIN_REGEX = /(?:[\w-]+\.)*([\w-]{1,63})(?:\.(?:\w{3}|\w{2}))(?:$|\/)/i;

const NotVulnerable: FC<Props> = ({ url, hiddenSoft }) => {
  const { classes } = useStyles();

  const hiddenEntries = hiddenSoft ? Object.values(hiddenSoft.software) : [];

  let icon: ReactNode;
  let text: ReactNode;
  if (url && url.match(DOMAIN_REGEX)) {
    icon = <CloudDoneOutlined className={classes.icon} />;
    text = (
      <span>
        <p>Seems current host is not Vulnerable</p>
        <HiddenSoft soft={hiddenEntries} />
      </span>
    );
  } else {
    icon = <OpenInBrowser className={classes.icon} />;
    text = <p>Go to some website to start scanning</p>;
  }

  const domain = url ? url.replace('www.', '') : url;
  return (
    <Box
      className={classes.box}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {icon}
      <br />
      <br />
      <Typography color="primary" variant="h5" className={classes.domain}>
        {domain}
      </Typography>
      {text}
    </Box>
  );
};

export default NotVulnerable;
