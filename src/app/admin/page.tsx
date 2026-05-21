'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const ADMIN_PHONE = '13800000000';
const ADMIN_CODE = '888888';

interface CreatorApplication {
  id: number;
  userId: number;
  phone: string;
  realName: string;
  fields: string[];
  bio: string;
  portfolio: string[];
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
}

interface AdminProduct {
  id: number;
  title: string;
  price: number;
  category: string;
  images: string[];
  status: 'approved' | 'offline' | 'draft';
  creatorName: string;
  createdAt: string;
}

interface AdminUser {
  id: number;
  name: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface AdminPost {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  images: string[];
  likes: number;
  comments: any[];
  type?: string;
  createdAt: string;
}

interface AdminOrder {
  id: string;
  orderNo: string;
  createTime: string;
  status: string;
  items: { productId: number; productName: string; price: number; quantity: number; image: string }[];
  totalAmount: number;
  buyerName: string;
  commissionRate?: number;
  creatorAmount?: number;
  settlementStatus?: string;
}

const adminTabs = ['创作者审核', '作品审核', '内容管理', '结算管理', '系统概览'];

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('创作者审核');
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const adminSession = localStorage.getItem('taoyuan_admin');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, prodRes, postRes, userRes, orderRes] = await Promise.all([
        fetch('/api/creators/apply'),
        fetch('/api/products?pageSize=9999'),
        fetch('/api/posts?pageSize=9999'),
        fetch('/api/users/profile'),
        fetch('/api/orders?pageSize=9999'),
      ]);
      const appsData = await appRes.json();
      const prodData = await prodRes.json();
      const postData = await postRes.json();
      const userData = await userRes.json();
      const orderData = await orderRes.json();

      setApplications(Array.isArray(appsData) ? appsData : appsData.applications || []);
      setProducts(prodData.items || []);
      setPosts(postData.items || []);
      setUsers(Array.isArray(userData) ? userData : []);
      setOrders(orderData.items || []);
    } catch (err) {
      console.error('[Admin] 数据加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (loginPhone === ADMIN_PHONE && loginCode === ADMIN_CODE) {
      setIsAdmin(true);
      localStorage.setItem('taoyuan_admin', 'true');
      setLoginError('');
    } else {
      setLoginError('手机号或验证码错误');
    }
  };

  const approveApplication = async (app: CreatorApplication) => {
    // Approve application
    await fetch('/api/creators/apply', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: app.id, status: 'approved' }),
    });

    // Update user role to creator
    if (app.userId) {
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: app.userId, role: 'creator', realName: app.realName }),
      });
    }

    // Update current user if it's them
    const currentUser = JSON.parse(localStorage.getItem('taoyuan_user') || 'null');
    if (currentUser && currentUser.phone === app.phone) {
      currentUser.role = 'creator';
      localStorage.setItem('taoyuan_user', JSON.stringify(currentUser));
    }

    loadData();
  };

  const rejectApplication = async (id: number) => {
    const reason = prompt('请输入拒绝原因：');
    await fetch('/api/creators/apply', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected', reason: reason || '不符合入驻要求' }),
    });
    loadData();
  };

  const approveProduct = async (id: number) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    loadData();
  };

  const rejectProduct = async (id: number) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'offline' }),
    });
    loadData();
  };

  const deletePost = async (id: number) => {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    loadData();
  };

  // Admin login screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2D6A6A] to-[#4A9A9A] rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg"
                 style={{ fontFamily: "'Noto Serif SC', serif" }}>管</div>
            <h1 className="text-2xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Noto Serif SC', serif" }}>管理员登录</h1>
            <p className="text-sm text-[#999] mt-2">仅限平台运营人员访问</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-black/5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">管理员账号</label>
              <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入管理员手机号" maxLength={11}
                className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#2D6A6A] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">验证码</label>
              <input type="text" value={loginCode} onChange={e => setLoginCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="请输入验证码" maxLength={6}
                className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#2D6A6A] transition-all" />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <p className="text-xs text-[#2D6A6A] bg-[#2D6A6A]/5 rounded-lg p-3">
              演示环境：管理员手机号 13800000000，验证码 888888
            </p>
            <button onClick={handleAdminLogin}
              className="w-full py-3.5 bg-gradient-to-r from-[#2D6A6A] to-[#4A9A9A] text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              登录管理后台
            </button>
          </div>
          <button onClick={() => router.back()} className="w-full mt-4 text-sm text-[#999] hover:text-[#2C2C2C] transition-colors">
            返回
          </button>
        </motion.div>
      </div>
    );
  }

  // Admin dashboard
  const pendingApps = applications.filter(a => a.status === 'pending');
  const pendingProducts = products.filter(p => p.status === 'draft');

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Admin header */}
      <div className="bg-gradient-to-r from-[#2D6A6A] to-[#4A9A9A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold" style={{ fontFamily: "'Noto Serif SC', serif" }}>桃园管理后台</span>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="text-sm text-white/70 hover:text-white transition-colors">返回前台</button>
            <button onClick={() => { localStorage.removeItem('taoyuan_admin'); setIsAdmin(false); }}
              className="text-sm text-white/70 hover:text-white transition-colors">退出</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '待审核申请', value: pendingApps.length, color: 'border-l-amber-400', bg: 'bg-amber-50' },
            { label: '待审核作品', value: pendingProducts.length, color: 'border-l-blue-400', bg: 'bg-blue-50' },
            { label: '平台用户', value: users.length, color: 'border-l-green-400', bg: 'bg-green-50' },
            { label: '社区帖子', value: posts.length, color: 'border-l-purple-400', bg: 'bg-purple-50' },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-2xl p-5 border border-black/5 border-l-4 ${stat.color}`}>
              <div className="text-3xl font-bold text-[#2C2C2C]">{stat.value}</div>
              <div className="text-sm text-[#999] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-8 border border-black/5 w-fit overflow-x-auto">
          {adminTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-[#2D6A6A] text-white shadow-sm' : 'text-[#999] hover:text-[#2C2C2C]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#2D6A6A]/30 border-t-[#2D6A6A] rounded-full animate-spin" />
          </div>
        )}

        {/* Creator Applications Review */}
        {!loading && activeTab === '创作者审核' && (
          <div className="space-y-4">
            <h3 className="font-bold text-[#2C2C2C] text-lg mb-4">创作者入驻申请审核</h3>
            {applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl text-[#999]">暂无申请记录</div>
            ) : (
              applications.map(app => (
                <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-6 border border-black/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-[#2C2C2C]">{app.realName}</h4>
                      <p className="text-sm text-[#999]">{app.phone} · {app.createdAt?.slice(0, 10)}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      app.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      app.status === 'approved' ? 'bg-green-50 text-green-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已拒绝'}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {app.fields?.map(f => (
                      <span key={f} className="text-xs bg-[#FEF5EC] text-[#5C5C5C] px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#5C5C5C] mb-4">{app.bio}</p>
                  {app.portfolio?.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {app.portfolio.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover bg-[#FEF5EC]" />
                      ))}
                    </div>
                  )}
                  {app.reason && <p className="text-sm text-red-500 mb-3 bg-red-50 rounded-lg p-3">拒绝原因：{app.reason}</p>}
                  {app.status === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => approveApplication(app)}
                        className="px-5 py-2 bg-green-500 text-white text-sm font-medium rounded-full hover:bg-green-600 transition-colors">
                        通过
                      </button>
                      <button onClick={() => rejectApplication(app.id)}
                        className="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors">
                        拒绝
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Product Audit */}
        {!loading && activeTab === '作品审核' && (
          <div className="space-y-4">
            <h3 className="font-bold text-[#2C2C2C] text-lg mb-4">作品审核</h3>
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl text-[#999]">暂无作品</div>
            ) : (
              products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl p-4 border border-black/5 flex gap-4 items-center">
                  <img src={product.images?.[0] || ''} alt="" className="w-16 h-16 rounded-xl object-cover bg-[#FEF5EC]" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#2C2C2C] truncate">{product.title}</h4>
                    <p className="text-xs text-[#999]">¥{product.price} · {product.creatorName}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                    product.status === 'approved' ? 'bg-green-50 text-green-600' :
                    product.status === 'draft' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.status === 'approved' ? '已上架' : product.status === 'draft' ? '待审核' : '已下架'}
                  </span>
                  {product.status === 'draft' && (
                    <div className="flex gap-2">
                      <button onClick={() => approveProduct(product.id)}
                        className="text-xs text-green-600 hover:underline whitespace-nowrap">通过</button>
                      <button onClick={() => rejectProduct(product.id)}
                        className="text-xs text-red-500 hover:underline whitespace-nowrap">拒绝</button>
                    </div>
                  )}
                  {product.status === 'approved' && (
                    <button onClick={() => rejectProduct(product.id)}
                      className="text-xs text-red-500 hover:underline whitespace-nowrap">下架</button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Content Management */}
        {!loading && activeTab === '内容管理' && (
          <div className="space-y-4">
            <h3 className="font-bold text-[#2C2C2C] text-lg mb-4">帖子内容管理</h3>
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl text-[#999]">暂无帖子</div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl p-5 border border-black/5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={post.userAvatar} alt="" className="w-8 h-8 rounded-full bg-[#FEF5EC]" />
                    <span className="text-sm font-medium text-[#2C2C2C]">{post.userName}</span>
                    <span className="text-xs text-[#999]">{post.createdAt?.slice(0, 10)}</span>
                    {post.type && (
                      <span className="text-xs bg-[#FEF5EC] text-[#5C5C5C] px-2 py-0.5 rounded-full">{post.type}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#5C5C5C] mb-3">{post.content?.slice(0, 200)}</p>
                  {post.images?.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {post.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover bg-[#FEF5EC]" />
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#999]">{post.likes} 赞 · {post.comments?.length || 0} 评论</span>
                    <button onClick={() => deletePost(post.id)}
                      className="text-xs text-red-500 hover:underline">删除帖子</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Settlement Management */}
        {!loading && activeTab === '结算管理' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-2xl p-4 border border-black/5 text-center">
                <div className="text-2xl font-bold text-[#E07B5A]">¥{orders.filter(o => o.status === '待发货' || o.status === '已完成').reduce((sum, o) => sum + (o.creatorAmount || o.totalAmount), 0).toFixed(2)}</div>
                <div className="text-xs text-[#999] mt-1">创作者待结算</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-black/5 text-center">
                <div className="text-2xl font-bold text-green-600">¥{orders.filter(o => o.settlementStatus === '已结算').reduce((sum, o) => sum + (o.creatorAmount || o.totalAmount), 0).toFixed(2)}</div>
                <div className="text-xs text-[#999] mt-1">已结算金额</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-black/5 text-center">
                <div className="text-2xl font-bold text-[#2C2C2C]">{orders.filter(o => (o.status === '待发货' || o.status === '已完成') && o.settlementStatus !== '已结算').length}</div>
                <div className="text-xs text-[#999] mt-1">待结算笔数</div>
              </div>
            </div>
            {orders.filter(o => o.status === '待发货' || o.status === '已完成').length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl text-[#999]">暂无待结算订单</div>
            ) : (
              orders.filter(o => o.status === '待发货' || o.status === '已完成').map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-5 border border-black/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-mono text-[#999]">{order.orderNo}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${order.status === '已完成' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{order.status}</span>
                      {order.settlementStatus === '已结算' && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">已结算</span>
                      )}
                    </div>
                    <span className="text-xs text-[#999]">{order.createTime?.slice(0, 10)}</span>
                  </div>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm mb-2">
                      <span className="text-[#2C2C2C]">{item.productName}</span>
                      <span className="text-[#999]">×{item.quantity}</span>
                      <span className="text-[#E07B5A] font-medium">¥{item.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center border-t border-black/3 pt-3 mt-2">
                    <div className="text-sm">
                      <span className="text-[#999]">实付 ¥{order.totalAmount} · 创作者分成 </span>
                      <span className="text-[#E07B5A] font-medium">¥{order.creatorAmount || order.totalAmount}</span>
                    </div>
                    {order.settlementStatus !== '已结算' ? (
                      <button
                        onClick={async () => {
                          await fetch(`/api/orders/${order.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'settle' }),
                          });
                          loadData();
                        }}
                        className="px-4 py-2 bg-[#E07B5A] text-white text-xs font-medium rounded-full hover:bg-[#C56A4A] transition-colors"
                      >
                        标记已结算
                      </button>
                    ) : (
                      <span className="text-xs text-green-600">✓ 已结算</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* System Overview */}
        {!loading && activeTab === '系统概览' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-black/5">
                <h4 className="font-semibold text-[#2C2C2C] mb-4">平台数据统计</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-[#999]">注册用户</span><span className="font-semibold">{users.length}</span></div>
                  <div className="flex justify-between"><span className="text-[#999]">创作者</span><span className="font-semibold">{users.filter(u => u.role === 'creator').length}</span></div>
                  <div className="flex justify-between"><span className="text-[#999]">作品总数</span><span className="font-semibold">{products.length}</span></div>
                  <div className="flex justify-between"><span className="text-[#999]">帖子总数</span><span className="font-semibold">{posts.length}</span></div>
                  <div className="flex justify-between"><span className="text-[#999]">待审核申请</span><span className="font-semibold text-amber-500">{pendingApps.length}</span></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-black/5">
                <h4 className="font-semibold text-[#2C2C2C] mb-4">最近用户</h4>
                <div className="space-y-3">
                  {users.slice(-5).reverse().map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                      <img src={u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="" className="w-8 h-8 rounded-full bg-[#FEF5EC]" />
                      <div>
                        <p className="text-sm font-medium text-[#2C2C2C]">{u.name || '未设置昵称'}</p>
                        <p className="text-xs text-[#999]">{u.phone}</p>
                      </div>
                      <span className="ml-auto text-xs bg-[#FEF5EC] px-2 py-0.5 rounded-full">
                        {u.role === 'creator' ? '创作者' : '用户'}
                      </span>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-sm text-[#999]">暂无用户</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
