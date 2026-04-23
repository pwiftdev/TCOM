import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { communityApi } from '../../api/communities';
import { useAuthStore } from '../../store/authStore';

export function VoiceChatPanel({ communitySlug, community }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['voice-room', communitySlug],
    queryFn: () => communityApi.getVoiceRoom(communitySlug),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });

  const activeRoom = data?.active_room || null;
  const canStart = Boolean(user && (community?.is_member || community?.owner_id === user.id));
  const canEnd = Boolean(user && activeRoom && (activeRoom.created_by === user.id || community?.owner_id === user.id));

  const startMutation = useMutation({
    mutationFn: () => communityApi.startVoiceRoom(communitySlug),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['voice-room', communitySlug] });
      if (!res?.already) toast.success('Voice chat started');
      if (res?.active_room?.room_url) {
        window.open(res.active_room.room_url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not start voice chat'),
  });

  const endMutation = useMutation({
    mutationFn: () => communityApi.endVoiceRoom(communitySlug, activeRoom.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['voice-room', communitySlug] });
      toast.success('Voice chat ended');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not end voice chat'),
  });

  return (
    <section className="card voice-panel fade-in">
      <div className="voice-panel-head">
        <h3>Voice Chat</h3>
        <span className={`pill ${activeRoom ? 'role' : ''}`}>{activeRoom ? 'Live' : 'Offline'}</span>
      </div>
      {isLoading ? (
        <p className="muted"><span className="spinner" /> Checking voice room…</p>
      ) : activeRoom ? (
        <div className="voice-panel-body">
          <p className="muted" style={{ marginTop: 0 }}>
            {activeRoom.title || 'Community Voice Chat'}
            {activeRoom.host?.username ? ` · hosted by @${activeRoom.host.username}` : ''}
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <a className="btn" href={activeRoom.room_url} target="_blank" rel="noreferrer">
              Join Voice Chat
            </a>
            {canEnd && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => endMutation.mutate()}
                disabled={endMutation.isPending}
              >
                {endMutation.isPending ? 'Ending…' : 'End voice chat'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="voice-panel-body">
          <p className="muted" style={{ marginTop: 0, marginBottom: '0.8rem' }}>
            No active voice room right now. Start one and rally the trenchers live.
          </p>
          {canStart ? (
            <button
              type="button"
              className="btn"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
            >
              {startMutation.isPending ? 'Starting…' : 'Start Voice Chat'}
            </button>
          ) : (
            <p className="muted" style={{ margin: 0 }}>Join this community to start voice chats.</p>
          )}
        </div>
      )}
    </section>
  );
}
