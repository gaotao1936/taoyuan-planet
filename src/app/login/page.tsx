'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = () => {
    if (phone.length !== 11 || !/^1\d{10}$/.test(phone)) return;
    setCodeSent(true);
    setShowHint(true);
    startCountdown();
    // In production, this calls the SMS API
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 11 || code.length < 4) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Check if admin login
    if (phone === '13800000000' && code === '888888') {
      const adminUser = {
        id: 0,
        phone: '13800000000',
        name: '平台管理员',
        realName: '管理员',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        bio: '桃园平台运营方',
        role: 'creator',
        creatorLevel: '平台运营',
        isAdmin: true,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('taoyuan_user', JSON.stringify(adminUser));
      localStorage.setItem('taoyuan_admin', 'true');
      setLoading(false);
      router.push('/admin');
      return;
    }

    // Check if user exists, if not create a new one
    const users = JSON.parse(localStorage.getItem('taoyuan_users') || '[]');
    let user = users.find((u: { phone: string }) => u.phone === phone);

    if (!user) {
      // New user registration
      user = {
        id: Date.now(),
        phone,
        name: '',
        realName: '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
        bio: '',
        role: 'user',
        creatorLevel: null,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem('taoyuan_users', JSON.stringify(users));
    }

    localStorage.setItem('taoyuan_user', JSON.stringify(user));
    setLoading(false);
    router.push('/user');
  };

  const phoneValid = phone.length === 11 && /^1\d{10}$/.test(phone);
  const codeValid = code.length >= 4;

  return (
    <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#E07B5A] to-[#C9A96E] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#E07B5A]/20"
                 style={{ fontFamily: "'Noto Serif SC', serif" }}>
              桃
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            欢迎来到桃园
          </h1>
          <p className="text-[#999] mt-2 text-sm">手机号注册登录，开启你的文创之旅</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-black/5 space-y-5">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                setPhone(v);
                if (codeSent) { setCodeSent(false); setShowHint(false); }
              }}
              placeholder="请输入11位手机号"
              maxLength={11}
              className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] focus:ring-4 focus:ring-[#E07B5A]/5 transition-all"
            />
          </div>

          {/* Verification code */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">验证码</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="请输入验证码"
                maxLength={6}
                className="flex-1 px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] focus:ring-4 focus:ring-[#E07B5A]/5 transition-all"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={!phoneValid || countdown > 0}
                className="px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all disabled:opacity-40
                  bg-[#E07B5A] text-white hover:bg-[#C56A4A] disabled:bg-[#ddd] disabled:text-[#999]"
              >
                {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
              </button>
            </div>
            {showHint && (
              <p className="text-xs text-[#E07B5A] mt-2">
                演示环境，测试验证码：1234
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!phoneValid || !codeValid || loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#E07B5A] to-[#D4946A] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E07B5A]/20 transition-all disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                验证中...
              </span>
            ) : '登录 / 注册'}
          </button>
        </form>

        <p className="text-center text-xs text-[#bbb] mt-6">
          登录即表示同意
          <a href="#" className="text-[#E07B5A] mx-1">用户协议</a>
          和
          <a href="#" className="text-[#E07B5A] ml-1">隐私政策</a>
        </p>
      </motion.div>
    </div>
  );
}
