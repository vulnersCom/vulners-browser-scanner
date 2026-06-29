import { useState } from 'react';

import Score from './vulnerability/Score';
import Vulnerability from './Vulnerability';
import { Box, Collapse, ListItemButton, Typography } from '@mui/material';
import { Bolt } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { SoftwareEntry } from '../../types';
import { MONO, mix } from '../../themes/tokens';

/**
 * Split a possibly-compound fingerprint label (e.g. "AngularJS, script") into a
 * display name and an optional source tag ("core" / "headers" / "script").
 */
const SOURCES = ['core', 'headers', 'script'];
function splitLabel(label: string): { name: string; source?: string } {
  const idx = label.lastIndexOf(',');
  if (idx >= 0) {
    const tail = label
      .slice(idx + 1)
      .trim()
      .toLowerCase();
    if (SOURCES.includes(tail)) {
      return { name: label.slice(0, idx).trim(), source: tail };
    }
  }
  return { name: label };
}

const Software = ({
  software,
  version,
  score,
  scoreColor,
  exploit,
  vulnerabilities,
}: SoftwareEntry) => {
  const { tokens } = useTheme();
  const [open, setOpen] = useState(false);
  const { name, source } = splitLabel(software);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{
          padding: '13px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            <Typography
              component="span"
              sx={{ fontWeight: 600, fontSize: 13.5, color: tokens.text, lineHeight: 1.2 }}
            >
              {name}
            </Typography>
            {source && (
              <Box
                component="span"
                sx={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  color: tokens.text3,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: '4px',
                  padding: '1px 5px',
                  textTransform: 'uppercase',
                  letterSpacing: '.4px',
                }}
              >
                {source}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '5px' }}>
            {version && (
              <Typography
                component="span"
                sx={{ fontFamily: MONO, fontSize: 12, color: tokens.text2 }}
              >
                v{version}
              </Typography>
            )}
            {exploit && (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '.3px',
                  color: tokens.exploit,
                  background: mix('#e5484d', tokens.chipTint - 2, tokens.surface),
                  border: `1px solid ${mix('#e5484d', tokens.chipBorder - 4, 'transparent')}`,
                  borderRadius: '4px',
                  padding: '1px 5px',
                }}
              >
                <Bolt sx={{ fontSize: 11 }} />
                EXPLOIT
              </Box>
            )}
          </Box>
        </Box>
        <Score score={score} scoreColor={scoreColor} />
      </ListItemButton>
      <Collapse in={open} timeout={150} unmountOnExit>
        <Box sx={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {vulnerabilities.map((v) => (
            <Vulnerability key={v.id} {...v} />
          ))}
        </Box>
      </Collapse>
    </>
  );
};

export default Software;
