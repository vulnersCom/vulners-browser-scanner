import { useState } from 'react';
import type { FC } from 'react';
import { inject, observer } from 'mobx-react';
import { Box, Button, Grow, Link, MobileStepper, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import Logo from '../../img/logo.svg';
import StepSettings from './StepSettings';
import StepAPIKey from './StepAPIKey';
import type { Stores } from '../../stores/types';

const useStyles = makeStyles()((theme) => ({
  main: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background:
      theme.palette.mode === 'light'
        ? 'url("/img/background_light.png") 39% 4%'
        : 'url("/img/background_dark.png") 40% 4%',
    color:
      theme.palette.mode === 'light' ? theme.palette.default.main : theme.palette.secondary.main,
  },
  logo: {
    height: 60,
  },
  button: {
    width: 150,
  },
  footer: {
    background: theme.palette.mode === 'light' ? '#fff' : '#4d4d4d',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
}));

type Classes = ReturnType<typeof useStyles>['classes'];

const StepWelcome: FC<{ classes: Classes; onNextClick: () => void }> = ({
  classes,
  onNextClick,
}) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    flex={1}
    p={5}
  >
    <Box mb={3}>
      <Link href="https://vulners.com" target="_blank" rel="noopener noreferrer">
        <img src={Logo} className={classes.logo} alt="Vulners" />
      </Link>
    </Box>

    <Typography variant="h5" align="center">
      Welcome to <br />
      Vulners web scanner!
    </Typography>

    <Box p={3} mb={3}>
      <Typography variant="body2">
        Extension provides ability to passively scan web-sites while you surf internet
      </Typography>
    </Box>

    <br />

    <Button
      endIcon={<ArrowForward />}
      color="primary"
      variant="contained"
      onClick={onNextClick}
      className={classes.button}
    >
      Start
    </Button>
    <br />
  </Box>
);

const Main: FC<Pick<Stores, 'settingsStore'>> = ({ settingsStore }) => {
  const { classes } = useStyles();
  const [activeStep, setActiveStep] = useState(settingsStore.introStep);

  const onNextClick = () => {
    settingsStore.setIntroStep(activeStep + 1);
    setActiveStep(activeStep + 1);
  };
  const onPrevClick = () => {
    settingsStore.setIntroStep(activeStep - 1);
    setActiveStep(activeStep - 1);
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 1:
        return <StepSettings classes={classes} onNextClick={onNextClick} />;
      case 2:
        return <StepAPIKey classes={classes} onNextClick={onNextClick} />;
      default:
        return <StepWelcome classes={classes} onNextClick={onNextClick} />;
    }
  };

  return (
    <Box className={classes.main}>
      <Grow in timeout={1000}>
        <Box flex={1} display="flex" justifyContent="center" flexDirection="column">
          {getStepContent()}

          {activeStep !== 0 && (
            <MobileStepper
              variant="dots"
              steps={3}
              position="static"
              activeStep={activeStep}
              className={classes.footer}
              nextButton={
                <Button
                  color="primary"
                  size="small"
                  onClick={onNextClick}
                  disabled={activeStep === 2}
                >
                  Next
                </Button>
              }
              backButton={
                <Button size="small" onClick={onPrevClick} disabled={activeStep === 0}>
                  Back
                </Button>
              }
            />
          )}
        </Box>
      </Grow>
    </Box>
  );
};

export default inject('settingsStore')(observer(Main)) as unknown as FC;
