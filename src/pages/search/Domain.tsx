import { useState } from 'react';

import Software from './Software';
import HiddenSoft from './placeholder/HiddenSoft';
import { Box, Typography } from '@mui/material';
import { Shield } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import type { SoftwareEntry } from '../../types';
import { MONO, mix, severityBand } from '../../themes/tokens';
import { useSettingsStore } from '../../stores/Settings';

interface OwnProps {
  name?: string;
  software?: Record<string, SoftwareEntry>;
  vulnerable?: boolean;
}

const Domain: FC<OwnProps> = ({ name = '', software = {} }) => {
  const { tokens } = useTheme();

  // Read the global filter live (no stale snapshot); `revealed` is a local
  // per-domain override so the user can expand the hidden fingerprints.
  const showOnlyVulnerable = useSettingsStore((s) => s.showOnlyVulnerable);
  const [revealed, setRevealed] = useState(false);
  const filterToVulnerable = showOnlyVulnerable && !revealed;

  const allSoft = Object.values(software);

  let softToShow: SoftwareEntry[] = [];
  const softToHide: SoftwareEntry[] = [];

  if (filterToVulnerable) {
    for (const soft of allSoft) {
      if (soft.vulnerabilities.length) {
        softToShow.push(soft);
      } else {
        softToHide.push(soft);
      }
    }
  } else {
    softToShow = allSoft;
  }

  // Host summary: count detected fingerprints, how many carry public exploits,
  // and the worst severity band to colour the host-risk pill.
  const total = allSoft.length;
  const withExploits = allSoft.filter((s) => s.exploit).length;
  const maxScore = allSoft.reduce((max, s) => Math.max(max, s.score ?? 0), 0);
  const risk = maxScore > 0 ? severityBand(maxScore) : null;

  return (
    <Box key={name}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          mb: '12px',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: MONO,
              fontWeight: 600,
              fontSize: 16,
              color: tokens.accent,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: tokens.text2, mt: '2px' }}>
            {total} fingerprint{total === 1 ? '' : 's'} detected
            {withExploits > 0 && ` · ${withExploits} with exploit${withExploits === 1 ? '' : 's'}`}
          </Typography>
        </Box>
        {risk && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 9px',
              borderRadius: '999px',
              background: mix(risk.color, 13, tokens.surface),
              border: `1px solid ${mix(risk.color, 32, 'transparent')}`,
              color: risk.color,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.3px',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
              textTransform: 'uppercase',
            }}
          >
            <Shield sx={{ fontSize: 13 }} />
            {risk.label}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          border: `1px solid ${tokens.line}`,
          borderRadius: '12px',
          background: tokens.surface,
          boxShadow: tokens.shadow,
          overflow: 'hidden',
        }}
      >
        {softToShow.map((soft, i) => (
          <Box key={soft.software}>
            {i > 0 && <Box sx={{ height: '1px', background: tokens.line }} />}
            <Software {...soft} />
          </Box>
        ))}
      </Box>

      {filterToVulnerable && <HiddenSoft soft={softToHide} onClick={() => setRevealed(true)} />}
    </Box>
  );
};

export default Domain;
