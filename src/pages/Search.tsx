import { useState } from 'react';
import type { FC } from 'react';
import Domain from './search/Domain';
import NotVulnerable from './search/placeholder/NotVulnerable';
import NotFound from './search/placeholder/NotFound';
import { Box, InputBase } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
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
    flex: 1,
    overflowY: 'scroll',
    scrollbarWidth: 'none' /* Firefox */,
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '10px 14px 16px',
  },
});

const Search: FC = () => {
  const { classes } = useStyles();
  const { tokens } = useTheme();
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

  // "Show all domains" off means "only the current tab". With no current
  // domain (blank/new tab), that narrows to an empty list so the placeholder
  // shows, rather than leaking every previously scanned host.
  if (!showAllDomains) {
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
        <Box sx={{ padding: '12px 14px 6px', background: tokens.bg, flex: '0 0 auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              height: 40,
              padding: '0 12px',
              border: `1px solid ${tokens.line}`,
              borderRadius: '10px',
              background: tokens.surface2,
            }}
          >
            <SearchOutlined sx={{ fontSize: 17, color: tokens.text3 }} />
            <InputBase
              value={searchValue}
              fullWidth
              placeholder="Search software, host or CVE…"
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                fontSize: 13,
                color: tokens.text,
                '& input::placeholder': { color: tokens.text3, opacity: 1 },
              }}
            />
          </Box>
        </Box>
      )}
      <Box className={classes.data}>
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
