'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const qty = parseInt(searchParams.get('qty') || '1');

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [channel, setChannel] = useState('alipay');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [orderNo, setOrderNo] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [paying, setPaying] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    const products: Product[] = JSON.parse(localStorage.getItem('taoyuan_products') || '[]');
    const found = products.find(p => p.id === Number(productId));
    setProduct(found || null);
    const user = JSON.parse(localStorage.getItem('taoyuan_user') || 'null');
    if (user) {
      setForm(prev => ({
        ...prev,
        phone: user.phone || '',
        name: user.realName || user.name || '',
        address: user.address || '',
      }));
    }
    setLoaded(true);
  }, [productId]);

  const saveOrderLocal = (data: any) => {
    const orders = JSON.parse(localStorage.getItem('taoyuan_orders') || '[]');
    orders.unshift({
      id: data.orderNo,
      orderNo: data.orderNo,
      createTime: new Date().toISOString(),
      status: '待付款',
      items: [{ productId: product!.id, productName: product!.title, price: product!.price, quantity: qty, image: product!.images[0] }],
      totalAmount: data.amount,
      buyerName: form.name,
      buyerPhone: form.phone,
      shippingAddress: form.address,
      commissionRate: data.commissionRate ?? 0,
      creatorAmount: data.creatorAmount ?? data.amount,
    });
    localStorage.setItem('taoyuan_orders', JSON.stringify(orders));
  };

  const startPolling = (orderNo: string) => {
    // Poll order status every 2s for QR scan payment
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNo}`);
        const data = await res.json();
        if (data.status === '待发货' || data.status === '已完成') {
          clearInterval(pollRef.current!);
          setShowQr(false);
          setPaying(false);
          router.push(`/order-list?orderNo=${orderNo}&trade_status=TRADE_SUCCESS`);
        }
      } catch {}
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!product || !form.phone || !form.name) return;
    setLoading(true);

    try {
      // Map frontend channel to backend paymentMethod
      const paymentMethod = channel === 'wxpay' ? 'wechat' : channel;

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: qty,
          buyerName: form.name,
          buyerPhone: form.phone,
          shippingAddress: form.address,
          paymentMethod,
          channel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        saveOrderLocal(data);
        setOrderNo(data.orderNo);
        setPayAmount(data.amount);

        if (data.qrCode) {
          // WeChat Native — show QR code on screen
          setQrCode(data.qrCode);
          setShowQr(true);
          setPaying(true);
          startPolling(data.orderNo);
        } else if (data.payUrl) {
          // Alipay page pay — redirect
          window.location.href = data.payUrl;
        }
      } else {
        alert(data.error || '创建订单失败');
      }
    } catch {
      alert('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">商品未找到</h2>
          <Link href="/category" className="text-[#E07B5A] hover:underline">返回浏览</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#2C2C2C] mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-2xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>确认订单</h1>
        </motion.div>

        {/* Order summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 border border-black/5 mb-4">
          <div className="flex gap-4">
            <img src={product.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover bg-[#FEF5EC]" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#2C2C2C] line-clamp-1">{product.title}</h3>
              <p className="text-xs text-[#999] mt-1">{product.creatorName}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-[#E07B5A]">¥{product.price}</span>
                <span className="text-sm text-[#999]">×{qty}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-black/3 mt-4 pt-4 flex justify-between text-sm">
            <span className="text-[#999]">合计</span>
            <span className="text-xl font-bold text-[#E07B5A]">¥{(product.price * qty).toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Shipping info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-black/5 mb-4 space-y-4">
          <h3 className="font-semibold text-[#2C2C2C] text-sm">收货信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">收货人 *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="姓名" maxLength={20}
                className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">手机号 *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                placeholder="11位手机号" maxLength={11}
                className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">收货地址</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="省/市/区/详细地址"
              className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all" />
          </div>
        </motion.div>

        {/* Payment method */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 border border-black/5 mb-6">
          <h3 className="font-semibold text-[#2C2C2C] text-sm mb-4">支付方式</h3>
          <div className="space-y-3">
            {[
              { id: 'alipay', name: '支付宝', icon: '💙', desc: '跳转支付宝完成支付', key: 'alipay' },
              { id: 'wxpay', name: '微信支付', icon: '💚', desc: '微信扫码完成支付', key: 'wechat' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setChannel(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  channel === item.id
                    ? 'border-[#E07B5A] bg-[#E07B5A]/5'
                    : 'border-black/5 hover:border-[#E07B5A]/30'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-[#2C2C2C] text-sm">{item.name}</div>
                  <div className="text-xs text-[#999]">{item.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  channel === item.id ? 'border-[#E07B5A]' : 'border-[#ddd]'
                }`}>
                  {channel === item.id && <div className="w-2.5 h-2.5 rounded-full bg-[#E07B5A]" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!form.name || !form.phone || !/^1\d{10}$/.test(form.phone) || loading}
          className="w-full py-3.5 bg-gradient-to-r from-[#E07B5A] to-[#D4946A] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E07B5A]/20 transition-all disabled:opacity-40"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              正在创建订单...
            </span>
          ) : (
            `立即支付 ¥${(product.price * qty).toFixed(2)}`
          )}
        </button>
        <p className="text-xs text-[#bbb] text-center mt-4">
          支付即表示同意桃园用户协议和隐私政策
          <br />
          {channel === 'alipay' ? '将跳转至支付宝完成支付' : '将展示微信扫码支付'}
        </p>
      </div>

      {/* QR Code Modal for WeChat Native */}
      <AnimatePresence>
        {showQr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <h3 className="text-lg font-bold text-[#2C2C2C] mb-1">微信扫码支付</h3>
              <p className="text-sm text-[#999] mb-4">请使用微信扫描二维码完成支付</p>
              <div className="text-2xl font-bold text-[#E07B5A] mb-4">¥{payAmount}</div>
              <div className="bg-white border border-black/5 rounded-xl p-4 mb-4 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                  alt="微信支付二维码"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-[#bbb] mb-2">订单号：{orderNo}</p>
              {paying && (
                <div className="flex items-center justify-center gap-2 text-sm text-[#E07B5A]">
                  <span className="w-4 h-4 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
                  等待支付中...
                </div>
              )}
              <button
                onClick={() => {
                  if (pollRef.current) clearInterval(pollRef.current);
                  setShowQr(false);
                  setPaying(false);
                  router.push(`/order-list?orderNo=${orderNo}`);
                }}
                className="mt-4 px-6 py-2 text-sm text-[#999] hover:text-[#2C2C2C] transition-colors"
              >
                取消支付
              </button>
              {/* Demo: simulate payment */}
              <button
                onClick={async () => {
                  if (pollRef.current) clearInterval(pollRef.current);
                  await fetch('/api/payments/demo/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderNo, demo_action: 'paid', transactionId: `DEMO_${Date.now()}` }),
                  });
                  const stored = localStorage.getItem('taoyuan_orders');
                  if (stored) {
                    const orders = JSON.parse(stored);
                    const idx = orders.findIndex((o: any) => o.orderNo === orderNo);
                    if (idx >= 0) orders[idx].status = '待发货';
                    localStorage.setItem('taoyuan_orders', JSON.stringify(orders));
                  }
                  setShowQr(false);
                  setPaying(false);
                  router.push(`/order-list?orderNo=${orderNo}&trade_status=TRADE_SUCCESS`);
                }}
                className="mt-2 text-xs text-[#E07B5A] underline hover:text-[#C56A4A] block mx-auto"
              >
                演示：模拟支付成功
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
