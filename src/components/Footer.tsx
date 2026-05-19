import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-[#999]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-[#E07B5A] to-[#C9A96E] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                   style={{ fontFamily: "'Noto Serif SC', serif" }}>
                桃
              </div>
              <span className="text-white font-bold text-lg" style={{ fontFamily: "'Noto Serif SC', serif" }}>桃园</span>
            </div>
            <p className="text-sm leading-relaxed text-[#777]">分享创作，分享美学<br />中国原创文创平台</p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>探索</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/category" className="text-[#777] hover:text-white transition-colors">分类浏览</Link>
              <Link href="/community" className="text-[#777] hover:text-white transition-colors">社区</Link>
              <Link href="/search" className="text-[#777] hover:text-white transition-colors">搜索</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>功能</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/creator-apply" className="text-[#777] hover:text-white transition-colors">成为创作者</Link>
              <Link href="/chat" className="text-[#777] hover:text-white transition-colors">AI 助手</Link>
              <Link href="/cart" className="text-[#777] hover:text-white transition-colors">购物车</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>关于</h4>
            <div className="flex flex-col gap-2.5 text-sm text-[#777]">
              <span>hello@taoyuan.design</span>
              <span>© 2026 桃园计划</span>
            </div>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-white/8 text-center text-xs text-[#555]">
          桃园计划 - 文创产品平台社区 · 让每一件原创设计找到欣赏它的人
        </div>
      </div>
    </footer>
  );
}
