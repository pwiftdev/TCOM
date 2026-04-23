import dayjs from 'dayjs';
import { LikeButton } from './LikeButton';

export function PostCard({ post, communitySlug }) {
  return (
    <div className="card">
      <p><strong>{post.users?.display_name || post.users?.username}</strong> @{post.users?.username}</p>
      <p>{post.content}</p>
      <small>{dayjs(post.created_at).format('MMM D, YYYY h:mm A')}</small>
      <div style={{ marginTop: 8 }}><LikeButton post={post} communitySlug={communitySlug} /></div>
    </div>
  );
}
