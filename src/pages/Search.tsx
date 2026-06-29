import { useEffect, useState } from 'react';
import type { FC } from 'react';
import Domain from './search/Domain';
import NotVulnerable from './search/placeholder/NotVulnerable';
import NotFound from './search/placeholder/NotFound';
import { inject, observer } from 'mobx-react';
import { Box, IconButton, TextField } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import type { HostData } from '../types';
import type { Stores } from '../stores/types';

const useStyles = makeStyles()({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  data: {
    overflowY: 'scroll',
    scrollbarWidth: 'none' /* Firefox */,
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '& >div:last-child': {
      marginBottom: '56px',
    },
  },
});

const Search: FC<Stores> = ({ dataStore, settingsStore }) => {
  const { classes } = useStyles();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setSearchValue('');
  }, [settingsStore.showOnlyVulnerable, settingsStore.showAllDomains]);

  const { url } = dataStore;
  const domainSoft = url ? dataStore.data.find((domain) => domain.name === url) : undefined;

  let list: HostData[] = [...dataStore.data];

  if (!settingsStore.showAllDomains && url) {
    list = domainSoft ? [domainSoft] : [];
  }

  if (settingsStore.showOnlyVulnerable) {
    list = list.filter((domain) => domain.vulnerable);
  }

  if (!list.length) {
    return <NotVulnerable url={url} data={list} hiddenSoft={domainSoft} />;
  }

  if (searchValue) {
    const re = new RegExp(searchValue, 'ig');
    list = list.filter((d) => re.test(Object.keys(d.software).join() + d.name));
  }

  return (
    <div className={classes.root}>
      {settingsStore.showAllDomains && (
        <Box display="flex" pr={2} alignItems="center">
          <IconButton>
            <SearchOutlined />
          </IconButton>
          <TextField
            value={searchValue}
            fullWidth
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </Box>
      )}
      <Box className={classes.data} flex={1}>
        {searchValue && !list.length && <NotFound />}
        {list.map((domain) => (
          <Domain
            key={domain.name}
            name={domain.name}
            vulnerable={domain.vulnerable}
            software={domain.software}
          />
        ))}
      </Box>
    </div>
  );
};

export default inject('dataStore', 'settingsStore')(observer(Search)) as unknown as FC;
