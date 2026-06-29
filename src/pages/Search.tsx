import { useState } from 'react';
import type { FC } from 'react';
import Domain from './search/Domain';
import NotVulnerable from './search/placeholder/NotVulnerable';
import NotFound from './search/placeholder/NotFound';
import { Box, IconButton, TextField } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import type { HostData } from '../types';
import { useDataStore } from '../stores/Data';
import { useSettingsStore } from '../stores/Settings';
import { matchesHostSearch } from '../search';

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

const Search: FC = () => {
  const { classes } = useStyles();
  const [searchValue, setSearchValue] = useState('');

  const url = useDataStore((s) => s.url);
  const data = useDataStore((s) => s.data);
  const showOnlyVulnerable = useSettingsStore((s) => s.showOnlyVulnerable);
  const showAllDomains = useSettingsStore((s) => s.showAllDomains);

  // Reset the search box whenever the domain filters change. Following React's
  // "adjusting state when a prop changes" guidance, this is done during render
  // instead of in an effect to avoid a synchronous setState in an effect.
  const filterKey = `${showOnlyVulnerable}-${showAllDomains}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setSearchValue('');
  }

  const domainSoft = url ? data.find((domain) => domain.name === url) : undefined;

  let list: HostData[] = [...data];

  if (!showAllDomains && url) {
    list = domainSoft ? [domainSoft] : [];
  }

  if (showOnlyVulnerable) {
    list = list.filter((domain) => domain.vulnerable);
  }

  if (!list.length) {
    return <NotVulnerable url={url} data={list} hiddenSoft={domainSoft} />;
  }

  if (searchValue) {
    list = list.filter((domain) => matchesHostSearch(domain, searchValue));
  }

  return (
    <div className={classes.root}>
      {showAllDomains && (
        <Box sx={{ display: 'flex', pr: 2, alignItems: 'center' }}>
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
      <Box className={classes.data} sx={{ flex: 1 }}>
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

export default Search;
