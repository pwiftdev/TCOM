import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import Home from './pages/Home';
import Community from './pages/Community';
import CreateCommunity from './pages/CreateCommunity';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import { AuthGuard } from './components/auth/AuthGuard';
import { useCommunity } from './hooks/useCommunity';
import { CommunitySettings } from './components/community/CommunitySettings';
import { useAuthBootstrap } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import { Avatar } from './components/ui/Avatar';
import { LoginWithX } from './components/auth/LoginWithX';
import { OnlineIndicator } from './components/ui/OnlineIndicator';
import { IconMenu, IconClose, IconX } from './components/ui/Icon';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
const TCOM_CA = '6oqrBATpFy8ispnR7b2Fc2gUniJ6dj31Z3MXcVHepump';

function CommunitySettingsPage() {
  const { slug } = useParams();
  const { data } = useCommunity(slug);
  return (
    <div className="container" style={{ maxWidth: 620 }}>
      <CommunitySettings community={data} />
    </div>
  );
}

function Bootstrap() {
  useAuthBootstrap();
  return null;
}

function AppShell({ children }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const apiBase = import.meta.env.VITE_API_URL;
  const hydrating = Boolean(token) && !user;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedCa, setCopiedCa] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  function handleLogout() {
    setMobileOpen(false);
    logout();
  }

  async function copyCA() {
    try {
      await navigator.clipboard.writeText(TCOM_CA);
      setCopiedCa(true);
      toast.success('TCOM CA copied');
      setTimeout(() => setCopiedCa(false), 1400);
    } catch {
      toast.error('Could not copy CA');
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="topbar-brand" aria-label="TrenchCom home">
            <img src="/logo.svg" alt="" className="brand-logo" />
            <img src="/wordmark.svg" alt="TrenchCom" className="brand-wordmark" />
          </Link>
          <nav className="topbar-nav">
            <NavLink to="/" end>Communities</NavLink>
            <a href="/#explore">Explore</a>
            <a href="/#docs">Docs</a>
          </nav>
          <div className="topbar-user">
            <button type="button" className="topbar-pill topbar-pill-ca" onClick={copyCA}>
              {copiedCa ? 'Copied CA' : 'Copy CA'}
            </button>
            {user ? (
              <>
                <Link className="topbar-pill topbar-pill-ghost" to={`/profile/${user.username}`}>
                  Profile
                </Link>
                <Link className="topbar-pill topbar-pill-solid" to="/create">
                  Create Community <span aria-hidden="true">→</span>
                </Link>
              </>
            ) : hydrating ? (
              <span className="spinner" />
            ) : (
              <a className="topbar-pill topbar-pill-x" href={`${apiBase}/auth/x`}>
                <IconX width={14} height={14} /> Sign in with X
              </a>
            )}
          </div>
          <button
            type="button"
            className="topbar-menu-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileOpen ? <IconClose width={22} height={22} /> : <IconMenu width={22} height={22} />}
          </button>
        </div>
      </header>

      <div
        className={`mobile-nav-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />
      <aside
        id="mobile-nav-drawer"
        className={`mobile-nav ${mobileOpen ? 'open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-nav-header">
          <div className="mobile-nav-brand">
            <img src="/logo.svg" alt="" className="brand-logo" />
            <img src="/wordmark.svg" alt="TrenchCom" className="brand-wordmark" />
          </div>
          <OnlineIndicator />
        </div>

        {user ? (
          <Link
            to={`/profile/${user.username}`}
            className="mobile-nav-user"
            onClick={() => setMobileOpen(false)}
          >
            <Avatar size="sm" src={user.avatar_url} name={user.username} />
            <div className="mobile-nav-user-meta">
              <strong>{user.display_name || user.username}</strong>
              <span className="muted">@{user.username}</span>
            </div>
          </Link>
        ) : hydrating ? (
          <div className="mobile-nav-user muted"><span className="spinner" /> Signing in…</div>
        ) : (
          <div className="mobile-nav-signin">
            <LoginWithX />
          </div>
        )}

        <nav className="mobile-nav-links">
          <NavLink to="/" end onClick={() => setMobileOpen(false)}>Explore</NavLink>
          {user && <NavLink to="/create" onClick={() => setMobileOpen(false)}>Create community</NavLink>}
          {user && (
            <NavLink to={`/profile/${user.username}`} onClick={() => setMobileOpen(false)}>
              Your profile
            </NavLink>
          )}
        </nav>

        {user && (
          <div className="mobile-nav-footer">
            <button type="button" className="btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </aside>

      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Bootstrap />
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/c/:slug" element={<Community />} />
            <Route
              path="/c/:slug/settings"
              element={
                <AuthGuard>
                  <CommunitySettingsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/create"
              element={
                <AuthGuard>
                  <CreateCommunity />
                </AuthGuard>
              }
            />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1916',
            color: '#F5F0E8',
            border: '1px solid #2E2B28',
            borderRadius: 10,
            fontSize: '0.92rem',
          },
        }}
      />
    </QueryClientProvider>
  );
}
