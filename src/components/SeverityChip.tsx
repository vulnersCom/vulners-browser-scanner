import type { FC } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MONO, mix, severityBand } from '../themes/tokens';

interface Props {
  score: number;
}

/**
 * Accessible severity chip: pairs the CVSS score with a text band label and a
 * color swatch — never color alone. Folds the 0-10 scale into 4 bands.
 */
const SeverityChip: FC<Props> = ({ score }) => {
  const { tokens } = useTheme();
  const band = severityBand(score);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 8px',
        borderRadius: '8px',
        color: band.color,
        backgroundColor: mix(band.color, tokens.chipTint, tokens.surface),
        border: `1px solid ${mix(band.color, tokens.chipBorder, 'transparent')}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Box sx={{ width: 7, height: 7, borderRadius: '2px', backgroundColor: band.color }} />
      <Box component="span" sx={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, lineHeight: 1 }}>
        {score.toFixed(1)}
      </Box>
      <Box
        component="span"
        sx={{
          fontSize: 9.5,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.4px',
          lineHeight: 1,
        }}
      >
        {band.label}
      </Box>
    </Box>
  );
};

export default SeverityChip;
