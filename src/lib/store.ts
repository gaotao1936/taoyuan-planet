import fs from 'fs';
import path from 'path';
import { Product, Post, Order, User, Creator, PostComment } from './types';

const PROJ_DIR = path.join(process.cwd(), '.data');
// Vercel serverless: process.cwd() is read-only, /tmp/ is writable
const TMP_DIR = '/tmp/.data';
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? TMP_DIR : PROJ_DIR;

function ensureDir() {
  const dir = isVercel ? TMP_DIR : PROJ_DIR;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  // On Vercel, copy seed files from project to /tmp on first access
  if (isVercel && !fs.existsSync(path.join(TMP_DIR, '_init'))) {
    if (fs.existsSync(PROJ_DIR)) {
      const files = fs.readdirSync(PROJ_DIR);
      for (const file of files) {
        if (file.endsWith('.json') && !fs.existsSync(path.join(TMP_DIR, file))) {
          fs.writeFileSync(path.join(TMP_DIR, file), fs.readFileSync(path.join(PROJ_DIR, file)));
        }
      }
    }
    fs.writeFileSync(path.join(TMP_DIR, '_init'), '1');
  }
}

function readJSON<T>(file: string, fallback: T): T {
  try {
    ensureDir();
    // Try write dir first (may have updated data), then project dir for seed
    const writePath = path.join(DATA_DIR, file);
    if (fs.existsSync(writePath)) {
      return JSON.parse(fs.readFileSync(writePath, 'utf-8'));
    }
    if (isVercel) {
      const seedPath = path.join(PROJ_DIR, file);
      if (fs.existsSync(seedPath)) {
        return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      }
    }
    return fallback;
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
export function markOrderSettled(id: string, note?: string): Order | null {
  const items = getOrders(); const idx = items.findIndex(o => o.id === id || o.orderNo === id);
  if (idx === -1) return null;
  items[idx].settlementStatus = '已结算';
  items[idx].settledAt = new Date().toISOString();
  if (note) items[idx].settlementNote = note;
  writeJSON('orders.json', items);
  return items[idx];
}
export function getOrdersByCreator(creatorId: number): Order[] {
  return getOrders().filter(o => {
    // Orders where the product belongs to this creator
    return o.items.some(item => {
      const products = getProducts();
      const product = products.find(p => p.id === item.productId);
      return product && product.creatorId === creatorId;
    });
  });
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
  idCard: string;
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

// ─── SMS Codes ───
interface SmsCodeEntry {
  phone: string;
  code: string;
  expiresAt: number;
}
export function saveSmsCode(phone: string, code: string) {
  const codes = readJSON<SmsCodeEntry[]>('sms_codes.json', []);
  // Remove expired entries
  const now = Date.now();
  const valid = codes.filter(c => c.expiresAt > now);
  valid.push({ phone, code, expiresAt: now + 5 * 60 * 1000 });
  writeJSON('sms_codes.json', valid);
}
export function verifySmsCode(phone: string, code: string): boolean {
  const codes = readJSON<SmsCodeEntry[]>('sms_codes.json', []);
  const now = Date.now();
  const match = codes.find(c => c.phone === phone && c.code === code && c.expiresAt > now);
  // Clean expired
  if (codes.some(c => c.expiresAt <= now)) {
    writeJSON('sms_codes.json', codes.filter(c => c.expiresAt > now));
  }
  return !!match;
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
