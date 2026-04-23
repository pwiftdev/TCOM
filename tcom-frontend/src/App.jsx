import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
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

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
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
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
