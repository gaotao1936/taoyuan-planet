import fs from 'fs';
import path from 'path';
import { Product, Post, Order, User, Creator, PostComment } from './types';

const DATA_DIR = path.join(process.cwd(), '.data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(file: string, fallback: T): T {
  try {
    ensureDir();
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch { return fallback; }
}

function writeJSON(file: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ─── Products ───
export function getProducts(): Product[] {
  return readJSON<Product[]>('products.json', []);
}
export function getProductById(id: number): Product | undefined {
  return getProducts().find(p => p.id === id);
}
export function createProduct(p: Product): Product {
  const items = getProducts(); items.push(p); writeJSON('products.json', items); return p;
}
export function updateProduct(id: number, data: Partial<Product>): Product | null {
  const items = getProducts(); const idx = items.findIndex(p => p.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data }; writeJSON('products.json', items); return items[idx];
}
export function deleteProduct(id: number): boolean {
  const items = getProducts(); const filtered = items.filter(p => p.id !== id);
  if (filtered.length === items.length) return false;
  writeJSON('products.json', filtered); return true;
}

// ─── Posts ───
export function getPosts(): Post[] {
  return readJSON<Post[]>('posts.json', []);
}
export function getPostById(id: number): Post | undefined {
  return getPosts().find(p => p.id === id);
}
export function createPost(p: Post): Post {
  const items = getPosts(); items.unshift(p); writeJSON('posts.json', items); return p;
}
export function deletePost(id: number): boolean {
  const items = getPosts(); const filtered = items.filter(p => p.id !== id);
  if (filtered.length === items.length) return false;
  writeJSON('posts.json', filtered); return true;
}
export function togglePostLike(id: number): Post | null {
  const items = getPosts(); const idx = items.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const post = items[idx];
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  writeJSON('posts.json', items);
  return post;
}
export function togglePostCollect(id: number): Post | null {
  const items = getPosts(); const idx = items.findIndex(p => p.id === id);
  if (idx === -1) return null;
  items[idx].collected = !items[idx].collected;
  writeJSON('posts.json', items);
  return items[idx];
}
export function addComment(postId: number, comment: PostComment): Post | null {
  const items = getPosts(); const idx = items.findIndex(p => p.id === postId);
  if (idx === -1) return null;
  items[idx].comments.push(comment);
  writeJSON('posts.json', items);
  return items[idx];
}

// ─── Orders ───
export function getOrders(): Order[] {
  return readJSON<Order[]>('orders.json', []);
}
export function getOrderById(id: string): Order | undefined {
  return getOrders().find(o => o.id === id);
}
export function createOrder(o: Order): Order {
  const items = getOrders(); items.unshift(o); writeJSON('orders.json', items); return o;
}
export function updateOrderStatus(id: string, status: string): Order | null {
  const items = getOrders(); const idx = items.findIndex(o => o.id === id);
  if (idx === -1) return null;
  items[idx].status = status;
  writeJSON('orders.json', items);
  return items[idx];
}
export function getOrderByOrderNo(orderNo: string): Order | undefined {
  return getOrders().find(o => o.orderNo === orderNo);
}
export function markOrderPaid(orderNo: string, transactionId: string): Order | null {
  const items = getOrders(); const idx = items.findIndex(o => o.orderNo === orderNo);
  if (idx === -1) return null;
  items[idx].status = '待发货';
  items[idx].transactionId = transactionId;
  items[idx].paidAt = new Date().toISOString();
  writeJSON('orders.json', items);
  return items[idx];
}

// ─── Users ───
export function getUsers(): User[] {
  return readJSON<User[]>('users.json', []);
}
export function getUserById(id: number): User | undefined {
  return getUsers().find(u => u.id === id);
}
export function createUser(u: User): User {
  const items = getUsers(); items.push(u); writeJSON('users.json', items); return u;
}
export function updateUser(id: number, data: Partial<User>): User | null {
  const items = getUsers(); const idx = items.findIndex(u => u.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data }; writeJSON('users.json', items); return items[idx];
}

// ─── Creators ───
export function getCreators(): Creator[] {
  return readJSON<Creator[]>('creators.json', []);
}
export function getCreatorById(id: number): Creator | undefined {
  return getCreators().find(c => c.id === id);
}
export function createCreator(c: Creator): Creator {
  const items = getCreators(); items.push(c); writeJSON('creators.json', items); return c;
}
export function updateCreator(id: number, data: Partial<Creator>): Creator | null {
  const items = getCreators(); const idx = items.findIndex(c => c.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data }; writeJSON('creators.json', items); return items[idx];
}

export interface CreatorApplication {
  id: number;
  userId: number;
  realName: string;
  phone: string;
  fields: string[];
  bio: string;
  portfolio: string[];
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
}
export function getApplications(): CreatorApplication[] {
  return readJSON<CreatorApplication[]>('applications.json', []);
}
export function createApplication(a: CreatorApplication): CreatorApplication {
  const items = getApplications(); items.unshift(a); writeJSON('applications.json', items); return a;
}
export function updateApplication(id: number, data: Partial<CreatorApplication>): CreatorApplication | null {
  const items = getApplications(); const idx = items.findIndex(a => a.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data }; writeJSON('applications.json', items); return items[idx];
}

// ─── Init seed data ───
export function seedData(products: Product[], posts: Post[], orders: Order[], users: User[], creators: Creator[]) {
  if (!fs.existsSync(path.join(DATA_DIR, 'products.json'))) writeJSON('products.json', products);
  if (!fs.existsSync(path.join(DATA_DIR, 'posts.json'))) writeJSON('posts.json', posts);
  if (!fs.existsSync(path.join(DATA_DIR, 'orders.json'))) writeJSON('orders.json', orders);
  if (!fs.existsSync(path.join(DATA_DIR, 'users.json'))) writeJSON('users.json', users);
  if (!fs.existsSync(path.join(DATA_DIR, 'creators.json'))) writeJSON('creators.json', creators);
  if (!fs.existsSync(path.join(DATA_DIR, 'applications.json'))) writeJSON('applications.json', []);
}
