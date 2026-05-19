'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import PostCard from '@/components/PostCard';
import { mockCategories } from '@/data/mockData';
import { Product, Post } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem('taoyuan_products');
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    const storedPosts = localStorage.getItem('taoyuan_posts');
    if (storedPosts) setPosts(JSON.parse(storedPosts));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-[#FFF8F0]">
        {/* Background atmosphere */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#F0A88C]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C9A96E]/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2D6A6A]/6 rounded-full blur-[180px]" />
        </div>

        {/* Decorative top line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E07B5A]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 py-28 md:py-40 relative">
          <div className="max-w-3xl">
            {/* Label */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#E07B5A] tracking-wider uppercase"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}>
                <span className="w-8 h-px bg-[#E07B5A]/40" />
                桃园计划 · 文创平台
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#2C2C2C] leading-[1.05] mb-8 tracking-tight"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              分享创作
              <br />
              <span className="text-gradient-warm">分享美学</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-lg md:text-xl text-[#5C5C5C] mb-12 max-w-lg leading-relaxed"
            >
              连接独立设计师与文创爱好者，发现独一无二的原创作品，感受每一件创作背后的故事与温度。
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/category"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#E07B5A] text-white font-semibold rounded-full hover:bg-[#C56A4A] hover:shadow-lg hover:shadow-[#E07B5A]/20 transition-all duration-300 group"
              >
                探索作品
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center justify-center px-8 py-4 border border-[#E07B5A]/20 text-[#E07B5A] font-semibold rounded-full hover:bg-[#E07B5A]/5 transition-all duration-300"
              >
                加入社区
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom decorative curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path d="M0 60V30C180 60 360 0 540 15C720 30 900 60 1080 30C1260 0 1440 30 1440 30V60H0Z" fill="#FEF5EC"/>
          </svg>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="bg-[#FEF5EC] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-xs font-medium text-[#E07B5A] tracking-widest uppercase" style={{ fontFamily: "'Noto Serif SC', serif" }}>Discover</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mt-3 mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              探索文创品类
            </h2>
            <p className="text-[#5C5C5C] max-w-md mx-auto">六大品类，精选原创设计，发现属于你的那一件</p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {mockCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Link
                  href={`/category?id=${cat.id}`}
                  className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-black/5 hover:border-[#E07B5A]/20 hover:shadow-lg hover:shadow-[#E07B5A]/5 transition-all duration-300 group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                  <span className="text-sm font-semibold text-[#2C2C2C]">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="py-24 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="text-xs font-medium text-[#E07B5A] tracking-widest uppercase" style={{ fontFamily: "'Noto Serif SC', serif" }}>Curated</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mt-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                精选作品
              </h2>
            </div>
            <Link href="/category" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#E07B5A] hover:text-[#C56A4A] transition-colors">
              浏览全部
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.filter(p => p.status === 'approved').slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#999]">
              <span className="text-4xl block mb-3">📦</span>
              <p className="text-sm">暂无作品，成为创作者来发布第一件作品吧</p>
              <Link href="/creator-apply" className="text-[#E07B5A] text-sm hover:underline mt-2 inline-block">申请成为创作者</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Community ─── */}
      <section className="py-24 bg-[#FEF5EC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="text-xs font-medium text-[#2D6A6A] tracking-widest uppercase" style={{ fontFamily: "'Noto Serif SC', serif" }}>Community</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mt-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                社区动态
              </h2>
            </div>
            <Link href="/community" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#2D6A6A] hover:text-[#1D5A5A] transition-colors">
              进入社区
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#999]">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-sm">暂无社区动态，来发布第一条帖子吧</p>
              <Link href="/post-create" className="text-[#E07B5A] text-sm hover:underline mt-2 inline-block">发布帖子</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                ),
                title: '原创设计',
                desc: '汇聚国内外独立设计师的原创作品，每一件都独一无二，拒绝千篇一律。',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
                title: '直连创作者',
                desc: '去除中间环节，在社区里与设计师直接交流，定制属于你的独特作品。',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: '品质保障',
                desc: '严格的作品审核与创作者认证机制，平台质检，保障每一件作品品质。',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group p-10 bg-white rounded-3xl border border-black/5 hover:border-[#E07B5A]/15 hover:shadow-lg transition-all duration-500"
              >
                <div className="w-12 h-12 bg-[#E07B5A]/8 text-[#E07B5A] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E07B5A] group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  {feature.title}
                </h3>
                <p className="text-[#5C5C5C] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="pb-24 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#E07B5A] via-[#D4785A] to-[#C56A4A] rounded-[40px] p-12 md:p-20 text-center text-white"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <h2 className="text-3xl md:text-5xl font-bold mb-4 relative" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              准备好发现你的心头好了吗？
            </h2>
            <p className="text-white/70 mb-10 max-w-lg mx-auto relative text-lg">加入桃园，成为文创爱好者社区的一员，开启你的美学之旅</p>
            <Link
              href="/category"
              className="inline-flex items-center px-10 py-4 bg-white text-[#E07B5A] font-semibold rounded-full hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 relative"
            >
              立即探索
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
