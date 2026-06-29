import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { MemoryRouter, Switch, Route, useHistory } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import { inject, observer } from 'mobx-react';

import Layout from './components/Layout';
import Main from './pages/main/Main';
import Search from './pages/Search';
import About from './pages/About';
import ThemeLight from './themes/Light';
import ThemeDark from './themes/Dark';
import { v_browser } from './Browser';
import type { Stores } from './stores/types';

const AppLayout = inject(
  'settingsStore',
  'dataStore'
)(
  observer(({ settingsStore, dataStore, children }: Stores & { children?: ReactNode }) => {
    const history = useHistory();

    useEffect(() => {
      if (settingsStore.apiKey) history.push('/');
    }, [settingsStore.apiKey, history]);

    useEffect(() => {
      if (settingsStore.apiKey) {
        if (history.location.pathname === '/main') history.push('/');
      } else {
        if (history.location.pathname === '/') history.push('/main');
      }
    }, [dataStore.loaded, settingsStore.apiKey, history]);

    return <>{children}</>;
  })
) as unknown as FC<{ children?: ReactNode }>;

const App: FC<Stores> = ({ settingsStore, dataStore }) => {
  const openLink = (url?: string) =>
    url && v_browser.runtime.sendMessage({ action: 'open_link', url });

  useEffect(() => {
    document.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', (e) => {
        const target = e.target as HTMLAnchorElement | null;
        openLink(target?.href || (target?.parentElement as HTMLAnchorElement | null)?.href);
      })
    );
  });

  useEffect(() => {
    dataStore.loadData();
  }, [dataStore]);

  const theme = settingsStore.theme === 'light' ? ThemeLight : ThemeDark;

  if (!dataStore.loaded) {
    return (
      <ThemeProvider theme={theme}>
        <CircularProgress size={64} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <AppLayout>
          <Switch>
            <Route exact path="/main" component={Main} />
            <Layout>
              <Route exact path="/" component={Search} />
              <Route exact path="/about" component={About} />
            </Layout>
          </Switch>
        </AppLayout>
      </MemoryRouter>
    </ThemeProvider>
  );
};

export default inject('settingsStore', 'dataStore')(observer(App)) as unknown as FC;
