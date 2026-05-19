'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { mockOrders } from '@/data/mockData';
import { Order } from '@/lib/types';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: '待付款', label: '待付款' },
  { key: '待发货', label: '待发货' },
  { key: '待收货', label: '待收货' },
  { key: '已完成', label: '已完成' },
  { key: '已取消', label: '已取消' },
];

const statusColors: Record<string, string> = {
  '待付款': 'bg-amber-50 text-amber-700',
  '待发货': 'bg-blue-50 text-blue-700',
  '待收货': 'bg-purple-50 text-purple-700',
  '已完成': 'bg-green-50 text-green-700',
  '已取消': 'bg-gray-100 text-gray-500',
};

function OrderListContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Handle EPay return
    const tradeStatus = searchParams.get('trade_status');
    const orderNo = searchParams.get('out_trade_no');
    if (tradeStatus === 'TRADE_SUCCESS' && orderNo) {
      fetch(`/api/payments/epay/notify?${searchParams.toString()}`).catch(console.error);
      const stored = localStorage.getItem('taoyuan_orders');
      if (stored) {
        const localOrders: Order[] = JSON.parse(stored);
        const idx = localOrders.findIndex(o => o.orderNo === orderNo);
        if (idx >= 0) {
          localOrders[idx].status = '待发货';
          localStorage.setItem('taoyuan_orders', JSON.stringify(localOrders));
        }
      }
    }
    const stored = localStorage.getItem('taoyuan_orders');
    const localOrders: Order[] = stored ? JSON.parse(stored) : [];
    setOrders([...localOrders, ...mockOrders]);
  }, [searchParams]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => o.status === activeTab);
  }, [orders, activeTab]);

  const handleAction = (order: Order, action: string) => {
    if (action === 'pay') {
      // Re-initiate payment
      const checkoutUrl = `/checkout?productId=${order.items[0].productId}&qty=${order.items[0].quantity}`;
      window.location.href = checkoutUrl;
      return;
    }
    setOrders(prev => prev.map(o => {
      if (o.orderNo !== order.orderNo) return o;
      switch (action) {
        case 'confirm': return { ...o, status: '已完成' };
        case 'cancel': return { ...o, status: '已取消' };
        default: return o;
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>我的订单</h1>
        </motion.div>

        <div className="flex gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#E07B5A] text-white shadow-sm'
                  : 'bg-white text-[#5C5C5C] border border-black/5 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl border border-black/5 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-black/3">
                    <span className="text-xs text-[#999]">订单号：{order.orderNo}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-4 px-5 py-4 border-b border-black/3 last:border-0">
                      <img src={item.image} alt={item.productName} className="w-20 h-20 rounded-xl object-cover bg-[#FEF5EC]" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#2C2C2C] line-clamp-1">{item.productName}</h4>
                        <p className="text-xs text-[#bbb] mt-1">×{item.quantity}</p>
                        <p className="text-sm font-bold text-[#E07B5A] mt-2">¥{item.price}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-5 py-3 bg-[#FEF5EC]/50">
                    <span className="text-sm text-[#5C5C5C]">
                      共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件 · 合计 <span className="font-bold text-[#E07B5A]">¥{order.totalAmount}</span>
                    </span>
                    <div className="flex gap-2">
                      {order.status === '待付款' && (
                        <>
                          <button onClick={() => handleAction(order, 'cancel')}
                            className="px-4 py-1.5 text-xs font-medium text-[#999] bg-white border border-black/5 rounded-full hover:border-red-300 hover:text-red-500 transition-colors">
                            取消订单
                          </button>
                          <button onClick={() => handleAction(order, 'pay')}
                            className="px-4 py-1.5 text-xs font-medium text-white bg-[#E07B5A] rounded-full hover:bg-[#C56A4A] transition-colors">
                            去付款
                          </button>
                        </>
                      )}
                      {order.status === '待发货' && (
                        <button onClick={() => handleAction(order, 'confirm')}
                          className="px-4 py-1.5 text-xs font-medium text-white bg-[#2D6A6A] rounded-full hover:bg-[#1D5A5A] transition-colors">
                          确认收货
                        </button>
                      )}
                      {(order.status === '已完成' || order.status === '已取消') && (
                        <Link href={`/product/${order.items[0].productId}`}
                          className="px-4 py-1.5 text-xs font-medium text-[#E07B5A] bg-[#E07B5A]/8 rounded-full hover:bg-[#E07B5A]/15 transition-colors">
                          再次购买
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <span className="text-5xl block mb-4">📦</span>
              <p className="text-[#999]">暂无相关订单</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OrderListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
      </div>
    }>
      <OrderListContent />
    </Suspense>
  );
}
