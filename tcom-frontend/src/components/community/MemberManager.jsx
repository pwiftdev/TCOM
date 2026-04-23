import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { communityApi } from '../../api/communities';
import { Avatar } from '../ui/Avatar';
import { Dialog } from '../ui/Dialog';
import {
  IconMoreVertical,
  IconSearch,
  IconShield,
  IconBan,
  IconExternalLink,
  IconX,
} from '../ui/Icon';

const ROLE_PRIORITY = { owner: 0, moderator: 1, member: 2 };

function RoleBadge({ role }) {
  if (role === 'owner') return <span className="pill role">Owner</span>;
  if (role === 'moderator') return <span className="pill role">Moderator</span>;
  return <span className="pill">Member</span>;
}

export function MemberManager({ community }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [actionTarget, setActionTarget] = useState(null);

  const canModerate = ['owner', 'moderator'].includes(community?.my_role || '');
  const isOwner = community?.my_role === 'owner';

  const membersQuery = useQuery({
    queryKey: ['members', community.slug, 'manage'],
    queryFn: () => communityApi.members(community.slug),
    enabled: canModerate,
    staleTime: 10_000,
  });

  const bansQuery = useQuery({
    queryKey: ['bans', community.slug],
    queryFn: () => communityApi.listBans(community.slug),
    enabled: canModerate,
    staleTime: 10_000,
  });

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ['members', community.slug] });
    qc.invalidateQueries({ queryKey: ['members', community.slug, 'manage'] });
    qc.invalidateQueries({ queryKey: ['bans', community.slug] });
  }

  const modMutation = useMutation({
    mutationFn: ({ username, action }) => communityApi.setModerator(community.slug, { username, action }),
    onSuccess: (_, vars) => {
      invalidateAll();
      toast.success(vars.action === 'grant' ? 'Moderator granted' : 'Moderator revoked');
      setActionTarget(null);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not update role'),
  });

  const banMutation = useMutation({
    mutationFn: ({ username }) => communityApi.ban(community.slug, { username }),
    onSuccess: () => {
      invalidateAll();
      toast.success('Member banned');
      setActionTarget(null);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not ban'),
  });

  const unbanMutation = useMutation({
    mutationFn: ({ username }) => communityApi.unban(community.slug, { username }),
    onSuccess: () => {
      invalidateAll();
      toast.success('Member unbanned');
      setActionTarget(null);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not unban'),
  });

  const members = membersQuery.data || [];
  const bans = bansQuery.data || [];

  const sortedMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? members.filter((m) => {
          const u = m.users?.username?.toLowerCase() || '';
          const d = m.users?.display_name?.toLowerCase() || '';
          return u.includes(q) || d.includes(q);
        })
      : members;
    return [...filtered].sort((a, b) => {
      const ra = ROLE_PRIORITY[a.role] ?? 9;
      const rb = ROLE_PRIORITY[b.role] ?? 9;
      if (ra !== rb) return ra - rb;
      const da = new Date(a.joined_at || 0).getTime();
      const db = new Date(b.joined_at || 0).getTime();
      return db - da;
    });
  }, [members, search]);

  const filteredBans = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bans;
    return bans.filter((b) => {
      const u = b.users?.username?.toLowerCase() || '';
      return u.includes(q);
    });
  }, [bans, search]);

  if (!canModerate) return null;

  const target = actionTarget;
  const busy = modMutation.isPending || banMutation.isPending || unbanMutation.isPending;

  return (
    <div className="member-manager">
      <div className="member-manager-head">
        <div>
          <h3 style={{ margin: 0 }}>Members</h3>
          <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
            {members.length} total · {members.filter((m) => m.role === 'moderator').length} moderator
            {members.filter((m) => m.role === 'moderator').length === 1 ? '' : 's'}
            {bans.length > 0 ? ` · ${bans.length} banned` : ''}
          </p>
        </div>
        <div className="member-search">
          <IconSearch width={14} height={14} />
          <input
            type="text"
            placeholder="Search username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {membersQuery.isLoading ? (
        <div className="muted" style={{ padding: '1rem 0' }}><span className="spinner" /> Loading members…</div>
      ) : sortedMembers.length === 0 ? (
        <div className="muted" style={{ padding: '1rem 0', fontSize: '0.9rem' }}>No members match your search.</div>
      ) : (
        <ul className="member-manager-list">
          {sortedMembers.map((m) => {
            const u = m.users || {};
            const username = u.username || 'unknown';
            return (
              <li key={m.id || m.user_id} className="member-manager-row">
                <Avatar size="sm" src={u.avatar_url} name={username} />
                <div className="member-info">
                  <strong>@{username}</strong>
                  {u.display_name && <span>{u.display_name}</span>}
                </div>
                <RoleBadge role={m.role} />
                <button
                  type="button"
                  className="btn-icon member-kebab"
                  onClick={() => setActionTarget({ type: 'member', member: m })}
                  aria-label={`Actions for @${username}`}
                  title="More actions"
                >
                  <IconMoreVertical width={18} height={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {filteredBans.length > 0 && (
        <div className="member-manager-bans">
          <h4>Banned members</h4>
          <ul className="member-manager-list">
            {filteredBans.map((b) => {
              const u = b.users || {};
              const username = u.username || 'unknown';
              return (
                <li key={b.id || b.user_id} className="member-manager-row banned">
                  <Avatar size="sm" src={u.avatar_url} name={username} />
                  <div className="member-info">
                    <strong>@{username}</strong>
                    <span className="danger-text">Banned</span>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => unbanMutation.mutate({ username })}
                    disabled={unbanMutation.isPending}
                  >
                    Unban
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Dialog
        open={!!target}
        onOpenChange={(v) => !v && setActionTarget(null)}
        title={target ? `@${target.member?.users?.username || 'member'}` : ''}
        description={target ? `Role: ${target.member?.role || 'member'}` : ''}
      >
        {target && (
          <MemberActionsList
            member={target.member}
            isOwner={isOwner}
            busy={busy}
            onPromote={(username) => modMutation.mutate({ username, action: 'grant' })}
            onDemote={(username) => modMutation.mutate({ username, action: 'revoke' })}
            onBan={(username) => banMutation.mutate({ username })}
          />
        )}
      </Dialog>
    </div>
  );
}

function MemberActionsList({ member, isOwner, busy, onPromote, onDemote, onBan }) {
  const u = member?.users || {};
  const username = u.username;
  const role = member?.role;
  const isTargetOwner = role === 'owner';
  const isTargetMod = role === 'moderator';

  return (
    <div className="member-actions-list">
      {isOwner && !isTargetOwner && !isTargetMod && (
        <button
          type="button"
          className="member-action"
          onClick={() => onPromote(username)}
          disabled={busy}
        >
          <span className="member-action-icon"><IconShield width={16} height={16} /></span>
          <span className="member-action-text">
            <strong>Promote to moderator</strong>
            <small>Grants moderation privileges</small>
          </span>
        </button>
      )}
      {isOwner && isTargetMod && (
        <button
          type="button"
          className="member-action"
          onClick={() => onDemote(username)}
          disabled={busy}
        >
          <span className="member-action-icon"><IconShield width={16} height={16} /></span>
          <span className="member-action-text">
            <strong>Revoke moderator</strong>
            <small>Remove moderation privileges</small>
          </span>
        </button>
      )}
      {!isTargetOwner && (
        <button
          type="button"
          className="member-action danger"
          onClick={() => {
            if (window.confirm(`Ban @${username}? They will be removed and blocked from rejoining.`)) {
              onBan(username);
            }
          }}
          disabled={busy}
        >
          <span className="member-action-icon"><IconBan width={16} height={16} /></span>
          <span className="member-action-text">
            <strong>Ban member</strong>
            <small>Removes and blocks from rejoining</small>
          </span>
        </button>
      )}
      {username && (
        <a
          className="member-action"
          href={`https://x.com/${username}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="member-action-icon"><IconX width={14} height={14} /></span>
          <span className="member-action-text">
            <strong>View X profile</strong>
            <small>Opens x.com/@{username}</small>
          </span>
          <IconExternalLink width={14} height={14} />
        </a>
      )}
      {isTargetOwner && (
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          The community owner cannot be moderated.
        </p>
      )}
    </div>
  );
}
