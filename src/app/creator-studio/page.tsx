'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  images: string[];
  status: 'approved' | 'offline' | 'draft';
  salesCount: number;
  stock: number;
  createdAt: string;
  tags: string[];
  creatorId?: number;
  creatorName?: string;
}

interface StudioOrder {
  id: string;
  orderNo: string;
  createTime: string;
  status: string;
  items: { productId: number; productName: string; price: number; quantity: number; image: string }[];
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: string;
}

const tabs = ['作品管理', '订单管理', '数据概览', '设置'];
const categories = ['陶瓷', '刺绣', '编织', '剪纸', '木作', '布艺印染', '首饰', '文房雅器', '漆器', '金属工艺', '皮艺', '绘画', '摄影', '雕塑', '非遗传承', '其他'];

export default function CreatorStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('作品管理');
  const [isCreator, setIsCreator] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<StudioProduct[]>([]);
  const [orders, setOrders] = useState<StudioOrder[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [studioName, setStudioName] = useState('');
  const [studioBio, setStudioBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '', description: '', price: '', category: '陶瓷', images: [] as string[], tags: [] as string[], stock: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages: string[] = [];
    let loaded = 0;
    const toAdd = Math.min(files.length, 6 - newProduct.images.length);
    Array.from(files).slice(0, toAdd).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result as string);
        loaded++;
        if (loaded === toAdd) {
          setNewProduct(prev => ({ ...prev, images: [...prev.images, ...newImages].slice(0, 6) }));
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
        if (u.role === 'creator') {
          setIsCreator(true);
          setStudioName(u.name + '的工作室' || '我的工作室');
          setStudioBio(u.bio || '');
          await loadProducts(u.id);
        }
      }
      // Load orders from localStorage
      const storedOrders = localStorage.getItem('taoyuan_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    };
    init();
  }, []);

  const loadProducts = async (creatorId?: number) => {
    const id = creatorId || user?.id;
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?creatorId=${id}&pageSize=9999`);
      const data = await res.json();
      setProducts(data.items || []);
    } catch {
      // Fallback to localStorage
      const storedProducts = localStorage.getItem('taoyuan_products');
      if (storedProducts) {
        const all = JSON.parse(storedProducts);
        setProducts(all.filter((p: StudioProduct) => p.creatorId === id || p.creatorName === user?.name));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price || newProduct.images.length === 0) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProduct.title,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          categoryId: categories.indexOf(newProduct.category) + 1,
          images: newProduct.images,
          stock: parseInt(newProduct.stock) || 0,
          tags: newProduct.tags,
          creatorId: user?.id,
          creatorName: user?.name || '创作者',
        }),
      });
      if (res.ok) {
        await loadProducts();
        setNewProduct({ title: '', description: '', price: '', category: '陶瓷', images: [], tags: [], stock: '' });
        setShowAddProduct(false);
      }
    } catch {
      alert('发布失败，请重试');
    }
  };

  const toggleStatus = async (productId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'offline' : 'approved';
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadProducts();
    } catch {
      alert('操作失败');
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      await loadProducts();
    } catch {
      alert('删除失败');
    }
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('taoyuan_orders', JSON.stringify(updated));
  };

  const addImage = () => {
    if (newProduct.images.length >= 6) return;
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, `https://picsum.photos/seed/${Date.now()}/400/400`]
    }));
  };

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <span className="text-6xl block mb-6">🎨</span>
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            创作者工作室
          </h2>
          <p className="text-[#999] mb-8">你尚未成为认证创作者，请先申请入驻，开启你的创作之旅。</p>
          <div className="flex gap-3 justify-center">
            <Link href="/creator-apply"
              className="px-6 py-3 bg-[#E07B5A] text-white text-sm font-medium rounded-full hover:bg-[#C56A4A] transition-colors">
              申请成为创作者
            </Link>
            <button onClick={() => router.back()}
              className="px-6 py-3 border border-black/5 text-[#5C5C5C] text-sm font-medium rounded-full hover:bg-gray-50 transition-colors">
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter(o => o.status === '已完成')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === '待发货').length;

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#2C2C2C] mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-3xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>创作者工作室</h1>
          <p className="text-[#999] mt-1">管理你的作品、订单和数据</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '作品数', value: products.length, icon: '📦', color: 'from-[#E07B5A] to-[#F0A88C]' },
            { label: '待发货', value: pendingOrders, icon: '📋', color: 'from-[#C9A96E] to-[#DBC89E]' },
            { label: '总收入', value: `¥${totalRevenue.toLocaleString()}`, icon: '💰', color: 'from-[#2D6A6A] to-[#4A9A9A]' },
            { label: '粉丝数', value: '0', icon: '❤️', color: 'from-[#6366f1] to-[#818cf8]' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-black/5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xs text-[#999]">{stat.label}</div>
                  <div className="text-lg font-bold text-[#2C2C2C]">{stat.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-8 border border-black/5">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-[#E07B5A] text-white shadow-sm' : 'text-[#999] hover:text-[#2C2C2C]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Management */}
        {activeTab === '作品管理' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[#999]">共 {products.length} 件作品</span>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="text-sm text-white bg-[#E07B5A] px-4 py-2 rounded-full font-medium hover:bg-[#C56A4A] transition-colors"
              >
                {showAddProduct ? '取消' : '+ 发布作品'}
              </button>
            </div>

            {/* Add product form */}
            <AnimatePresence>
              {showAddProduct && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-2xl p-6 border border-black/5 space-y-4 mb-4">
                    <h3 className="font-semibold text-[#2C2C2C]">发布新作品</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">作品名称 *</label>
                        <input type="text" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="作品名称" maxLength={50}
                          className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">价格 (¥) *</label>
                        <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" min="0" step="0.01"
                          className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">库存</label>
                        <input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" min="0"
                          className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">分类</label>
                        <div className="flex gap-2 flex-wrap">
                          {categories.map(cat => (
                            <button key={cat} onClick={() => setNewProduct({ ...newProduct, category: cat })}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                newProduct.category === cat ? 'bg-[#E07B5A] text-white' : 'bg-[#FEF5EC] text-[#5C5C5C]'
                              }`}>{cat}</button>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">作品描述</label>
                        <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value.slice(0, 500) })}
                          placeholder="介绍你的作品..." rows={3}
                          className="w-full px-3 py-2.5 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all resize-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-[#2C2C2C] mb-1.5">图片 * ({newProduct.images.length}/6)</label>
                        <div className="flex gap-3 flex-wrap">
                          {newProduct.images.map((img, i) => (
                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#FEF5EC]">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button onClick={() => setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-[10px]">✕</button>
                            </div>
                          ))}
                          {newProduct.images.length < 6 && (
                            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                              className="w-20 h-20 rounded-xl border-2 border-dashed border-[#ddd] flex flex-col items-center justify-center text-[#bbb] hover:border-[#E07B5A] transition-colors gap-0.5">
                              {uploading ? (
                                <span className="w-5 h-5 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
                              ) : (
                                <>
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                  </svg>
                                  <span className="text-[9px]">上传</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                        {newProduct.images.length < 6 && (
                          <button onClick={addImage} className="text-xs text-[#E07B5A] hover:underline mt-1">使用网络图片</button>
                        )}
                      </div>
                    </div>
                    <button onClick={handleAddProduct}
                      className="w-full py-2.5 bg-[#E07B5A] text-white font-medium rounded-xl hover:bg-[#C56A4A] transition-colors">
                      保存作品（草稿，需管理员审核后上架）
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#E07B5A]/30 border-t-[#E07B5A] rounded-full animate-spin" />
              </div>
            )}

            {!loading && products.length === 0 ? (
              <div className="text-center py-16 text-[#999]">
                <span className="text-4xl block mb-3">📦</span>
                <p>暂无作品，点击"发布作品"开始创作</p>
              </div>
            ) : (
              products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl p-4 border border-black/5 flex gap-4 items-center">
                  <img src={product.images[0] || ''} alt="" className="w-16 h-16 rounded-xl object-cover bg-[#FEF5EC]" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#2C2C2C] line-clamp-1">{product.title}</h4>
                    <p className="text-xs text-[#bbb] mt-1">
                      ¥{product.price} · {product.status === 'approved' ? `已售 ${product.salesCount}` : product.status === 'draft' ? '待审核' : '已下架'}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    product.status === 'approved' ? 'bg-green-50 text-green-600' : product.status === 'draft' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.status === 'approved' ? '上架中' : product.status === 'draft' ? '待审核' : '已下架'}
                  </span>
                  <div className="flex gap-2">
                    {product.status === 'approved' && (
                      <button onClick={() => toggleStatus(product.id, product.status)}
                        className="text-xs text-[#E07B5A] hover:underline whitespace-nowrap">下架</button>
                    )}
                    {product.status === 'offline' && (
                      <button onClick={() => toggleStatus(product.id, product.status)}
                        className="text-xs text-green-600 hover:underline whitespace-nowrap">上架</button>
                    )}
                    <button onClick={() => deleteProduct(product.id)}
                      className="text-xs text-red-400 hover:underline whitespace-nowrap">删除</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Order Management */}
        {activeTab === '订单管理' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-[#999]">
                <span className="text-4xl block mb-3">📋</span>
                <p>暂无订单</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-4 border border-black/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-[#999]">{order.orderNo}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      order.status === '已完成' ? 'bg-green-50 text-green-600' :
                      order.status === '已取消' ? 'bg-gray-100 text-gray-500' :
                      'bg-amber-50 text-amber-600'
                    }`}>{order.status}</span>
                  </div>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center py-2 border-b border-black/3 last:border-0">
                      <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#FEF5EC]" />
                      <div className="flex-1">
                        <p className="text-sm text-[#2C2C2C] line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-[#bbb]">×{item.quantity} · ¥{item.price}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-[#5C5C5C]">
                      合计 <span className="font-bold text-[#E07B5A]">¥{order.totalAmount}</span>
                    </span>
                    {order.status === '待发货' && (
                      <button onClick={() => updateOrderStatus(order.id, '待收货')}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-[#2D6A6A] rounded-full hover:bg-[#1D5A5A] transition-colors">
                        确认发货
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Data Overview */}
        {activeTab === '数据概览' && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: '本月新增作品', value: products.filter(p => p.createdAt >= new Date().toISOString().slice(0, 7)).length.toString(), change: '-' },
              { title: '本月收入', value: `¥${totalRevenue}`, change: '-' },
              { title: '总订单', value: orders.length.toString(), change: '-' },
              { title: '完成率', value: orders.length > 0 ? `${Math.round(orders.filter(o => o.status === '已完成').length / orders.length * 100)}%` : '-', change: '-' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-black/5">
                <div className="text-sm text-[#999] mb-2">{item.title}</div>
                <div className="text-3xl font-bold text-[#2C2C2C] mb-1">{item.value}</div>
                <span className="text-xs text-green-500">{item.change} 较上月</span>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        {activeTab === '设置' && (
          <div className="bg-white rounded-2xl p-6 border border-black/5 max-w-lg space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">工作室名称</label>
              <input value={studioName} onChange={e => setStudioName(e.target.value)}
                className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">工作室简介</label>
              <textarea value={studioBio} onChange={e => setStudioBio(e.target.value)} rows={3}
                className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] transition-all resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">创作者等级</label>
              <div className="text-sm text-[#999] bg-[#FEF5EC] px-4 py-3 rounded-xl">
                {user?.creatorLevel || '新人创作者'}
              </div>
            </div>
            <button className="px-6 py-2.5 bg-[#E07B5A] text-white text-sm font-medium rounded-xl hover:bg-[#C56A4A] transition-colors">
              保存设置
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
