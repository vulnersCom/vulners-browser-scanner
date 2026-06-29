import type { FC, ReactNode } from 'react';
import HiddenSoft from './HiddenSoft';
import { CloudDoneOutlined, OpenInBrowser } from '@material-ui/icons';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import type { HostData, SoftwareEntry } from '../../../types';

const useStyles = makeStyles((theme) => ({
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
  hiddenSoft?: HostData | SoftwareEntry[];
}

const DOMAIN_REGEX = /(?:[\w-]+\.)*([\w-]{1,63})(?:\.(?:\w{3}|\w{2}))(?:$|\/)/i;

const NotVulnerable: FC<Props> = ({ url, hiddenSoft }) => {
  const classes = useStyles();

  let icon: ReactNode;
  let text: ReactNode;
  if (url && url.match(DOMAIN_REGEX)) {
    icon = <CloudDoneOutlined className={classes.icon} />;
    text = (
      <span>
        <p>Seems current host is not Vulnerable</p>
        <HiddenSoft hiddenSoft={hiddenSoft as SoftwareEntry[]} />
      </span>
    );
  } else {
    icon = <OpenInBrowser className={classes.icon} />;
    text = <p>Go to some website to start scanning</p>;
  }

  const domain = url ? url.replace('www.', '') : url;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      className={classes.box}
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
