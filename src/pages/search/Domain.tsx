import { useState } from 'react';

import Software from './Software';
import HiddenSoft from './placeholder/HiddenSoft';
import { Box, List, Paper, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { FC } from 'react';
import type { SoftwareEntry } from '../../types';
import { useSettingsStore } from '../../stores/Settings';

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

const Domain: FC<OwnProps> = ({ name = '', software = {} }) => {
  const { classes } = useStyles();

  // Read the global filter live (no stale snapshot); `revealed` is a local
  // per-domain override so the user can expand the hidden fingerprints.
  const showOnlyVulnerable = useSettingsStore((s) => s.showOnlyVulnerable);
  const [revealed, setRevealed] = useState(false);
  const filterToVulnerable = showOnlyVulnerable && !revealed;

  let softToShow: SoftwareEntry[] = [];
  const softToHide: SoftwareEntry[] = [];

  if (filterToVulnerable) {
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

        {filterToVulnerable && <HiddenSoft soft={softToHide} onClick={() => setRevealed(true)} />}
      </Paper>
    </Box>
  );
};

export default Domain;
