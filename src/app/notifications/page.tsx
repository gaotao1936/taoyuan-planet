'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Notification {
  id: number;
  type: 'system' | 'like' | 'comment' | 'order' | 'creator';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// Generate some system notifications for demo
const systemNotices: Notification[] = [
  {
    id: 1, type: 'system', title: '欢迎来到桃园', content: '欢迎加入文创平台社区，开启你的创作之旅！',
    read: false, createdAt: new Date().toISOString(),
  },
  {
    id: 2, type: 'system', title: '创作者招募中', content: '平台正在招募原创设计师和手工艺人，申请成为创作者，开设你的工作室。',
    read: false, createdAt: new Date(Date.now() - 86400000).toISOString(), link: '/creator-apply',
  },
  {
    id: 3, type: 'system', title: '社区功能上线', content: '桃园社区正式上线，快来分享你的创作日常和文创心得吧！',
    read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), link: '/community',
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load stored notifications or use system defaults
    const stored = localStorage.getItem('taoyuan_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(systemNotices);
      localStorage.setItem('taoyuan_notifications', JSON.stringify(systemNotices));
    }
    setLoaded(true);
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('taoyuan_notifications', JSON.stringify(updated));
  };

  const markRead = (id: number) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('taoyuan_notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#2C2C2C] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>消息通知</h1>
              {unreadCount > 0 && <p className="text-sm text-[#999] mt-1">{unreadCount} 条未读</p>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm text-[#E07B5A] hover:underline">全部已读</button>
            )}
          </div>
        </motion.div>

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🔔</span>
            <p className="text-[#999]">暂无消息通知</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { markRead(n.id); if (n.link) router.push(n.link); }}
                className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-sm ${
                  !n.read ? 'border-[#E07B5A]/20 bg-[#FEF5EC]' : 'border-black/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    n.type === 'system' ? 'bg-blue-50' :
                    n.type === 'like' ? 'bg-red-50' :
                    n.type === 'comment' ? 'bg-green-50' :
                    n.type === 'order' ? 'bg-amber-50' : 'bg-purple-50'
                  }`}>
                    {n.type === 'system' ? '📢' :
                     n.type === 'like' ? '❤️' :
                     n.type === 'comment' ? '💬' :
                     n.type === 'order' ? '📦' : '✨'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#2C2C2C]">{n.title}</h3>
                      {!n.read && <span className="w-2 h-2 bg-[#E07B5A] rounded-full shrink-0" />}
                    </div>
                    <p className="text-sm text-[#999]">{n.content}</p>
                    <p className="text-xs text-[#bbb] mt-2">{new Date(n.createdAt).toLocaleDateString('zh-CN')}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
