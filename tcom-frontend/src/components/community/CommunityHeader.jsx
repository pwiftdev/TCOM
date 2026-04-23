import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { communityApi } from '../../api/communities';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { IconUsers, IconSettings, IconX } from '../ui/Icon';
import { MembersDialog } from './MembersDialog';
import { LoginWithX } from '../auth/LoginWithX';
import { UserXLink } from '../profile/UserXLink';

export function CommunityHeader({ community }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [membersOpen, setMembersOpen] = useState(false);

  const isOwner = user && community.owner_id === user.id;
  const isMember = !!community.is_member;

  const join = useMutation({
    mutationFn: () => communityApi.join(community.slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', community.slug] });
      qc.invalidateQueries({ queryKey: ['members', community.slug] });
      qc.invalidateQueries({ queryKey: ['communities'] });
      toast.success(`Joined ${community.name}`);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not join'),
  });

  const leave = useMutation({
    mutationFn: () => communityApi.leave(community.slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', community.slug] });
      qc.invalidateQueries({ queryKey: ['members', community.slug] });
      qc.invalidateQueries({ queryKey: ['communities'] });
      toast('Left community');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not leave'),
  });

  const memberCount = community.member_count ?? 0;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${community.slug}` : '';
  const shareText = `Join "${community.name}" Community on TCOM, group up trenchers, let's bagwork!`;

  function shareOnX() {
    if (!shareUrl) return;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <section className="community-hero fade-in">
        <div
          className="community-hero-banner"
          style={community.banner_url ? { backgroundImage: `url(${community.banner_url})` } : undefined}
        />
        <div className="community-hero-body">
          <h1>{community.name}</h1>
          <p className="community-hero-desc">{community.description || 'No description yet.'}</p>
          {(community.contract_address || community.pump_fun_link) && (
            <div className="community-token-meta">
              {community.contract_address && (
                <span className="token-chip" title={community.contract_address}>
                  CA: {community.contract_address}
                </span>
              )}
              {community.pump_fun_link && (
                <a
                  href={community.pump_fun_link}
                  target="_blank"
                  rel="noreferrer"
                  className="token-chip token-link"
                >
                  Pump.fun
                </a>
              )}
            </div>
          )}

          <div className="community-hero-meta">
            <span className="creator">
              <Avatar size="xs" src={community.creator?.avatar_url} name={community.creator?.username} />
              <span>
                Created by{' '}
                {community.creator?.username ? (
                  <UserXLink username={community.creator.username}>
                    @{community.creator.username}
                  </UserXLink>
                ) : (
                  <span className="muted">unknown</span>
                )}
              </span>
            </span>
            <span className="dim">·</span>
            <button
              type="button"
              className="members-button"
              onClick={() => setMembersOpen(true)}
              aria-label="View all members"
            >
              <IconUsers width={14} height={14} />
              {memberCount} member{memberCount === 1 ? '' : 's'}
            </button>
            <span className="pill">{community.visibility}</span>
          </div>

          <div className="community-hero-actions">
            {user ? (
              <>
                {!isOwner && !isMember && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => join.mutate()}
                    disabled={join.isPending}
                  >
                    {join.isPending ? 'Joining…' : 'Join community'}
                  </button>
                )}
                {!isOwner && isMember && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => leave.mutate()}
                    disabled={leave.isPending}
                  >
                    {leave.isPending ? 'Leaving…' : 'Leave'}
                  </button>
                )}
                {isOwner && (
                  <Link className="btn-ghost" to={`/c/${community.slug}/settings`}>
                    <IconSettings width={14} height={14} /> Manage
                  </Link>
                )}
                <button type="button" className="btn-ghost" onClick={shareOnX}>
                  <IconX width={14} height={14} /> Share on X
                </button>
              </>
            ) : (
              <>
                <LoginWithX label="Sign in with X to join" />
                <button type="button" className="btn-ghost" onClick={shareOnX}>
                  <IconX width={14} height={14} /> Share on X
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <MembersDialog
        open={membersOpen}
        onOpenChange={setMembersOpen}
        communitySlug={community.slug}
        memberCount={memberCount}
      />
    </>
  );
}
