'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const postTypes = ['原创分享', '好物推荐', '创作日常', '求助交流'];
const presetTags = ['手工艺', '陶瓷', '非遗', '设计', '日常', '教程', '开箱', '收藏', '书法', '绘画', '编织', '木作'];

export default function PostCreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [type, setType] = useState('原创分享');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages: string[] = [];
    let loaded = 0;
    Array.from(files).slice(0, 9 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result as string);
        loaded++;
        if (loaded === Math.min(files.length, 9 - images.length)) {
          setImages(prev => [...prev, ...newImages].slice(0, 9));
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;
    setSubmitting(true);

    const user = JSON.parse(localStorage.getItem('taoyuan_user') || 'null');
    const post = {
      id: Date.now(),
      userId: user?.id || 0,
      userName: user?.name || '匿名用户',
      userAvatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      content: content.trim(),
      images,
      likes: 0,
      liked: false,
      collected: false,
      type,
      tags,
      comments: [],
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    // Persist to API (primary)
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
    } catch {
      // API unavailable, save to localStorage as fallback
      const posts = JSON.parse(localStorage.getItem('taoyuan_posts') || '[]');
      posts.unshift(post);
      localStorage.setItem('taoyuan_posts', JSON.stringify(posts));
    }

    // Also keep localStorage synced for instant display
    const posts = JSON.parse(localStorage.getItem('taoyuan_posts') || '[]');
    if (!posts.find((p: any) => p.id === post.id)) {
      posts.unshift(post);
      localStorage.setItem('taoyuan_posts', JSON.stringify(posts));
    }

    setSubmitting(false);
    router.push('/community');
  };

  const isValid = content.trim().length > 0 || images.length > 0;

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="text-sm text-[#999] hover:text-[#2C2C2C] transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            取消
          </button>
          <h1 className="text-lg font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>发布帖子</h1>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="px-5 py-2 bg-[#E07B5A] text-white text-sm font-medium rounded-full hover:bg-[#C56A4A] transition-colors disabled:opacity-40"
          >
            {submitting ? '发布中...' : '发布'}
          </button>
        </motion.div>

        <div className="bg-white rounded-2xl p-6 border border-black/5 space-y-6">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-3">帖子类型</label>
            <div className="flex gap-2 flex-wrap">
              {postTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    type === t ? 'bg-[#E07B5A] text-white' : 'bg-[#FEF5EC] text-[#5C5C5C] hover:bg-[#F0A88C]/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-3">内容</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value.slice(0, 2000))}
              placeholder="分享你的创作、发现或想法..."
              rows={8}
              className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] focus:ring-4 focus:ring-[#E07B5A]/5 transition-all resize-none"
            />
            <div className="text-xs text-[#bbb] mt-2 text-right">{content.length}/2000</div>
          </div>

          {/* Images - Real upload */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-3">图片 ({images.length}/9)</label>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#FEF5EC] group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {images.length < 9 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-[#ddd] flex flex-col items-center justify-center text-[#bbb] hover:border-[#E07B5A] hover:text-[#E07B5A] transition-colors gap-1"
                >
                  {uploading ? (
                    <span className="w-6 h-6 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[10px]">本地上传</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-[#bbb] mt-2">支持 JPG、PNG、GIF 格式，单张不超过 10MB</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-3">标签 ({tags.length}/5)</label>
            <div className="flex gap-2 flex-wrap">
              {presetTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    tags.includes(tag)
                      ? 'bg-[#E07B5A] text-white'
                      : 'bg-[#FEF5EC] text-[#5C5C5C] hover:bg-[#F0A88C]/20'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
