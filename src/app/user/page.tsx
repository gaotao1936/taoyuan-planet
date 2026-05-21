'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/lib/types';

interface UserProfile {
  id: number;
  phone: string;
  name: string;
  realName: string;
  idCard: string;
  avatar: string;
  bio: string;
  role: 'user' | 'creator' | 'pending_creator';
  creatorLevel: string | null;
  gender: string;
  birthday: string;
  address: string;
  createdAt: string;
}

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

export default function UserPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', realName: '', idCard: '', bio: '', gender: '', birthday: '', address: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('taoyuan_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const users = JSON.parse(localStorage.getItem('taoyuan_users') || '[]');
      const latest = users.find((u: UserProfile) => u.id === parsed.id) || parsed;
      setUser(latest);
      setEditForm({
        name: latest.name || '',
        realName: latest.realName || '',
        idCard: latest.idCard || '',
        bio: latest.bio || '',
        gender: latest.gender || '',
        birthday: latest.birthday || '',
        address: latest.address || '',
        avatar: latest.avatar || '',
      });
    }
    // Load orders from localStorage
    const storedOrders = localStorage.getItem('taoyuan_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    const storedProducts = localStorage.getItem('taoyuan_products');
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    setLoaded(true);
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    const updated = { ...user, ...editForm };
    setUser(updated);
    localStorage.setItem('taoyuan_user', JSON.stringify(updated));
    // Update in users list
    const users = JSON.parse(localStorage.getItem('taoyuan_users') || '[]');
    const idx = users.findIndex((u: UserProfile) => u.id === updated.id);
    if (idx >= 0) users[idx] = updated;
    localStorage.setItem('taoyuan_users', JSON.stringify(users));
    // Also persist avatar to posts
    if (editForm.avatar) {
      const posts = JSON.parse(localStorage.getItem('taoyuan_posts') || '[]');
      if (posts.length > 0) {
        const updatedPosts = posts.map((p: any) =>
          p.userId === updated.id ? { ...p, userAvatar: editForm.avatar } : p
        );
        localStorage.setItem('taoyuan_posts', JSON.stringify(updatedPosts));
      }
    }
    setSaving(false);
    setEditMode(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleApplyCreator = () => {
    router.push('/creator-apply');
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <span className="text-6xl block mb-6">🎨</span>
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            欢迎来到桃园
          </h2>
          <p className="text-[#999] mb-8">登录后即可管理你的订单、收藏和创作</p>
          <Link
            href="/login"
            className="inline-flex px-8 py-3.5 bg-[#E07B5A] text-white font-semibold rounded-full hover:bg-[#C56A4A] transition-colors shadow-lg shadow-[#E07B5A]/20"
          >
            登录 / 注册
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user.role === 'creator';

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-black/5 mb-6"
        >
          <div className="flex items-start gap-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => editMode && avatarInputRef.current?.click()}
                disabled={!editMode || uploadingAvatar}
                className={`relative group ${editMode ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <img
                  src={editForm.avatar || user.avatar || defaultAvatar}
                  alt=""
                  className="w-20 h-20 rounded-full bg-[#FEF5EC] border-4 border-white shadow-md object-cover"
                />
                {editMode && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {editMode && (
                <p className="text-[10px] text-[#E07B5A] text-center mt-1">点击更换头像</p>
              )}
              {isCreator && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#C9A96E] to-[#E07B5A] rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  {user.name || '未设置昵称'}
                </h2>
                {isCreator && (
                  <span className="text-xs bg-gradient-to-r from-[#C9A96E] to-[#E07B5A] text-white px-2.5 py-0.5 rounded-full font-medium">
                    {user.creatorLevel || '创作者'}
                  </span>
                )}
                {user.role === 'pending_creator' && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium">
                    审核中
                  </span>
                )}
              </div>
              <p className="text-sm text-[#999]">{user.phone}</p>
              {user.bio && !editMode && (
                <p className="text-sm text-[#5C5C5C] mt-2">{user.bio}</p>
              )}
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                editMode
                  ? 'bg-[#FEF5EC] text-[#5C5C5C]'
                  : 'bg-[#FEF5EC] text-[#E07B5A] hover:bg-[#E07B5A]/10'
              }`}
            >
              {editMode ? '取消' : '编辑资料'}
            </button>
          </div>

          {/* Edit Form */}
          <AnimatePresence>
            {editMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-black/5 mt-6 pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">昵称</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="给自己起个名字"
                        maxLength={20}
                        className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">真实姓名</label>
                      <input
                        type="text"
                        value={editForm.realName}
                        onChange={e => setEditForm({ ...editForm, realName: e.target.value })}
                        placeholder="用于创作者认证"
                        maxLength={20}
                        className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">个人简介</label>
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value.slice(0, 200) })}
                      placeholder="介绍一下你自己..."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">性别</label>
                      <select
                        value={editForm.gender}
                        onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all"
                      >
                        <option value="">请选择</option>
                        <option value="male">男</option>
                        <option value="female">女</option>
                        <option value="other">其他</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">生日</label>
                      <input
                        type="date"
                        value={editForm.birthday}
                        onChange={e => setEditForm({ ...editForm, birthday: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">收货地址</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="用于订单发货"
                      className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">身份证号</label>
                    <input
                      type="text"
                      value={editForm.idCard}
                      onChange={e => setEditForm({ ...editForm, idCard: e.target.value.toUpperCase().replace(/[^\dX]/g, '').slice(0, 18) })}
                      placeholder="用于实名认证"
                      maxLength={18}
                      className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3 bg-[#E07B5A] text-white font-medium rounded-xl hover:bg-[#C56A4A] transition-colors disabled:opacity-60"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3 mb-6"
        >
          {[
            { value: orders.length, label: '订单' },
            { value: 0, label: '收藏' },
            { value: 0, label: '帖子' },
            { value: isCreator ? products.filter((p: any) => p.creatorId === user.id).length : 0, label: '作品' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 text-center border border-black/5">
              <div className="text-xl font-bold text-[#2C2C2C]">{stat.value}</div>
              <div className="text-xs text-[#999] mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Creator Gateway / Studio Entry */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          {isCreator ? (
            <Link
              href="/creator-studio"
              className="flex items-center gap-4 p-5 bg-gradient-to-r from-[#2C2C2C] to-[#3D3D3D] text-white rounded-2xl hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-2xl">
                🎨
              </div>
              <div className="flex-1">
                <div className="font-semibold">创作者工作室</div>
                <div className="text-sm text-white/60">管理作品、订单和数据</div>
              </div>
              <svg className="w-5 h-5 text-white/40 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : user.role === 'pending_creator' ? (
            <div className="flex items-center gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <div className="font-semibold text-[#2C2C2C]">创作者申请审核中</div>
                <div className="text-sm text-[#999]">预计 3-5 个工作日内完成审核</div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleApplyCreator}
              className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#E07B5A]/15 hover:border-[#E07B5A]/40 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-[#E07B5A]/8 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ✨
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-[#2C2C2C]">成为创作者</div>
                <div className="text-sm text-[#999]">开设工作室，发布作品，开启创作之旅</div>
              </div>
              <svg className="w-5 h-5 text-[#E07B5A] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-black/5 overflow-hidden mb-6"
        >
          {[
            { icon: '📦', label: '我的订单', href: '/order-list', desc: '查看全部订单' },
            { icon: '❤️', label: '我的收藏', href: '/collections', desc: '收藏的作品和帖子' },
            { icon: '📝', label: '我的帖子', href: '/community', desc: '发布的社区内容' },
            { icon: '🔔', label: '消息通知', href: '/notifications', desc: '系统消息和互动提醒' },
          ].map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-[#FEF5EC]/50 transition-colors ${
                i < 3 ? 'border-b border-black/3' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-[#2C2C2C] text-sm">{item.label}</div>
                <div className="text-xs text-[#999]">{item.desc}</div>
              </div>
              <svg className="w-4 h-4 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-black/5 overflow-hidden mb-6"
        >
          <div className="px-5 py-3 border-b border-black/3">
            <h3 className="text-sm font-semibold text-[#2C2C2C]">账号信息</h3>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#999]">手机号</span>
              <span className="text-[#2C2C2C] font-medium">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">实名认证</span>
              <span className={user.realName ? 'text-green-600 font-medium' : 'text-[#999]'}>
                {user.realName ? `已认证（${user.realName}）` : '未认证'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">身份证</span>
              <span className="text-[#999]">
                {user.idCard ? `${user.idCard.slice(0, 6)}****${user.idCard.slice(-4)}` : '未填写'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">账号角色</span>
              <span className="text-[#2C2C2C] font-medium">
                {user.role === 'creator' ? '创作者' : user.role === 'pending_creator' ? '创作者申请中' : '普通用户'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">注册时间</span>
              <span className="text-[#2C2C2C]">{user.createdAt?.split('T')[0] || '-'}</span>
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('taoyuan_user');
            setUser(null);
            router.push('/');
          }}
          className="w-full py-3 text-sm text-[#999] hover:text-red-500 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
