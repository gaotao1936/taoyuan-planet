'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/lib/types';

export default function PostCard({ post, onLike, onCollect }: {
  post: Post;
  onLike?: (id: number) => void;
  onCollect?: (id: number) => void;
}) {
  const imageCount = post.images?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-black/5 hover:border-[#E07B5A]/15 hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Author header — clickable to detail */}
      <Link href={`/post-detail/${post.id}`} className="block">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <img src={post.userAvatar} alt="" className="w-10 h-10 rounded-full bg-[#FEF5EC] ring-1 ring-black/5" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-[#2C2C2C]">{post.userName}</div>
            <div className="text-xs text-[#bbb]">{post.createdAt?.slice(0, 10)}</div>
          </div>
          {post.type && (
            <span className="text-xs bg-[#FEF5EC] text-[#E07B5A] px-3 py-1 rounded-full font-medium shrink-0">
              {post.type}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <Link href={`/post-detail/${post.id}`} className="block px-5">
        <p className="text-sm text-[#5C5C5C] leading-relaxed mb-4 line-clamp-4">{post.content}</p>

        {/* Images — adaptive grid */}
        {imageCount > 0 && (
          <div className={`grid gap-1.5 mb-4 ${
            imageCount === 1 ? 'grid-cols-1' :
            imageCount === 2 ? 'grid-cols-2' :
            imageCount === 4 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {post.images.slice(0, 9).map((img, i) => (
              <div key={i} className={`relative overflow-hidden rounded-xl bg-[#FEF5EC] ${
                imageCount === 1 ? 'aspect-[16/9]' : 'aspect-square'
              }`}>
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {i === 8 && post.images.length > 9 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">
                    +{post.images.length - 9}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Link>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-1.5 px-5 mb-3 flex-wrap">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-[#E07B5A] bg-[#E07B5A]/6 px-2.5 py-1 rounded-full font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center gap-6 text-[#bbb] text-sm px-5 pb-4 pt-2 border-t border-black/3">
        <button
          onClick={(e) => { e.preventDefault(); onLike?.(post.id); }}
          className={`flex items-center gap-1.5 transition-colors ${
            post.liked ? 'text-[#E07B5A]' : 'hover:text-[#E07B5A]'
          }`}
        >
          <svg className="w-4 h-4" fill={post.liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {post.likes > 0 && post.likes}
        </button>
        <Link href={`/post-detail/${post.id}`} className="flex items-center gap-1.5 hover:text-[#2D6A6A] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          {post.comments?.length > 0 && post.comments.length}
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); onCollect?.(post.id); }}
          className={`flex items-center gap-1.5 transition-colors ml-auto ${
            post.collected ? 'text-[#C9A96E]' : 'hover:text-[#C9A96E]'
          }`}
        >
          <svg className="w-4 h-4" fill={post.collected ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          {post.collected ? '已收藏' : '收藏'}
        </button>
      </div>
    </motion.div>
  );
}
