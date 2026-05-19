'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const creativeFields = ['陶瓷', '刺绣', '编织', '剪纸', '木作', '布艺印染', '首饰设计', '文房雅器', '漆器', '金属工艺', '皮艺', '绘画', '摄影艺术', '雕塑', '非遗传承', '其他'];

type ApplyStatus = 'none' | 'pending' | 'approved' | 'rejected';

export default function CreatorApplyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ApplyStatus>('none');
  const [user, setUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [form, setForm] = useState({
    realName: '',
    phone: '',
    fields: [] as string[],
    bio: '',
    portfolio: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages: string[] = [];
    let loaded = 0;
    const toAdd = Math.min(files.length, 6 - form.portfolio.length);
    Array.from(files).slice(0, toAdd).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result as string);
        loaded++;
        if (loaded === toAdd) {
          setForm(prev => ({ ...prev, portfolio: [...prev.portfolio, ...newImages].slice(0, 6) }));
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('taoyuan_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        setForm(prev => ({
          ...prev,
          realName: u.realName || '',
          phone: u.phone || '',
          bio: u.bio || '',
          portfolio: [imgSeed()],
        }));

        if (u.role === 'creator') {
          setStatus('approved');
        } else if (u.id) {
          // Fetch application status from API
          try {
            const res = await fetch(`/api/creators/apply?userId=${u.id}`);
            const data = await res.json();
            const app = data.application;
            if (app) {
              setStatus(app.status === 'rejected' ? 'rejected' : app.status);
              if (app.reason) setRejectReason(app.reason);
            }
          } catch {
            // API not available, fallback to localStorage
            const lsStatus = localStorage.getItem('creator_apply_status');
            if (lsStatus) setStatus(lsStatus as ApplyStatus);
          }
        }
      }
      setLoaded(true);
    };
    init();
  }, []);

  const imgSeed = () => `https://picsum.photos/seed/${Date.now() + Math.random()}/400/400`;

  const toggleField = (field: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field]
    }));
  };

  const addPortfolioImage = () => {
    if (form.portfolio.length >= 6) return;
    setForm(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, imgSeed()]
    }));
  };

  const isValid = form.realName.length >= 2 && form.realName.length <= 20
    && /^1\d{10}$/.test(form.phone)
    && form.fields.length >= 1
    && form.bio.length >= 10 && form.bio.length <= 500
    && form.portfolio.length >= 1;

  const handleSubmit = async () => {
    if (!isValid || !user) return;
    setSubmitting(true);

    try {
      await fetch('/api/creators/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: form.phone,
          realName: form.realName,
          fields: form.fields,
          bio: form.bio,
          portfolio: form.portfolio,
        }),
      });

      // Update local user state (role stays unchanged until admin approves)
      const updatedUser = { ...user, realName: form.realName, bio: form.bio };
      localStorage.setItem('taoyuan_user', JSON.stringify(updatedUser));

      setStatus('pending');
    } catch {
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReapply = () => {
    setStatus('none');
    setRejectReason('');
  };

  // Demo: simulate admin approval via API
  const handleSimulateApproval = async () => {
    try {
      // Find latest application and approve it
      const res = await fetch(`/api/creators/apply?userId=${user.id}`);
      const data = await res.json();
      const app = data.application;
      if (app) {
        await fetch('/api/creators/apply', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: app.id, status: 'approved' }),
        });
        // Update local user role
        const updated = { ...user, role: 'creator' };
        localStorage.setItem('taoyuan_user', JSON.stringify(updated));
        setUser(updated);
        setStatus('approved');
      }
    } catch {
      alert('模拟审核失败，API 未就绪');
    }
  };

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
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>创作者申请</h1>
          <p className="text-[#999] mb-8">成为认证创作者，开设工作室，开启你的创作之旅</p>
        </motion.div>

        {/* Status: Pending */}
        {status === 'pending' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 border border-black/5 text-center">
            <span className="text-6xl block mb-6">⏳</span>
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>申请审核中</h2>
            <p className="text-[#999] mb-2">我们正在认真审核你的申请</p>
            <p className="text-xs text-[#bbb] mb-8">预计 3-5 个工作日内完成审核</p>
            <div className="bg-amber-50 rounded-xl p-4 max-w-sm mx-auto mb-6">
              <p className="text-xs text-amber-700">申请信息已提交，请耐心等待。审核结果将通过短信通知你。</p>
            </div>
            <button onClick={handleSimulateApproval}
              className="text-xs text-[#E07B5A] underline hover:text-[#C56A4A]">
              演示：模拟审核通过
            </button>
          </motion.div>
        )}

        {/* Status: Approved */}
        {status === 'approved' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 border border-black/5 text-center">
            <span className="text-6xl block mb-6">🎉</span>
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>恭喜，审核已通过！</h2>
            <p className="text-[#999] mb-4">你已成为桃园认证创作者</p>
            <div className="bg-green-50 text-green-700 text-sm rounded-xl p-4 mb-8 max-w-sm mx-auto">
              现在可以发布作品、管理订单了
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/creator-studio"
                className="inline-flex px-8 py-3.5 bg-[#E07B5A] text-white font-medium rounded-full hover:bg-[#C56A4A] transition-colors shadow-lg shadow-[#E07B5A]/20">
                进入工作室
              </Link>
              <Link href="/user"
                className="inline-flex px-8 py-3.5 border border-black/5 text-[#5C5C5C] font-medium rounded-full hover:bg-gray-50 transition-colors">
                返回个人中心
              </Link>
            </div>
          </motion.div>
        )}

        {/* Status: Rejected */}
        {status === 'rejected' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 border border-black/5 text-center">
            <span className="text-6xl block mb-6">📋</span>
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>审核未通过</h2>
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-8 max-w-sm mx-auto">
              原因：{rejectReason || '请补充更清晰的作品集图片后重新申请'}
            </div>
            <button onClick={handleReapply}
              className="px-8 py-3.5 bg-[#E07B5A] text-white font-medium rounded-full hover:bg-[#C56A4A] transition-colors">
              重新申请
            </button>
          </motion.div>
        )}

        {/* Application Form */}
        {status === 'none' && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-black/5 space-y-6">
            {!user && (
              <div className="bg-amber-50 text-amber-700 text-sm rounded-xl p-4">
                请先<Link href="/login" className="text-[#E07B5A] underline font-medium mx-1">登录</Link>后再申请创作者认证
              </div>
            )}
            <div className="bg-[#FEF5EC] rounded-xl p-4 text-sm text-[#5C5C5C]">
              <p className="font-medium text-[#2C2C2C] mb-2">创作者入驻流程</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-[#E07B5A] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                填写资料
                <svg className="w-3 h-3 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="bg-[#E07B5A] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                提交审核
                <svg className="w-3 h-3 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="bg-[#E07B5A] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                通过后开设工作室
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">真实姓名 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.realName}
                onChange={e => setForm({ ...form, realName: e.target.value })}
                placeholder="请输入真实姓名（2-20字）"
                maxLength={20}
                className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">手机号 <span className="text-red-400">*</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                placeholder="请输入11位手机号"
                disabled={!!user?.phone}
                className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-3">创作领域 <span className="text-red-400">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {creativeFields.map(field => (
                  <button
                    key={field}
                    onClick={() => toggleField(field)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      form.fields.includes(field)
                        ? 'bg-[#E07B5A] text-white'
                        : 'bg-[#FEF5EC] text-[#5C5C5C] hover:bg-[#F0A88C]/20'
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#bbb] mt-2">已选 {form.fields.length} 个领域</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">个人简介 <span className="text-red-400">*</span></label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value.slice(0, 500) })}
                placeholder="介绍你自己和你的创作风格（10-500字）"
                rows={4}
                className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all resize-none"
              />
              <p className="text-xs text-[#bbb] mt-2 text-right">{form.bio.length}/500</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-3">作品集 <span className="text-red-400">*</span> ({form.portfolio.length}/6)</label>
              <div className="grid grid-cols-3 gap-3">
                {form.portfolio.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#FEF5EC] group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setForm(prev => ({ ...prev, portfolio: prev.portfolio.filter((_, j) => j !== i) }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {form.portfolio.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-[#ddd] flex flex-col items-center justify-center text-[#bbb] hover:border-[#E07B5A] hover:text-[#E07B5A] transition-colors gap-1"
                  >
                    {uploading ? (
                      <span className="w-6 h-6 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
              <p className="text-xs text-[#bbb] mt-2 flex items-center justify-between">
                <span>支持 JPG、PNG，单张不超过 10MB</span>
                {form.portfolio.length < 6 && (
                  <button onClick={addPortfolioImage} className="text-[#E07B5A] hover:underline">
                    使用网络图片
                  </button>
                )}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting || !user}
              className="w-full py-3.5 bg-gradient-to-r from-[#E07B5A] to-[#D4946A] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E07B5A]/20 transition-all disabled:opacity-40"
            >
              {submitting ? '提交中...' : '提交申请'}
            </button>

            {!isValid && user && (
              <div className="text-xs text-[#bbb] space-y-0.5 mt-2">
                <p className="text-[#E07B5A] font-medium mb-1">请完善以下信息：</p>
                {form.realName.length < 2 && <p>· 填写真实姓名（至少2字）</p>}
                {!/^1\d{10}$/.test(form.phone) && <p>· 输入有效的11位手机号</p>}
                {form.fields.length === 0 && <p>· 至少选择1个创作领域</p>}
                {form.bio.length < 10 && <p>· 填写个人简介（至少10字，当前{form.bio.length}字）</p>}
                {form.portfolio.length === 0 && <p>· 至少添加1张作品图片（点击下方 + 号添加）</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
