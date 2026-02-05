import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';
import Panel from '../components/layout/Panel';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // UI-only state for placeholders
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [language, setLanguage] = useState('en');
  const [timeZone, setTimeZone] = useState('UTC');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [defaultWorkspace, setDefaultWorkspace] = useState('personal');
  const [lockEntriesByDefault, setLockEntriesByDefault] = useState(false);

  const handleExport = async () => {
    try {
      const response = await fetch('/api/settings/export', {
        credentials: 'include',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ofa-export-${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/settings/delete', {
        method: 'DELETE',
        credentials: 'include',
      });
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handleChangePassword = () => {
    // UI placeholder - backend not implemented
    alert('Change password feature coming soon');
  };

  const handleInviteMembers = () => {
    // UI placeholder - backend not implemented
    alert('Invite members feature coming soon');
  };

  return (
    <Page>
      <PageHeader
        title="Settings"
        subtitle="Manage your account, preferences, and workspace"
      />

      <div className="space-y-6">
        {/* Account Section */}
        <Panel
          title="Account"
          headerClassName="pb-4"
          bodyClassName="space-y-4"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Update your account information and profile
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  This is how your name appears to others
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  placeholder="your@email.com"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-2xl font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)]">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <Button variant="secondary" size="sm">
                    Upload Photo
                  </Button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </Panel>

        {/* Preferences Section */}
        <Panel
          title="Preferences"
          headerClassName="pb-4"
          bodyClassName="space-y-4"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Customize your app experience
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Theme
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                  <span className="text-xs text-[var(--text-muted)]">
                    Current: {theme === 'light' ? 'Light' : 'Dark'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Language
                </label>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Coming soon
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Time Zone
                </label>
                <Select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Europe/London">London (GMT)</option>
                </Select>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </Panel>

        {/* Notifications Section */}
        <Panel
          title="Notifications"
          headerClassName="pb-4"
          bodyClassName="space-y-4"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Control how you receive notifications
            </p>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Email Notifications
                  </span>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Receive notifications via email
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-[var(--accent)]' : 'bg-[var(--bg-surface)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    In-App Notifications
                  </span>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Show notifications in the app
                  </p>
                </div>
                <button
                  onClick={() => setInAppNotifications(!inAppNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    inAppNotifications ? 'bg-[var(--accent)]' : 'bg-[var(--bg-surface)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      inAppNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Weekly Summary
                  </span>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Receive a weekly summary email
                  </p>
                </div>
                <button
                  onClick={() => setWeeklySummary(!weeklySummary)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    weeklySummary ? 'bg-[var(--accent)]' : 'bg-[var(--bg-surface)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      weeklySummary ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4 pt-4 border-t border-[var(--border-subtle)]">
              Notification preferences are saved locally. Backend integration coming soon.
            </p>
          </div>
        </Panel>

        {/* Security Section */}
        <Panel
          title="Security"
          headerClassName="pb-4"
          bodyClassName="space-y-4"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Manage your account security settings
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Password
                </label>
                <Button variant="secondary" size="sm" onClick={handleChangePassword}>
                  Change Password
                </Button>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Coming soon
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Active Sessions
                </label>
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <p className="text-sm text-[var(--text-primary)]">
                    Current session: {new Date().toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Session management coming soon
                  </p>
                </div>
              </div>
              <div>
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Two-Factor Authentication (2FA)
                    </span>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      twoFactorAuth ? 'bg-[var(--accent)]' : 'bg-[var(--bg-surface)]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </Panel>

        {/* Workspace Section */}
        <Panel
          title="Workspace"
          headerClassName="pb-4"
          bodyClassName="space-y-4"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Manage your workspace settings
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Default Workspace
                </label>
                <Select
                  value={defaultWorkspace}
                  onChange={(e) => setDefaultWorkspace(e.target.value)}
                >
                  <option value="personal">Personal</option>
                  <option value="team">Team Workspace</option>
                </Select>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Coming soon
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Role
                </label>
                <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <p className="text-sm text-[var(--text-primary)]">
                    {user?.current_organization_id ? 'Team Member' : 'Owner'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Team Members
                </label>
                <Button variant="secondary" size="sm" onClick={handleInviteMembers}>
                  Invite Members
                </Button>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </Panel>

        {/* Billing Section */}
        <Panel
          title="Billing"
          headerClassName="pb-4"
          bodyClassName="space-y-4"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Manage your subscription and billing
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                  Current Plan
                </label>
                <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <p className="text-sm text-[var(--text-primary)]">
                    Free Plan
                  </p>
                </div>
              </div>
              <div>
                <Button variant="secondary" size="sm" asChild>
                  <Link to="/pricing">
                    Manage Billing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Panel>

        {/* Data Section - Preserved */}
        <Panel
          title="Data"
          headerClassName="pb-4"
          bodyClassName="space-y-3"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Export and manage your data
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="w-full justify-start"
            >
              Export all data
            </Button>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Download a copy of all your data.
            </p>
          </div>
        </Panel>

        {/* Privacy Section - Preserved */}
        <Panel
          title="Privacy"
          headerClassName="pb-4"
          bodyClassName="space-y-3"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Control your privacy settings
            </p>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={lockEntriesByDefault}
                onChange={(e) => setLockEntriesByDefault(e.target.checked)}
                className="w-5 h-5 rounded transition-colors border-[var(--border-subtle)] bg-[var(--bg-card)]"
              />
              <span className="text-sm text-[var(--text-primary)]">
                Lock entries by default
              </span>
            </label>
            <p className="text-sm text-[var(--text-muted)]">
              Make all new entries private by default.
            </p>
          </div>
        </Panel>

        {/* Danger Zone - Preserved */}
        <Panel
          title="Danger Zone"
          headerClassName="pb-4"
          bodyClassName="space-y-3"
          className="bg-[var(--bg-surface)]"
        >
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Irreversible and destructive actions
            </p>
            {!showDeleteConfirm ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete account
              </Button>
            ) : (
              <div>
                <p className="text-sm mb-4 text-[var(--text-primary)]">
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                  >
                    Yes, delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </Page>
  );
}
