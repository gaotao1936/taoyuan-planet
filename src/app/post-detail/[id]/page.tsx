'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post, PostComment } from '@/lib/types';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch {
      // Fallback to localStorage
      const stored = localStorage.getItem('taoyuan_posts');
      if (stored) {
        const found = JSON.parse(stored).find((p: Post) => p.id === postId);
        if (found) setPost(found);
      }
    }
    setLoaded(true);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">📝</span>
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">帖子未找到</h2>
          <Link href="/community" className="text-[#E07B5A] hover:underline">返回社区</Link>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    setPost(prev => prev ? {
      ...prev,
      liked: !prev.liked,
      likes: prev.likes + (prev.liked ? -1 : 1)
    } : null);
    fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'like' }),
    }).catch(() => {});
  };

  const handleCollect = async () => {
    setPost(prev => prev ? { ...prev, collected: !prev.collected } : null);
    fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'collect' }),
    }).catch(() => {});
  };

  const handleComment = async () => {
    if (!commentText.trim() || loading) return;
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('taoyuan_user') || 'null');
    const newComment: PostComment = {
      id: Date.now(),
      userId: user?.id || 0,
      userName: user?.name || '匿名用户',
      content: commentText.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    // Update local state immediately
    setPost(prev => prev ? {
      ...prev,
      comments: [...prev.comments, newComment]
    } : null);
    setCommentText('');

    // Persist via API
    fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'comment', userId: newComment.userId, userName: newComment.userName, content: newComment.content }),
    }).catch(() => {});
    setLoading(false);
  };

  const imageCount = post.images?.length || 0;

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back button */}
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#2C2C2C] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          {/* Post content */}
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden mb-6">
            {/* Author header */}
            <div className="flex items-center gap-3 p-5 md:p-6 pb-4">
              <img src={post.userAvatar} alt="" className="w-12 h-12 rounded-full bg-[#FEF5EC] ring-1 ring-black/5" />
              <div className="flex-1">
                <div className="font-semibold text-[#2C2C2C]">{post.userName}</div>
                <div className="text-xs text-[#bbb]">{post.createdAt}</div>
              </div>
              {post.type && (
                <span className="text-xs bg-[#FEF5EC] text-[#E07B5A] px-3 py-1 rounded-full font-medium">{post.type}</span>
              )}
            </div>

            {/* Content body */}
            <div className="px-5 md:px-6">
              <p className="text-[#5C5C5C] leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>

              {/* Images — adaptive grid */}
              {imageCount > 0 && (
                <div className={`grid gap-2 mb-6 ${
                  imageCount === 1 ? 'grid-cols-1' :
                  imageCount === 2 ? 'grid-cols-2' :
                  imageCount === 4 ? 'grid-cols-2' :
                  'grid-cols-3'
                }`}>
                  {post.images.map((img, i) => (
                    <img key={i} src={img} alt="" className={`w-full rounded-xl bg-[#FEF5EC] object-cover ${
                      imageCount === 1 ? 'max-h-96' : 'aspect-square'
                    }`} />
                  ))}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs text-[#E07B5A] bg-[#E07B5A]/6 px-3 py-1 rounded-full font-medium">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions bar */}
            <div className="flex items-center gap-6 px-5 md:px-6 py-4 border-t border-black/5 bg-[#FEF5EC]/30">
              <button onClick={handleLike} className={`flex items-center gap-2 text-sm transition-colors ${post.liked ? 'text-[#E07B5A]' : 'text-[#999] hover:text-[#E07B5A]'}`}>
                <svg className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {post.likes > 0 && post.likes}
              </button>
              <span className="flex items-center gap-2 text-sm text-[#999]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                {post.comments?.length || 0}
              </span>
              <button onClick={handleCollect} className={`flex items-center gap-2 text-sm ml-auto transition-colors ${post.collected ? 'text-[#C9A96E]' : 'text-[#999] hover:text-[#C9A96E]'}`}>
                <svg className="w-5 h-5" fill={post.collected ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                {post.collected ? '已收藏' : '收藏'}
              </button>
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-black/5">
            <h3 className="font-bold text-[#2C2C2C] mb-6" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              评论 ({post.comments?.length || 0})
            </h3>

            {/* Comment input */}
            <div className="flex gap-3 mb-8">
              <div className="w-9 h-9 rounded-full bg-[#E07B5A]/10 flex items-center justify-center text-[#E07B5A] text-sm font-bold shrink-0">
                {JSON.parse(localStorage.getItem('taoyuan_user') || 'null')?.name?.[0] || '我'}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                  placeholder="写下你的评论..."
                  className="flex-1 px-4 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || loading}
                  className="px-4 py-2.5 bg-[#E07B5A] text-white text-sm font-medium rounded-xl hover:bg-[#C56A4A] transition-colors disabled:opacity-40 shrink-0"
                >
                  发送
                </button>
              </div>
            </div>

            {/* Comments list */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3 py-3 border-b border-black/5 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-[#E07B5A]/10 flex items-center justify-center text-sm font-medium text-[#E07B5A] shrink-0">
                      {comment.userName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#2C2C2C]">{comment.userName}</span>
                        <span className="text-xs text-[#bbb]">{comment.createdAt?.slice(0, 10)}</span>
                      </div>
                      <p className="text-sm text-[#5C5C5C]">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-[#bbb] text-sm">
                <span className="text-3xl block mb-3">💬</span>
                暂无评论，来说两句吧
              </div>
            )}
          </div>

          {/* Back to community */}
          <div className="text-center mt-8">
            <Link href="/community" className="inline-flex items-center gap-2 text-sm text-[#E07B5A] hover:underline font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              返回社区
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
