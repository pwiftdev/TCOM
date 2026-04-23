import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Community from './pages/Community';
import CreateCommunity from './pages/CreateCommunity';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import InviteAccept from './pages/InviteAccept';
import { AuthGuard } from './components/auth/AuthGuard';
import { useCommunity } from './hooks/useCommunity';
import { CommunitySettings } from './components/community/CommunitySettings';
import { useAuthBootstrap } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import { Avatar } from './components/ui/Avatar';
import { LoginWithX } from './components/auth/LoginWithX';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

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
  const hydrating = Boolean(token) && !user;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="topbar-brand">
            <span className="logo">TC</span>
            TCOM
          </Link>
          <nav className="topbar-nav">
            <NavLink to="/" end>Explore</NavLink>
            {user && <NavLink to="/create">Create</NavLink>}
            {user && <NavLink to={`/profile/${user.username}`}>Profile</NavLink>}
          </nav>
          <div className="topbar-user">
            {user ? (
              <>
                <Avatar size="xs" src={user.avatar_url} name={user.username} />
                <span className="user-name">@{user.username}</span>
                <button type="button" className="btn-ghost" onClick={logout}>Logout</button>
              </>
            ) : hydrating ? (
              <span className="spinner" />
            ) : (
              <LoginWithX />
            )}
          </div>
        </div>
      </header>
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
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111418',
            color: '#e8edf2',
            border: '1px solid #1e2630',
            borderRadius: 10,
            fontSize: '0.92rem',
          },
        }}
      />
    </QueryClientProvider>
  );
}
