import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { MemoryRouter, Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';

import Layout from './components/Layout';
import Main from './pages/main/Main';
import Search from './pages/Search';
import About from './pages/About';
import ThemeLight from './themes/Light';
import ThemeDark from './themes/Dark';
import { v_browser } from './Browser';
import { useDataStore } from './stores/Data';
import { useSettingsStore } from './stores/Settings';

const AppLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const loaded = useDataStore((s) => s.loaded);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (apiKey) navigate('/');
  }, [apiKey, navigate]);

  useEffect(() => {
    if (apiKey) {
      if (location.pathname === '/main') navigate('/');
    } else {
      if (location.pathname === '/') navigate('/main');
    }
  }, [loaded, apiKey, location.pathname, navigate]);

  return <>{children}</>;
};

const App: FC = () => {
  const theme = useSettingsStore((s) => s.theme);
  const loaded = useDataStore((s) => s.loaded);
  const loadData = useDataStore((s) => s.loadData);
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a') : null;
      const href = target?.getAttribute('href');
      if (!href || href === '#') return;

      const url = new URL(href, window.location.href);
      if (!['http:', 'https:'].includes(url.protocol)) return;

      event.preventDefault();
      v_browser.runtime.sendMessage({ action: 'open_link', url: url.href });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const muiTheme = theme === 'light' ? ThemeLight : ThemeDark;

  if (!loaded) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CircularProgress size={64} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
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

export default App;
