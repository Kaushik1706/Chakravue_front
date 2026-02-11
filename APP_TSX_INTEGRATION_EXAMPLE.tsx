/**
 * INTEGRATION EXAMPLE FOR APP.TSX
 * 
 * This shows how to integrate the new SaaS components into your existing App.tsx
 * Copy the relevant sections into your App.tsx file
 */

import { useState, useEffect } from 'react';
import { Menu, X, Home, Settings, LogOut } from 'lucide-react';

// Import the new SaaS components
import { PaymentSetupView } from './components/PaymentSetupView';
import { OrganizationLoginView } from './components/OrganizationLoginView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { UserLoginView } from './components/UserLoginView';

// Import your existing components
import { SettingsView } from './components/SettingsView';
import { NotificationsView } from './components/NotificationsView';
import { Sidebar } from './components/Sidebar';

// ============= INTERFACE =============

interface OrganizationContext {
  organizationId: string;
  organizationName: string;
  userId: string;
  email: string;
  role: string;
  token: string;
}

// ============= MAIN APP COMPONENT =============

export function AppWithSaaS() {
  // Existing state
  const [currentView, setCurrentView] = useState<string>('login');
  const [currentUsername, setCurrentUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // NEW: Organization context
  const [organizationContext, setOrganizationContext] = useState<OrganizationContext | null>(null);

  // Check localStorage for existing sessions
  useEffect(() => {
    const savedOrg = localStorage.getItem('organizationContext');
    const savedUsername = localStorage.getItem('currentUsername');
    const savedRole = localStorage.getItem('userRole');

    if (savedOrg) {
      const orgData = JSON.parse(savedOrg);
      setOrganizationContext(orgData);
      setCurrentUsername(orgData.email);
      setUserRole(orgData.role);
      setCurrentView('dashboard');
    } else if (savedUsername && savedRole) {
      setCurrentUsername(savedUsername);
      setUserRole(savedRole);
      setCurrentView('dashboard');
    }
  }, []);

  // ============= HANDLERS =============

  const handleRegularLogin = (username: string, role: string) => {
    setCurrentUsername(username);
    setUserRole(role);
    localStorage.setItem('currentUsername', username);
    localStorage.setItem('userRole', role);
    setCurrentView('dashboard');
  };

  const handleOrgLogin = (userData: any) => {
    // This is called after successful organization login
    setOrganizationContext({
      organizationId: userData.organization_id,
      organizationName: userData.organization_name,
      userId: userData.user_id,
      email: userData.email,
      role: userData.role,
      token: userData.token
    });
    setCurrentUsername(userData.email);
    setUserRole(userData.role.toLowerCase());
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    // Clear both regular and organization session
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('userRole');
    localStorage.removeItem('organizationContext');
    
    setCurrentUsername('');
    setUserRole('');
    setOrganizationContext(null);
    setCurrentView('login');
  };

  // ============= RENDER LOGIN SCREEN =============

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B7355] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">♀</span>
            </div>
            <h1 className="text-3xl font-bold">Chakravue AI</h1>
            <p className="text-[#8B8B8B]">Healthcare Dashboard</p>
          </div>

          {/* Regular Login */}
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-8">
            <h2 className="text-xl font-bold mb-6">Select Login Type</h2>
            
            <div className="space-y-4">
              {/* Regular user login */}
              <button
                onClick={() => setCurrentView('regular-login')}
                className="w-full bg-[#D4A574] text-[#0a0a0a] py-3 rounded-lg font-semibold hover:bg-[#C9955E] transition-colors"
              >
                User Login (Existing)
              </button>

              {/* Organization login */}
              <button
                onClick={() => setCurrentView('organization-login')}
                className="w-full border border-[#D4A574] text-[#D4A574] py-3 rounded-lg font-semibold hover:bg-[#D4A574] hover:text-[#0a0a0a] transition-colors"
              >
                Hospital Staff Login
              </button>

              {/* Signup for new hospital */}
              <button
                onClick={() => setCurrentView('payment-setup')}
                className="w-full border border-[#2a2a2a] py-3 rounded-lg hover:border-[#D4A574] transition-colors"
              >
                New Hospital Signup
              </button>

              {/* Admin dashboard */}
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="w-full border border-[#2a2a2a] py-3 rounded-lg hover:border-green-400 transition-colors text-sm"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============= RENDER PAYMENT SETUP =============

  if (currentView === 'payment-setup') {
    return <PaymentSetupView />;
  }

  // ============= RENDER ORGANIZATION LOGIN =============

  if (currentView === 'organization-login') {
    return <OrganizationLoginView onLoginSuccess={handleOrgLogin} />;
  }

  // ============= RENDER ADMIN DASHBOARD =============

  if (currentView === 'admin-dashboard') {
    return <AdminDashboardView />;
  }

  // ============= RENDER REGULAR LOGIN =============

  if (currentView === 'regular-login') {
    return (
      <UserLoginView
        onLoginSuccess={(username: string, role: string) => {
          handleRegularLogin(username, role);
        }}
        onBackClick={() => setCurrentView('login')}
      />
    );
  }

  // ============= RENDER MAIN DASHBOARD (after login) =============

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        userRole={userRole}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#121212] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B7355] flex items-center justify-center">
              <span className="text-lg font-bold">♀</span>
            </div>
            
            <div>
              <h1 className="text-xl font-bold">Chakravue AI</h1>
              {organizationContext ? (
                <p className="text-xs text-[#8B8B8B]">
                  {organizationContext.organizationName}
                </p>
              ) : null}
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUsername}</p>
              <p className="text-xs text-[#8B8B8B]">{userRole.toUpperCase()}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-[#D4A574]" />
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors lg:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {currentView === 'dashboard' && (
            <SettingsView
              userRole={userRole}
              organizationId={organizationContext?.organizationId}
            />
          )}

          {currentView === 'notifications' && (
            <NotificationsView userRole={userRole} />
          )}

          {/* Add other view routes here */}
        </div>
      </div>
    </div>
  );
}

export default AppWithSaaS;

/**
 * ============= USAGE INSTRUCTIONS =============
 *
 * 1. Copy this file content to replace parts of your existing App.tsx
 *
 * 2. Make sure you have all imports:
 *    - PaymentSetupView from './components/PaymentSetupView'
 *    - OrganizationLoginView from './components/OrganizationLoginView'
 *    - AdminDashboardView from './components/AdminDashboardView'
 *    - UserLoginView from './components/UserLoginView'
 *    - SettingsView from './components/SettingsView'
 *    - NotificationsView from './components/NotificationsView'
 *    - Sidebar from './components/Sidebar'
 *
 * 3. Key state to track:
 *    - organizationContext: Stores hospital info when user logs in
 *    - currentView: Current page being displayed
 *    - userRole: User's role (receptionist, opd, doctor)
 *
 * 4. Key functions:
 *    - handleOrgLogin(): Called after organization login
 *    - handleLogout(): Clears session and goes to login
 *
 * 5. Views supported:
 *    - 'login' - Login selection screen
 *    - 'regular-login' - Traditional user login
 *    - 'organization-login' - Hospital staff login
 *    - 'payment-setup' - New hospital signup
 *    - 'admin-dashboard' - Admin panel
 *    - 'dashboard' - Main dashboard
 *    - 'notifications' - Notifications page
 *
 * 6. Organization Context Storage:
 *    When a user logs in via organization login, their context is stored:
 *    localStorage.setItem('organizationContext', JSON.stringify({...}))
 *    This ensures data persistence on page reload
 *
 * 7. Passing organizationId to Components:
 *    Pass organizationContext?.organizationId to components that need it
 *    so they can fetch organization-specific data
 */
