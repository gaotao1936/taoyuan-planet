'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from '@/components/ui/use-toast';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { Product } from '@/lib/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviews, setReviews] = useState<Product['reviews']>([]);

  useEffect(() => {
    const products: Product[] = JSON.parse(localStorage.getItem('taoyuan_products') || '[]');
    const found = products.find((p) => p.id === Number(params.id));
    if (found) {
      setProduct(found);
      setReviews(found.reviews || []);
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FEF5EC] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>作品未找到</h2>
          <Link href="/category" className="text-[#E07B5A] hover:underline">返回浏览</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        images: product.images,
        creatorName: product.creatorName,
        status: product.status,
      });
    }
    setAddedToCart(true);
    toast({ title: '已加入购物车', description: `${product.title} x${quantity}` });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const wishlisted = isWishlisted(product.id);

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      images: product.images,
      creatorName: product.creatorName,
    });
    toast(wishlisted ? '已取消收藏' : '已加入收藏');
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    const newReview = {
      id: Date.now(),
      userId: 0,
      userName: '当前用户',
      rating: reviewRating,
      content: reviewText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    setReviewText('');
    toast({ title: '评价发表成功', description: '感谢你的分享！' });

    const products: Product[] = JSON.parse(localStorage.getItem('taoyuan_products') || '[]');
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      products[idx].reviews = updatedReviews;
      localStorage.setItem('taoyuan_products', JSON.stringify(products));
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF5EC]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <ImageCarousel
              images={product.images}
              alt={product.title}
              className="aspect-square"
              showThumbnails
            />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <span className="text-sm text-[#E07B5A] font-medium mb-2">{product.icon} {product.category}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>{product.title}</h1>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-[#E07B5A]">¥{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-[#bbb] line-through">¥{product.originalPrice}</span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6 text-sm text-[#999]">
              <span>已售 {product.salesCount}</span>
              <span>·</span>
              <span>库存 {product.stock}</span>
              <span>·</span>
              <span>状态 {product.status === 'approved' ? '✅ 在售' : '⏳ 审核中'}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-white text-[#999] px-2.5 py-1 rounded-full border border-black/5">#{tag}</span>
              ))}
            </div>

            <p className="text-[#5C5C5C] leading-relaxed mb-8">{product.description}</p>

            {/* Creator info */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#E07B5A]/10 flex items-center justify-center text-lg">
                {product.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2C2C2C]">{product.creatorName}</span>
                  <span className="text-xs bg-[#E07B5A]/10 text-[#E07B5A] px-2 py-0.5 rounded-full">创作者</span>
                </div>
                <p className="text-xs text-[#999]">原创设计</p>
              </div>
            </div>

            {/* Quantity + Add to cart + Wishlist */}
            <div className="flex items-center gap-3 mt-auto">
              <div className="flex items-center border border-black/10 rounded-full bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#2C2C2C]"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-[#2C2C2C]"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.status !== 'approved'}
                className={`flex-1 py-3.5 rounded-full font-semibold text-center transition-all ${
                  product.status !== 'approved'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-[#E07B5A] to-[#D4946A] text-white hover:shadow-lg hover:shadow-[#E07B5A]/20'
                }`}
              >
                {product.status !== 'approved' ? '待审核作品' : addedToCart ? '✓ 已加入购物车' : '加入购物车'}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg border transition-all flex-shrink-0 ${
                  wishlisted
                    ? 'bg-[#E07B5A] border-[#E07B5A] text-white'
                    : 'bg-white border-black/10 text-[#bbb] hover:border-[#E07B5A] hover:text-[#E07B5A]'
                }`}
              >
                {wishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Buy now button */}
            <button
              onClick={() => router.push(`/checkout?productId=${product.id}&qty=${quantity}`)}
              disabled={product.status !== 'approved'}
              className="w-full mt-3 py-3.5 rounded-full font-semibold bg-gradient-to-r from-[#2C2C2C] to-[#3D3D3D] text-white hover:shadow-lg hover:shadow-black/10 transition-all disabled:opacity-40"
            >
              立即购买
            </button>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-6" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            用户评价 ({reviews.length})
          </h3>

          {/* Review form */}
          <div className="bg-white rounded-2xl p-6 border border-black/5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-[#999]">评分:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-xl transition-colors ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="分享你的使用体验..."
              maxLength={500}
              className="w-full px-4 py-3 bg-[#FEF5EC] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#E07B5A] resize-none h-24"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-[#bbb]">{reviewText.length}/500</span>
              <button
                onClick={handleSubmitReview}
                disabled={!reviewText.trim()}
                className="px-5 py-2 bg-[#E07B5A] text-white text-sm font-medium rounded-full hover:bg-[#C56A4A] disabled:opacity-40 transition-all"
              >
                发表评价
              </button>
            </div>
          </div>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-5 border border-black/5 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-[#2C2C2C]">{review.userName}</span>
                  <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}</span>
                  <span className="text-xs text-[#bbb] ml-auto">{new Date(review.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-sm text-[#5C5C5C]">{review.content}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-[#bbb] py-8">暂无评价，成为第一个评价的人吧</p>
          )}
        </div>
      </div>
    </div>
  );
}
