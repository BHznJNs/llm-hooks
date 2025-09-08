import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import App from './App';
import HooksPage from './pages/HooksPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import LogsPage from './pages/LogsPage.tsx';
import PluginsPage from './pages/PluginsPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';

const rootRoute = createRootRoute({
  component: App,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HooksPage,
});

const logsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/logs',
  component: LogsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const pluginsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/plugins',
  component: PluginsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  logsRoute,
  settingsRoute,
  pluginsRoute,
]);
const router = createRouter({ routeTree });

export default router;
export type RouterType = typeof router;
