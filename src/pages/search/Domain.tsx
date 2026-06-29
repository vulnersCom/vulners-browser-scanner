import { useState } from 'react';
import { inject, observer } from 'mobx-react';

import Software from './Software';
import HiddenSoft from './placeholder/HiddenSoft';
import { Box, List, Paper, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { FC } from 'react';
import type { SoftwareEntry } from '../../types';
import type { Stores } from '../../stores/types';

const useStyles = makeStyles()({
  header: {
    fontWeight: 300,
    wordBreak: 'break-all',
  },
});

interface OwnProps {
  name?: string;
  software?: Record<string, SoftwareEntry>;
  vulnerable?: boolean;
}

type Props = OwnProps & Pick<Stores, 'settingsStore'>;

const Domain: FC<Props> = ({ settingsStore, name = '', software = {} }) => {
  const { classes } = useStyles();

  const [showOnlyVulnerable, setShowOnlyVulnerable] = useState(settingsStore.showOnlyVulnerable);

  let softToShow: SoftwareEntry[] = [];
  const softToHide: SoftwareEntry[] = [];

  if (showOnlyVulnerable) {
    for (const soft of Object.values(software)) {
      if (soft.vulnerabilities.length) {
        softToShow.push(soft);
      } else {
        softToHide.push(soft);
      }
    }
  } else {
    softToShow = Object.values(software);
  }

  return (
    <Box key={name} sx={{ pr: 1, pl: 1, mb: 1 }}>
      <Box sx={{ pt: 3, pb: 1 }}>
        <Typography variant="h5" color="primary" align="center" className={classes.header}>
          {name}
        </Typography>
      </Box>
      <Paper elevation={3}>
        <List>
          {softToShow.map((soft) => (
            <Software key={soft.software} {...soft} />
          ))}
        </List>

        {showOnlyVulnerable && (
          <HiddenSoft
            soft={softToHide}
            onClick={() => setShowOnlyVulnerable(!showOnlyVulnerable)}
          />
        )}
      </Paper>
    </Box>
  );
};

export default inject('settingsStore')(observer(Domain)) as unknown as FC<OwnProps>;
