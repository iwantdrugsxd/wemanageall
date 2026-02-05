import AppShell from './layout/AppShell';

/**
 * Layout component - Thin wrapper around AppShell
 * Preserves all existing functionality while using the new enterprise shell
 */
export default function Layout({ children }) {
  return <AppShell>{children}</AppShell>;
}
