import type { FC } from 'react';
import { Search } from '@mui/icons-material';
import StatusState from '../../../components/StatusState';

const NotFound: FC = () => (
  <StatusState
    icon={<Search />}
    tone="neutral"
    title="No matches"
    message="Nothing matched your search. Try another software name, host or CVE id."
  />
);

export default NotFound;
