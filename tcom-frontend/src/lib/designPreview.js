export const DESIGN_PREVIEW = import.meta.env.VITE_DESIGN_PREVIEW === 'true';

const mockUser = {
  id: 'user-design-1',
  username: 'bakardisol',
  display_name: 'Bakar Disol',
  avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=240&q=80&auto=format&fit=crop',
  bio: 'Design mode user for local UI iteration.',
  followers_count: 12840,
  following_count: 912,
  created_at: '2023-06-11T12:00:00.000Z',
};

const mockCommunities = [
  {
    id: 'comm-1',
    slug: 'sol-alpha-trench',
    name: 'SOL Alpha Trench',
    description: 'Fast signals, cleaner entries, zero fluff.',
    visibility: 'public',
    owner_id: mockUser.id,
    my_role: 'owner',
    is_member: true,
    member_count: 1842,
    post_count: 232,
    contract_address: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrpump',
    pump_fun_link: 'https://pump.fun/coin/9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrpump',
    banner_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1600&q=80&auto=format&fit=crop',
    creator: { username: mockUser.username, avatar_url: mockUser.avatar_url },
    created_at: '2025-01-09T12:00:00.000Z',
  },
  {
    id: 'comm-2',
    slug: 'eth-macro-club',
    name: 'ETH Macro Club',
    description: 'Macro + ETH structure, no panic posting.',
    visibility: 'public',
    owner_id: 'user-design-2',
    my_role: 'member',
    is_member: true,
    member_count: 934,
    post_count: 105,
    contract_address: '',
    pump_fun_link: '',
    banner_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1600&q=80&auto=format&fit=crop',
    creator: { username: 'macrohawk', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&q=80&auto=format&fit=crop' },
    created_at: '2025-02-19T12:00:00.000Z',
  },
  {
    id: 'comm-3',
    slug: 'memecoin-warroom',
    name: 'Memecoin Warroom',
    description: 'Meme scans, thesis drops, and high-signal threads.',
    visibility: 'public',
    owner_id: 'user-design-3',
    my_role: null,
    is_member: false,
    member_count: 4421,
    post_count: 548,
    contract_address: '8NhSxM6C2juCvMNdP8W7TH2zQvXopRj6pump',
    pump_fun_link: 'https://pump.fun/coin/8NhSxM6C2juCvMNdP8W7TH2zQvXopRj6pump',
    banner_url: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=1600&q=80&auto=format&fit=crop',
    creator: { username: 'degenqueen', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&q=80&auto=format&fit=crop' },
    created_at: '2025-03-03T12:00:00.000Z',
  },
];

const postsByCommunity = {
  'sol-alpha-trench': [
    {
      id: 'post-1',
      community_slug: 'sol-alpha-trench',
      author_id: mockUser.id,
      author_role: 'owner',
      content: 'New setup forming on SOL. Watching reclaim above 184 for continuation.',
      media_urls: [],
      like_count: 28,
      reply_count: 2,
      view_count: 341,
      liked_by_me: true,
      is_pinned: true,
      created_at: '2026-04-23T11:20:00.000Z',
      users: { username: mockUser.username, display_name: mockUser.display_name, avatar_url: mockUser.avatar_url },
    },
    {
      id: 'post-2',
      community_slug: 'sol-alpha-trench',
      author_id: 'user-design-4',
      author_role: 'member',
      content: 'CA watchlist for this week: 7A4bCk3pTzWm3NrvuUjA9sN2mPq6nKrP3LqgQYhYfzz',
      media_urls: [],
      like_count: 13,
      reply_count: 1,
      view_count: 188,
      liked_by_me: false,
      is_pinned: false,
      created_at: '2026-04-23T14:48:00.000Z',
      users: {
        username: 'solsniper',
        display_name: 'SOL Sniper',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&q=80&auto=format&fit=crop',
      },
    },
  ],
  'eth-macro-club': [],
  'memecoin-warroom': [],
};

const repliesByPost = {
  'post-1': [
    {
      id: 'reply-1',
      content: 'Agree. Funding cooling off too.',
      created_at: '2026-04-23T12:10:00.000Z',
      media_urls: [],
      users: { username: 'macrohawk', display_name: 'Macro Hawk', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&q=80&auto=format&fit=crop' },
    },
  ],
  'post-2': [],
};

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

export const designData = {
  user: clone(mockUser),
  async authMe() {
    return clone(mockUser);
  },
  async communitiesList() {
    return clone(mockCommunities);
  },
  async communitiesGet(slug) {
    const c = mockCommunities.find((x) => x.slug === slug);
    if (!c) throw new Error('Community not found');
    return clone(c);
  },
  async communityJoin(slug) {
    const c = mockCommunities.find((x) => x.slug === slug);
    if (!c) throw new Error('Community not found');
    if (!c.is_member) {
      c.is_member = true;
      c.my_role = 'member';
      c.member_count += 1;
    }
    return { ok: true };
  },
  async communityLeave(slug) {
    const c = mockCommunities.find((x) => x.slug === slug);
    if (!c) throw new Error('Community not found');
    if (c.is_member && c.owner_id !== mockUser.id) {
      c.is_member = false;
      c.my_role = null;
      c.member_count = Math.max(0, c.member_count - 1);
    }
    return { ok: true };
  },
  async members(slug) {
    const c = mockCommunities.find((x) => x.slug === slug);
    if (!c) return [];
    return [
      { id: 'mem-1', user_id: mockUser.id, role: c.owner_id === mockUser.id ? 'owner' : (c.my_role || 'member'), users: mockUser },
      {
        id: 'mem-2',
        user_id: 'user-design-2',
        role: 'member',
        users: { username: 'macrohawk', display_name: 'Macro Hawk', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&q=80&auto=format&fit=crop' },
      },
    ];
  },
  async postsList(slug, sort = 'latest') {
    const list = [...(postsByCommunity[slug] || [])];
    if (sort === 'trending') {
      list.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return clone(list);
  },
  async postGet(id) {
    const post = Object.values(postsByCommunity).flat().find((p) => p.id === id);
    if (!post) throw new Error('Post not found');
    return { ...clone(post), replies: clone(repliesByPost[id] || []) };
  },
  async postCreate(slug, payload) {
    const list = postsByCommunity[slug] || (postsByCommunity[slug] = []);
    const newPost = {
      id: `post-${Date.now()}`,
      community_slug: slug,
      author_id: mockUser.id,
      author_role: 'member',
      content: payload?.content || '',
      media_urls: payload?.media_urls || [],
      like_count: 0,
      reply_count: 0,
      view_count: 0,
      liked_by_me: false,
      is_pinned: false,
      created_at: new Date().toISOString(),
      users: { username: mockUser.username, display_name: mockUser.display_name, avatar_url: mockUser.avatar_url },
    };
    list.unshift(newPost);
    const c = mockCommunities.find((x) => x.slug === slug);
    if (c) c.post_count += 1;
    return clone(newPost);
  },
  async postReply(id, payload) {
    const list = repliesByPost[id] || (repliesByPost[id] = []);
    list.push({
      id: `reply-${Date.now()}`,
      content: payload?.content || '',
      created_at: new Date().toISOString(),
      media_urls: payload?.media_urls || [],
      users: { username: mockUser.username, display_name: mockUser.display_name, avatar_url: mockUser.avatar_url },
    });
    const post = Object.values(postsByCommunity).flat().find((p) => p.id === id);
    if (post) post.reply_count = (post.reply_count || 0) + 1;
    return { ok: true };
  },
  async postLike(id) {
    const post = Object.values(postsByCommunity).flat().find((p) => p.id === id);
    if (!post) return { liked: false };
    const nextLiked = !post.liked_by_me;
    post.liked_by_me = nextLiked;
    post.like_count = Math.max(0, (post.like_count || 0) + (nextLiked ? 1 : -1));
    return { liked: nextLiked };
  },
  async postPin(id, pinned) {
    const post = Object.values(postsByCommunity).flat().find((p) => p.id === id);
    if (post) post.is_pinned = Boolean(pinned);
    return { ok: true };
  },
  async postDelete(id) {
    for (const slug of Object.keys(postsByCommunity)) {
      const idx = postsByCommunity[slug].findIndex((p) => p.id === id);
      if (idx >= 0) {
        postsByCommunity[slug].splice(idx, 1);
        const c = mockCommunities.find((x) => x.slug === slug);
        if (c) c.post_count = Math.max(0, c.post_count - 1);
        break;
      }
    }
    return { ok: true };
  },
  async postView(id) {
    const post = Object.values(postsByCommunity).flat().find((p) => p.id === id);
    if (post) post.view_count = (post.view_count || 0) + 1;
    return { ok: true };
  },
  async profile(username) {
    if (username === mockUser.username) return clone(mockUser);
    return {
      ...clone(mockUser),
      id: 'user-design-alt',
      username,
      display_name: username,
    };
  },
  async profileCommunities() {
    return clone(mockCommunities.map((c, i) => ({
      ...c,
      role: i === 0 ? 'owner' : i === 1 ? 'moderator' : 'member',
    })));
  },
  async online() {
    return { online: 187, window_seconds: 120 };
  },
};
