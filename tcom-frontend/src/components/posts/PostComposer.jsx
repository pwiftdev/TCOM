import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../../api/posts';

export function PostComposer({ communitySlug }) {
  const [content, setContent] = useState('');
  const qc = useQueryClient();
  const mutation = useMutation({ mutationFn: () => postApi.createInCommunity(communitySlug, { content }), onSuccess: () => { setContent(''); qc.invalidateQueries({ queryKey: ['posts', communitySlug] }); } });
  return <div className="card"><textarea rows={4} maxLength={500} value={content} onChange={(e) => setContent(e.target.value)} /><button className="btn" onClick={() => mutation.mutate()} disabled={!content.trim()}>Post</button></div>;
}
