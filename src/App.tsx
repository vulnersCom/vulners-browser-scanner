import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { MemoryRouter, Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
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
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (settingsStore.apiKey) navigate('/');
    }, [settingsStore.apiKey, navigate]);

    useEffect(() => {
      if (settingsStore.apiKey) {
        if (location.pathname === '/main') navigate('/');
      } else {
        if (location.pathname === '/') navigate('/main');
      }
    }, [dataStore.loaded, settingsStore.apiKey, location.pathname, navigate]);

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
          <Routes>
            <Route path="/main" element={<Main />} />
            <Route
              element={
                <Layout>
                  <Outlet />
                </Layout>
              }
            >
              <Route path="/" element={<Search />} />
              <Route path="/about" element={<About />} />
            </Route>
          </Routes>
        </AppLayout>
      </MemoryRouter>
    </ThemeProvider>
  );
};

export default inject('settingsStore', 'dataStore')(observer(App)) as unknown as FC;
