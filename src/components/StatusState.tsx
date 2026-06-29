import type { FC, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MONO, mix } from '../themes/tokens';

export type StatusTone = 'neutral' | 'clean' | 'error';

interface Props {
  icon: ReactNode;
  title: string;
  message?: ReactNode;
  tone?: StatusTone;
  /** small mono accent line above the title (e.g. the host name). */
  eyebrow?: string;
  /** action button / reveal control rendered below the message. */
  action?: ReactNode;
  /** expanded content (e.g. revealed software list). */
  children?: ReactNode;
}

/**
 * Shared status-state layout (clean / loading / empty / error): a 74px
 * icon-in-circle, title, and message in a centered column.
 */
const StatusState: FC<Props> = ({ icon, title, message, tone = 'neutral', eyebrow, action, children }) => {
  const { tokens } = useTheme();

  const toneColor = tone === 'clean' ? tokens.clean : tone === 'error' ? tokens.exploit : tokens.text2;
  const circleBg = tone === 'neutral' ? tokens.surface2 : mix(toneColor, 12, tokens.surface);
  const circleBorder = tone === 'neutral' ? tokens.line : mix(toneColor, 32, 'transparent');

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1.5,
        px: 4,
      }}
    >
      <Box
        sx={{
          width: 74,
          height: 74,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: circleBg,
          border: `1px solid ${circleBorder}`,
          color: toneColor,
          '& svg': { fontSize: 30 },
        }}
      >
        {icon}
      </Box>

      {eyebrow && (
        <Typography sx={{ fontFamily: MONO, fontWeight: 600, fontSize: 13, color: 'primary.main' }}>
          {eyebrow}
        </Typography>
      )}

      <Typography sx={{ fontSize: 17, fontWeight: 600, color: 'text.primary' }}>{title}</Typography>

      {message && (
        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', maxWidth: 250 }}>
          {message}
        </Typography>
      )}

      {action}
      {children}
    </Box>
  );
};

export default StatusState;
