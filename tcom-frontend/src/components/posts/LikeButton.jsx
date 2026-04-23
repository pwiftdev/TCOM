import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../../api/posts';

export function LikeButton({ post, communitySlug }) {
  const qc = useQueryClient();
  const mutation = useMutation({ mutationFn: () => postApi.toggleLike(post.id), onSuccess: () => qc.invalidateQueries({ queryKey: ['posts', communitySlug] }) });
  return <button className="btn" onClick={() => mutation.mutate()}>♥ {post.like_count}</button>;
}
