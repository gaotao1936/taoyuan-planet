'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PostCard from '@/components/PostCard';
import { Post } from '@/lib/types';

const tabs = [
  { key: 'recommend', label: '推荐', icon: '✨' },
  { key: 'newest', label: '最新', icon: '🕐' },
  { key: 'hot', label: '热门', icon: '🔥' },
  { key: 'mine', label: '我的', icon: '👤' },
];

const getCurrentUserId = (): number | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('taoyuan_user');
  if (!user) return null;
  try { return JSON.parse(user).id; } catch { return null; }
};

const hotTopics = [
  '非遗传承', '青花瓷', '手工皮具', '木雕艺术', '苏绣教程',
  '手绘明信片', '编织入门', '漆器工艺', '摄影分享', '书法练习',
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('recommend');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts?pageSize=9999');
      const data = await res.json();
      if (data.items?.length > 0) {
        setPosts(data.items);
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('taoyuan_posts');
        if (stored) setPosts(JSON.parse(stored));
      }
    } catch {
      const stored = localStorage.getItem('taoyuan_posts');
      if (stored) setPosts(JSON.parse(stored));
    }
    setLoaded(true);
  };

  const sortedPosts = () => {
    const userId = getCurrentUserId();
    switch (activeTab) {
      case 'newest':
        return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case 'hot':
        return [...posts].sort((a, b) => b.likes - a.likes);
      case 'mine':
        return userId ? posts.filter(p => p.userId === userId) : [];
      default:
        return posts;
    }
  };

  const handleLike = (id: number) => {
    setPosts(prev => {
      const updated = prev.map(p =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      );
      return updated;
    });
    // Also persist via API
    fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'like' }),
    }).catch(() => {});
  };

  const handleCollect = (id: number) => {
    setPosts(prev => {
      const updated = prev.map(p =>
        p.id === id ? { ...p, collected: !p.collected } : p
      );
      return updated;
    });
    fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'collect' }),
    }).catch(() => {});
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    );
  }

  const displayPosts = sortedPosts();

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>社区</h1>
              <p className="text-[#999] mt-1">发现创作灵感，遇见同好</p>
            </div>
            <Link href="/post-create"
              className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#E07B5A] text-white text-sm font-medium rounded-full hover:bg-[#C56A4A] transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              发布帖子
            </Link>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Main feed */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-6 border border-black/5 sticky top-[88px] z-10">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                    activeTab === tab.key ? 'text-[#E07B5A]' : 'text-[#999] hover:text-[#2C2C2C]'
                  }`}
                >
                  <span className="hidden sm:inline mr-1">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="community-tab-bg"
                      className="absolute inset-0 bg-[#E07B5A]/8 rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Posts */}
            {displayPosts.length > 0 ? (
              <div className="space-y-4">
                {displayPosts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={handleLike} onCollect={handleCollect} />
                ))}
              </div>
            ) : activeTab === 'mine' && !getCurrentUserId() ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
                <span className="text-5xl block mb-4">👤</span>
                <p className="text-[#999] mb-4">请先登录后查看你的帖子</p>
                <Link href="/login" className="inline-block px-6 py-2.5 bg-[#E07B5A] text-white rounded-full text-sm font-medium hover:bg-[#C56A4A] transition-colors">去登录</Link>
              </div>
            ) : activeTab === 'mine' ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
                <span className="text-5xl block mb-4">📝</span>
                <p className="text-[#999] mb-4">你还没有发布任何帖子</p>
                <Link href="/post-create" className="inline-block px-6 py-2.5 bg-[#E07B5A] text-white rounded-full text-sm font-medium hover:bg-[#C56A4A] transition-colors">发布第一条帖子</Link>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
                <span className="text-5xl block mb-4">💬</span>
                <p className="text-[#999] mb-4">暂无帖子，来发布第一条内容吧</p>
                <Link href="/post-create" className="inline-block px-6 py-2.5 bg-[#E07B5A] text-white rounded-full text-sm font-medium hover:bg-[#C56A4A] transition-colors">发布帖子</Link>
              </div>
            )}
          </div>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-[88px] space-y-4">
              {/* Publish CTA */}
              <div className="bg-gradient-to-br from-[#E07B5A] to-[#F0A88C] rounded-2xl p-5 text-white">
                <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Noto Serif SC', serif" }}>分享你的创作</h3>
                <p className="text-white/70 text-xs mb-4">记录手作过程，展示作品，遇见同好</p>
                <Link href="/post-create"
                  className="inline-block w-full py-2.5 bg-white text-[#E07B5A] text-sm font-semibold rounded-xl text-center hover:bg-white/95 transition-colors">
                  发布帖子
                </Link>
              </div>

              {/* Hot topics */}
              <div className="bg-white rounded-2xl p-5 border border-black/5">
                <h4 className="font-semibold text-[#2C2C2C] text-sm mb-4 flex items-center gap-2">
                  <span>🔥</span> 热门话题
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {hotTopics.map(topic => (
                    <span key={topic}
                      className="text-xs bg-[#FEF5EC] text-[#5C5C5C] px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#E07B5A]/10 hover:text-[#E07B5A] transition-colors">
                      #{topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Community guidelines */}
              <div className="bg-white rounded-2xl p-5 border border-black/5">
                <h4 className="font-semibold text-[#2C2C2C] text-sm mb-3 flex items-center gap-2">
                  <span>📋</span> 社区公约
                </h4>
                <ul className="text-xs text-[#999] space-y-2">
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    尊重原创，转载需注明出处
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    友善交流，禁止人身攻击
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    真实分享，拒绝虚假内容
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile floating post button */}
      <Link href="/post-create" className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-[#E07B5A] to-[#D4946A] text-white rounded-full shadow-lg shadow-[#E07B5A]/20 flex items-center justify-center hover:scale-110 transition-transform z-20 lg:hidden">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}
