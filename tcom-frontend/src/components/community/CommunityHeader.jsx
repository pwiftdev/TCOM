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

function shortAddress(addr) {
  if (!addr) return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function CommunityHeader({ community }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [membersOpen, setMembersOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
  const postCount = community.post_count ?? 0;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${community.slug}` : '';
  const shareText = `Join "${community.name}" Community on TCOM, group up trenchers, let's bagwork!`;

  function shareOnX() {
    if (!shareUrl) return;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function copyCA() {
    if (!community.contract_address) return;
    try {
      await navigator.clipboard.writeText(community.contract_address);
      setCopied(true);
      toast.success('Contract copied');
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error('Could not copy');
    }
  }

  return (
    <>
      <section className="community-hero fade-in">
        <div
          className="community-hero-banner"
          style={community.banner_url ? { backgroundImage: `url(${community.banner_url})` } : undefined}
        >
          <div className="community-hero-banner-scrim" />
        </div>

        <div className="community-hero-body">
          <div className="community-hero-titlerow">
            <h1>{community.name}</h1>
            <span className={`pill visibility-pill ${community.visibility}`}>{community.visibility}</span>
          </div>
          {community.description && (
            <p className="community-hero-desc">{community.description}</p>
          )}

          {(community.contract_address || community.pump_fun_link) && (
            <div className="community-token-meta">
              {community.contract_address && (
                <button
                  type="button"
                  className="token-chip token-ca"
                  onClick={copyCA}
                  title={`Click to copy · ${community.contract_address}`}
                >
                  <span className="token-chip-label">CA</span>
                  <span className="token-chip-value">{shortAddress(community.contract_address)}</span>
                  <span className="token-chip-action">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
              {community.pump_fun_link && (
                <a
                  href={community.pump_fun_link}
                  target="_blank"
                  rel="noreferrer"
                  className="token-chip token-link"
                >
                  <span className="token-dot" /> Pump.fun
                </a>
              )}
            </div>
          )}

          <div className="community-hero-meta">
            <span className="creator">
              <Avatar size="xs" src={community.creator?.avatar_url} name={community.creator?.username} />
              <span className="muted">Created by</span>
              {community.creator?.username ? (
                <UserXLink username={community.creator.username}>
                  <strong>@{community.creator.username}</strong>
                </UserXLink>
              ) : (
                <span className="muted">unknown</span>
              )}
            </span>

            <button
              type="button"
              className="meta-stat members-button"
              onClick={() => setMembersOpen(true)}
              aria-label="View all members"
            >
              <IconUsers width={14} height={14} />
              <strong>{memberCount.toLocaleString()}</strong>
              <span>member{memberCount === 1 ? '' : 's'}</span>
            </button>

            <span className="meta-stat">
              <strong>{postCount.toLocaleString()}</strong>
              <span>post{postCount === 1 ? '' : 's'}</span>
            </span>
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
