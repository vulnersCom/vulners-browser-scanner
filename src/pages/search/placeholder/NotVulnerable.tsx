import { useState } from 'react';
import type { FC } from 'react';
import Software from '../Software';
import StatusState from '../../../components/StatusState';
import { ExpandMore, OpenInBrowser, VerifiedUserOutlined } from '@mui/icons-material';
import { Box, Button, List } from '@mui/material';
import type { HostData } from '../../../types';

interface Props {
  url?: string;
  data?: HostData[];
  hiddenSoft?: HostData;
}

const NotVulnerable: FC<Props> = ({ url, hiddenSoft }) => {
  const [revealed, setRevealed] = useState(false);

  const hiddenEntries = hiddenSoft ? Object.values(hiddenSoft.software) : [];
  // The worker only returns a host for scannable http(s) pages (localhost, IPs,
  // and domains all included); an empty url means we're not on a web page.
  const isDomain = Boolean(url);

  const domain = url ? url.replace('www.', '') : url;

  if (!isDomain) {
    return (
      <StatusState
        icon={<OpenInBrowser />}
        title="Go to some website to start scanning"
        tone="neutral"
      />
    );
  }

  const count = hiddenEntries.length;

  return (
    <StatusState
      icon={<VerifiedUserOutlined />}
      tone="clean"
      eyebrow={domain}
      title="No known vulnerabilities"
      message={
        count
          ? `This host looks clean — ${count} fingerprint${count > 1 ? 's' : ''} detected, none vulnerable.`
          : 'This host looks clean — no vulnerable software detected.'
      }
      action={
        !revealed && count ? (
          <Button
            variant="outlined"
            color="primary"
            endIcon={<ExpandMore />}
            onClick={() => setRevealed(true)}
            sx={{
              textTransform: 'none',
              fontSize: 12.5,
              fontWeight: 500,
              borderRadius: '9px',
              px: 1.75,
              py: 1,
              borderColor: (t) => t.tokens.line,
            }}
          >
            Show {count} fingerprint{count > 1 ? 's' : ''}
          </Button>
        ) : undefined
      }
    >
      {revealed && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <List disablePadding>
            {hiddenEntries.map((soft) => (
              <Software key={soft.software} {...soft} />
            ))}
          </List>
        </Box>
      )}
    </StatusState>
  );
};

export default NotVulnerable;
