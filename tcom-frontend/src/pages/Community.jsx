import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../api/communities';
import { postApi } from '../api/posts';
import { CommunityHeader } from '../components/community/CommunityHeader';
import { PostComposer } from '../components/posts/PostComposer';
import { PostCard } from '../components/posts/PostCard';
import { useJoinCommunity } from '../hooks/useCommunity';

export default function Community() {
  const { slug } = useParams();
  const { data: community } = useQuery({ queryKey: ['community', slug], queryFn: () => communityApi.get(slug) });
  const { data: posts } = useQuery({ queryKey: ['posts', slug], queryFn: () => postApi.listByCommunity(slug) });
  const joinMutation = useJoinCommunity(slug);

  return (
    <div className="container grid">
      <CommunityHeader community={community} onJoin={() => joinMutation.mutate()} />
      <div><Link className="btn" to={`/c/${slug}/settings`}>Settings</Link></div>
      <PostComposer communitySlug={slug} />
      <div className="grid">{(posts || []).map((post) => <PostCard key={post.id} post={post} communitySlug={slug} />)}</div>
    </div>
  );
}
