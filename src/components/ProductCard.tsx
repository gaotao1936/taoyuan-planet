'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from '@/components/ui/use-toast';

export default function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const liked = isWishlisted(product.id);
  const discountPercent = Math.round((1 - product.price / product.originalPrice) * 100);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      images: product.images,
      creatorName: product.creatorName,
    });
    toast(liked ? '已取消收藏' : '已加入收藏');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
    >
      <Link
        href={`/product/${product.id}`}
        className="block bg-white rounded-2xl overflow-hidden border border-black/5 hover:border-[#E07B5A]/15 hover:shadow-lg hover:shadow-[#E07B5A]/5 transition-all duration-300 group"
      >
        <div className="aspect-square bg-[#FEF5EC] relative overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-[#E07B5A] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
              -{discountPercent}%
            </div>
          )}
          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm transition-all z-10 ${
              liked
                ? 'bg-[#E07B5A] text-white'
                : 'bg-white/90 backdrop-blur-sm text-[#bbb] hover:bg-white hover:text-[#E07B5A]'
            }`}
          >
            {liked ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[#2C2C2C] text-sm line-clamp-1 mb-1">{product.title}</h3>
          <p className="text-xs text-[#999] mb-2">{product.creatorName}</p>
          {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length))}</span>
              <span className="text-[11px] text-[#bbb]">({product.reviews.length})</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#E07B5A] font-bold text-lg">¥{product.price}</span>
              {discountPercent > 0 && (
                <span className="text-[#bbb] text-xs line-through">¥{product.originalPrice}</span>
              )}
            </div>
            <span className="text-[11px] text-[#bbb]">已售 {product.salesCount}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
