export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  categoryId: number;
  images: string[];
  icon: string;
  creatorId: number;
  creatorName: string;
  salesCount: number;
  status: string;
  createdAt: string;
  stock: number;
  tags: string[];
  reviews: Review[];
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Creator {
  id: number;
  name: string;
  avatar: string;
  level: string;
  bio: string;
  fans: number;
  productCount: number;
  tags: string[];
}

export interface Post {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  images: string[];
  likes: number;
  liked: boolean;
  collected: boolean;
  comments: PostComment[];
  createdAt: string;
  tags?: string[];
  type?: string;
}

export interface PostComment {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  createTime: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: string;
  transactionId?: string;
  paymentMethod?: string;
  paidAt?: string;
  /** Platform commission rate at time of order (0-1) */
  commissionRate?: number;
  /** Creator's net earnings after commission */
  creatorAmount?: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  isCreator: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
