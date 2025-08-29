import type { Language } from '../types';

export type RouteConfig = {
  path: string;
  labelKey: string;
  icon: string;
};

export const getRouteConfig = (_language: Language): RouteConfig[] => {
  return [
    {
      path: '/',
      labelKey: 'hooks',
      icon: 'hook',
    },
    {
      path: '/logs',
      labelKey: 'logs',
      icon: 'log',
    },
    {
      path: '/settings',
      labelKey: 'settings',
      icon: 'settings',
    },
  ];
};
