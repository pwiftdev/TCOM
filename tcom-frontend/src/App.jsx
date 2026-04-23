import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
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

const qc = new QueryClient();

function CommunitySettingsPage() {
  const { slug } = useParams();
  const { data } = useCommunity(slug);
  return <div className="container"><CommunitySettings community={data} /></div>;
}

function Bootstrap() {
  useAuthBootstrap();
  return null;
}

function AppShell({ children }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-brand">
            <Link to="/">TCOM</Link>
            <span className="muted">Trenches Community</span>
          </div>
          <nav className="topbar-nav">
            <Link to="/">Explore</Link>
            {user && <Link to="/create">Create</Link>}
            {user && <Link to={`/profile/${user.username}`}>Profile</Link>}
          </nav>
          <div className="topbar-user">
            {user ? (
              <>
                <span className="muted">@{user.username}</span>
                <button type="button" className="btn btn-ghost" onClick={logout}>Logout</button>
              </>
            ) : (
              <span className="muted">Guest</span>
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
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppShell>
          <Bootstrap />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/c/:slug" element={<Community />} />
            <Route path="/c/:slug/settings" element={<AuthGuard><CommunitySettingsPage /></AuthGuard>} />
            <Route path="/create" element={<AuthGuard><CreateCommunity /></AuthGuard>} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
