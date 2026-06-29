import HiddenSoft from './HiddenSoft';
import { CloudDoneOutlined, OpenInBrowser } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { HostData } from '../../../types';
import type { FC } from 'react';

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
    wordBreak: 'break-word',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
}));

interface Props {
  url?: string;
  data?: HostData[];
  hiddenSoft?: HostData;
}

const NotVulnerable: FC<Props> = ({ url, hiddenSoft }) => {
  const { classes } = useStyles();

  const hiddenEntries = hiddenSoft ? Object.values(hiddenSoft.software) : [];
  // The worker only returns a host for scannable http(s) pages (localhost, IPs,
  // and domains all included); an empty url means we're not on a web page.
  const isDomain = Boolean(url);

  const domain = url ? url.replace('www.', '') : url;
  return (
    <Box
      className={classes.box}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        px: 4,
      }}
    >
      {isDomain ? (
        <>
          <CloudDoneOutlined className={classes.icon} />
          <Typography color="primary" variant="h5" className={classes.domain}>
            {domain}
          </Typography>
          <Box>
            <Typography className={classes.message}>
              Seems current host is not Vulnerable
            </Typography>
            <HiddenSoft soft={hiddenEntries} align="center" />
          </Box>
        </>
      ) : (
        <>
          <OpenInBrowser className={classes.icon} />
          <Typography className={classes.message}>Go to some website to start scanning</Typography>
        </>
      )}
    </Box>
  );
};

export default NotVulnerable;
