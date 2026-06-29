import type { FC, MouseEventHandler } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { SoftwareEntry } from '../../../types';

interface Props {
  soft?: SoftwareEntry[];
  onClick?: MouseEventHandler;
  align?: 'center' | 'right';
}

const HiddenSoft: FC<Props> = ({ soft, onClick, align = 'right' }) => {
  const { tokens } = useTheme();
  if (!soft || !soft.length) {
    return null;
  }

  const count = soft.length;
  const plural = count > 1 ? 's' : '';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : 'flex-end',
      }}
    >
      {onClick ? (
        <Link
          component="button"
          onClick={onClick}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: tokens.accent,
            fontSize: 12.5,
            fontWeight: 500,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Show {count} hidden fingerprint{plural}
          <KeyboardArrowDown sx={{ fontSize: 16 }} />
        </Link>
      ) : (
        <Typography sx={{ color: tokens.text3, fontSize: 12.5, fontWeight: 500 }}>
          {count} fingerprint{plural} hidden
        </Typography>
      )}
    </Box>
  );
};

export default HiddenSoft;
