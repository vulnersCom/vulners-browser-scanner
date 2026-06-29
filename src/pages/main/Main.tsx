import { useState } from 'react';
import type { FC } from 'react';
import { Box, Button, Grow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import Logo from '../../img/logo.svg';
import { mix } from '../../themes/tokens';
import StepSettings from './StepSettings';
import StepAPIKey from './StepAPIKey';
import { useSettingsStore } from '../../stores/Settings';

const useStyles = makeStyles()((theme) => {
  const { tokens } = theme;
  return {
    main: {
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      color: tokens.text,
      background: `radial-gradient(130% 90% at 115% -15%, ${mix(
        tokens.accent,
        16,
        'transparent'
      )}, transparent 55%), radial-gradient(120% 80% at -20% 120%, ${mix(
        tokens.accent,
        9,
        'transparent'
      )}, transparent 50%), ${tokens.bg}`,
    },
    motif: {
      position: 'absolute',
      inset: 0,
      opacity: 0.28,
      pointerEvents: 'none',
      background: `repeating-linear-gradient(118deg, transparent 0 58px, ${mix(
        tokens.accent,
        30,
        'transparent'
      )} 58px 59px)`,
    },
    content: {
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    logo: {
      height: 33,
    },
  };
});

type Classes = ReturnType<typeof useStyles>['classes'];

/** 3-dot stepper: active dot is a 22x7 accent pill, inactive dots are 7x7. */
const Stepper: FC<{ activeStep: number }> = ({ activeStep }) => {
  const { tokens } = useTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '7px' }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: i === activeStep ? 22 : 7,
            height: 7,
            borderRadius: '4px',
            background: i === activeStep ? tokens.accent : tokens.line,
            transition: 'all 150ms ease',
          }}
        />
      ))}
    </Box>
  );
};

const StepWelcome: FC<{ classes: Classes; onNextClick: () => void }> = ({
  classes,
  onNextClick,
}) => {
  const { tokens } = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: '38px',
        py: '36px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', mb: '30px' }}>
        <img src={Logo} className={classes.logo} alt="" aria-hidden />
        <Typography
          component="span"
          sx={{ fontWeight: 700, fontSize: 25, letterSpacing: '1px', color: tokens.text }}
        >
          VULNERS
        </Typography>
      </Box>

      <Typography
        component="h2"
        sx={{
          fontSize: 23,
          fontWeight: 600,
          lineHeight: 1.25,
          color: tokens.text,
          mb: '14px',
        }}
      >
        Welcome to the
        <br />
        Web Scanner
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          lineHeight: 1.5,
          color: tokens.text2,
          mb: '32px',
          maxWidth: 270,
        }}
      >
        Passively scan the sites you visit and surface known CVEs and public exploits as you browse.
      </Typography>

      <Button
        endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
        variant="contained"
        onClick={onNextClick}
        disableElevation
        sx={{
          textTransform: 'none',
          fontSize: 14.5,
          fontWeight: 600,
          borderRadius: '11px',
          padding: '14px 26px',
          background: tokens.accent,
          color: '#fff',
          boxShadow: `0 8px 20px ${mix(tokens.accent, 40, 'transparent')}`,
          '&:hover': {
            background: tokens.accent,
            boxShadow: `0 8px 20px ${mix(tokens.accent, 50, 'transparent')}`,
          },
        }}
      >
        Get started
      </Button>
    </Box>
  );
};

const Main: FC = () => {
  const { classes } = useStyles();
  const introStep = useSettingsStore((s) => s.introStep);
  const setIntroStep = useSettingsStore((s) => s.setIntroStep);
  const [activeStep, setActiveStep] = useState(introStep);

  const onNextClick = () => {
    setIntroStep(activeStep + 1);
    setActiveStep(activeStep + 1);
  };
  const onPrevClick = () => {
    setIntroStep(activeStep - 1);
    setActiveStep(activeStep - 1);
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <StepSettings classes={classes} onNextClick={onNextClick} onPrevClick={onPrevClick} />
        );
      case 2:
        return <StepAPIKey classes={classes} onNextClick={onNextClick} onPrevClick={onPrevClick} />;
      default:
        return <StepWelcome classes={classes} onNextClick={onNextClick} />;
    }
  };

  return (
    <Box className={classes.main}>
      <Box className={classes.motif} />
      <Grow in timeout={600}>
        <Box className={classes.content}>
          {getStepContent()}

          {activeStep === 0 && (
            <Box sx={{ pb: '24px' }}>
              <Stepper activeStep={activeStep} />
            </Box>
          )}
        </Box>
      </Grow>
    </Box>
  );
};

export { Stepper };
export default Main;
