'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

function PaymentDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNo = searchParams.get('orderNo') || '';
  const amount = searchParams.get('amount') || '0.00';
  const desc = searchParams.get('desc') || '';

  const [channel, setChannel] = useState('alipay');
  const [paying, setPaying] = useState(false);

  const handleConfirmPay = async () => {
    setPaying(true);
    try {
      const transactionId = `DEMO_${Date.now()}`;
      const res = await fetch('/api/payments/demo/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, demo_action: 'paid', transactionId }),
      });
      const data = await res.json();
      if (data.success) {
        // Update localStorage order status
        const stored = localStorage.getItem('taoyuan_orders');
        if (stored) {
          const orders = JSON.parse(stored);
          const idx = orders.findIndex((o: any) => o.orderNo === orderNo);
          if (idx >= 0) {
            orders[idx].status = '待发货';
            orders[idx].transactionId = transactionId;
            localStorage.setItem('taoyuan_orders', JSON.stringify(orders));
          }
        }
        router.push(`/order-list?orderNo=${orderNo}&trade_status=TRADE_SUCCESS`);
      } else {
        alert('支付确认失败，请重试');
      }
    } catch {
      alert('网络错误，请重试');
    } finally {
      setPaying(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>收银台</h1>
          <p className="text-xs text-[#bbb]">演示支付环境 - 不会产生真实扣款</p>
        </motion.div>

        {/* Order info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 border border-black/5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#999]">订单号</span>
            <span className="text-sm font-mono text-[#2C2C2C]">{orderNo}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#999]">商品</span>
            <span className="text-sm text-[#2C2C2C]">{desc}</span>
          </div>
          <div className="border-t border-black/3 pt-4 flex justify-between items-center">
            <span className="text-sm font-medium text-[#2C2C2C]">应付金额</span>
            <span className="text-2xl font-bold text-[#E07B5A]">¥{amount}</span>
          </div>
        </motion.div>

        {/* Payment method */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-black/5 mb-6">
          <h3 className="font-semibold text-[#2C2C2C] text-sm mb-4">选择支付方式</h3>
          <div className="space-y-3">
            {[
              { id: 'alipay', name: '支付宝', icon: '💙', desc: '推荐使用' },
              { id: 'wxpay', name: '微信支付', icon: '💚', desc: '微信扫码支付' },
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
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
            <span className="text-amber-500 text-sm mt-0.5">💡</span>
            <p className="text-xs text-amber-700">
              这是演示支付环境，点击确认支付后将模拟支付成功，不会产生真实资金交易。
            </p>
          </div>
        </motion.div>

        {/* Pay button */}
        <button
          onClick={handleConfirmPay}
          disabled={!orderNo || paying}
          className="w-full py-3.5 bg-gradient-to-r from-[#E07B5A] to-[#D4946A] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E07B5A]/20 transition-all disabled:opacity-40"
        >
          {paying ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              正在处理...
            </span>
          ) : (
            `确认支付 ¥${amount}`
          )}
        </button>
        <p className="text-xs text-[#bbb] text-center mt-4">
          支付即表示同意桃园用户协议和隐私政策
        </p>
      </div>
    </div>
  );
}

export default function PaymentDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    }>
      <PaymentDemoContent />
    </Suspense>
  );
}
