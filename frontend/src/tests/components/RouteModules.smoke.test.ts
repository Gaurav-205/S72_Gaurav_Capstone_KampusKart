import { describe, it, expect } from 'vitest';

const routeModules: Array<[string, () => Promise<unknown>]> = [
  ['Landing', () => import('../../components/Landing')],
  ['Login', () => import('../../components/Login')],
  ['Signup', () => import('../../components/Signup')],
  ['ForgotPassword', () => import('../../components/ForgotPassword')],
  ['Home', () => import('../../components/Home')],
  ['LostFound', () => import('../../features/lostfound')],
  ['Profile', () => import('../../components/Profile')],
  ['Complaints', () => import('../../features/complaints')],
  ['CampusMap', () => import('../../features/map')],
  ['Events', () => import('../../features/events')],
  ['News', () => import('../../features/news')],
  ['Facilities', () => import('../../features/facilities')],
  ['ClubsRecruitment', () => import('../../features/clubs')],
  ['ChatWindow', () => import('../../features/chat')],
  ['PrivacyPolicy', () => import('../../components/PrivacyPolicy')],
  ['TermsOfService', () => import('../../components/TermsOfService')],
];

const IMPORT_TIMEOUT_MS = 20000;

describe('Route module smoke tests', () => {
  it.each(routeModules)(
    '%s module loads with default export',
    async (_name, loader) => {
      const mod = await loader();
      const defaultExport = (mod as { default?: unknown }).default;

      expect(defaultExport).toBeDefined();
      expect(typeof defaultExport).toMatch(/function|object/);
    },
    IMPORT_TIMEOUT_MS
  );
});
