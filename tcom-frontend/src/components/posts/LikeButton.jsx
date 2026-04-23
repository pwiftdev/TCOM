import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postApi } from '../../api/posts';
import { useAuthStore } from '../../store/authStore';
import { IconHeart, IconHeartFill } from '../ui/Icon';

export function LikeButton({ post, communitySlug, listKey }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const key = listKey || ['posts', communitySlug];

  const mutation = useMutation({
    mutationFn: () => postApi.toggleLike(post.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData(key, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((p) =>
          p.id === post.id
            ? {
                ...p,
                liked_by_me: !p.liked_by_me,
                like_count: p.liked_by_me
                  ? Math.max(0, (p.like_count || 1) - 1)
                  : (p.like_count || 0) + 1,
              }
            : p
        );
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      toast.error('Could not update like');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const liked = !!post.liked_by_me;

  function handleClick() {
    if (!user) {
      toast('Sign in with X to like posts');
      return;
    }
    mutation.mutate();
  }

  return (
    <button
      type="button"
      className={`btn-icon ${liked ? 'liked' : ''}`}
      onClick={handleClick}
      aria-label={liked ? 'Unlike' : 'Like'}
      aria-pressed={liked}
    >
      {liked ? <IconHeartFill width={16} height={16} /> : <IconHeart width={16} height={16} />}
      <span>{post.like_count || 0}</span>
    </button>
  );
}
