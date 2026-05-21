import { Product, Category, Creator, Post, Order, User } from '@/lib/types';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

export const mockCategories: Category[] = [
  { id: 1, name: '陶瓷', icon: '🏺' },
  { id: 2, name: '刺绣', icon: '🪡' },
  { id: 3, name: '编织', icon: '🧺' },
  { id: 4, name: '剪纸', icon: '✂️' },
  { id: 5, name: '木作', icon: '🪵' },
  { id: 6, name: '布艺印染', icon: '🎨' },
  { id: 7, name: '首饰', icon: '💎' },
  { id: 8, name: '文房雅器', icon: '🖌️' },
  { id: 9, name: '漆器', icon: '🏮' },
  { id: 10, name: '金属工艺', icon: '🔨' },
  { id: 11, name: '皮艺', icon: '👜' },
  { id: 12, name: '绘画', icon: '🖼️' },
  { id: 13, name: '摄影', icon: '📷' },
  { id: 14, name: '雕塑', icon: '🗿' },
  { id: 15, name: '非遗传承', icon: '🏛️' },
  { id: 16, name: '其他', icon: '✨' },
];

export const mockProducts: Product[] = [
  {
    id: 16, title: '桃园001', description: '桃园计划首发纪念款文创艺术品。融合传统中国水墨与现代极简设计，采用环保宣纸材质手工装裱，每幅作品独立编号。这不仅是一幅画作，更是一份对传统文化复兴的致敬。全球限量100幅，手写编号，附赠桃园官方收藏证书与独立编号卡。尺寸：50cm×50cm（含框）。', price: 0.01, originalPrice: 0.01, category: '绘画', categoryId: 12, icon: '🌸', creatorId: 0, creatorName: '桃园官方', salesCount: 0, status: 'approved', createdAt: '2026-05-20', stock: 100, tags: ['首发', '纪念', '限量', '水墨', '官方', '收藏'], images: [img('taoyuan001a'), img('taoyuan001b'), img('taoyuan001c')], reviews: [],
  },
  {
    id: 1, title: '青花手绘茶杯', description: '景德镇手工拉坯，传统青花工艺绘制，每只杯子纹样略有不同，独一无二。胎体轻薄通透，适合冲泡绿茶、白茶。', price: 168, originalPrice: 220, category: '陶瓷', categoryId: 1, icon: '🏺', creatorId: 1, creatorName: '山月陶舍', salesCount: 326, status: 'approved', createdAt: '2025-12-01', stock: 50, tags: ['陶瓷', '手工', '青花', '茶具'], images: [img('ceramic1'), img('ceramic2'), img('ceramic3')], reviews: [{ id: 1, userId: 100, userName: '茶语人生', rating: 5, content: '非常精致，手感温润，喝茶的心情都变好了。', createdAt: '2026-01-15' }],
  },
  {
    id: 2, title: '苏绣团扇·蝶恋花', description: '苏州绣娘纯手工刺绣，双面绣工艺，蝴蝶与牡丹栩栩如生。紫檀木扇柄，配真丝流苏。', price: 388, originalPrice: 520, category: '刺绣', categoryId: 2, icon: '🪡', creatorId: 8, creatorName: '吴门绣庄', salesCount: 215, status: 'approved', createdAt: '2025-11-20', stock: 12, tags: ['刺绣', '苏绣', '团扇', '非遗'], images: [img('embroider1'), img('embroider2'), img('embroider3')], reviews: [{ id: 2, userId: 110, userName: '江南好', rating: 5, content: '精美绝伦，送外国客户非常体面。', createdAt: '2026-02-20' }],
  },
  {
    id: 3, title: '手工编织挂毯', description: '纯棉线手工编织，几何图案设计，可做墙面装饰或桌旗。每件耗时约15小时完成。', price: 299, originalPrice: 399, category: '编织', categoryId: 3, icon: '🧺', creatorId: 2, creatorName: '织梦人', salesCount: 198, status: 'approved', createdAt: '2025-11-15', stock: 20, tags: ['编织', '挂毯', '家居', '几何'], images: [img('weave1'), img('weave2'), img('weave3')], reviews: [{ id: 3, userId: 101, userName: '小窝生活', rating: 5, content: '挂在家里客厅，朋友们都问哪里买的。', createdAt: '2026-02-10' }],
  },
  {
    id: 4, title: '十二生肖剪纸相框', description: '非遗传承人手工剪制，十二生肖主题，装裱在实木相框中。送礼自用两相宜。', price: 128, originalPrice: 168, category: '剪纸', categoryId: 4, icon: '✂️', creatorId: 3, creatorName: '纸间艺术', salesCount: 512, status: 'approved', createdAt: '2025-10-20', stock: 100, tags: ['剪纸', '非遗', '生肖', '相框'], images: [img('papercut1'), img('papercut2'), img('papercut3')], reviews: [{ id: 4, userId: 102, userName: '文化爱好者', rating: 5, content: '非常精美，送外国朋友很有面子。', createdAt: '2026-01-20' }],
  },
  {
    id: 5, title: '黑胡桃木蓝牙音箱', description: '北美黑胡桃木手工打造，内置高品质蓝牙5.0模块，续航8小时。木纹独一无二。', price: 399, originalPrice: 520, category: '木作', categoryId: 5, icon: '🪵', creatorId: 6, creatorName: '木说工作室', salesCount: 267, status: 'approved', createdAt: '2025-10-10', stock: 10, tags: ['木作', '音箱', '蓝牙', '胡桃木'], images: [img('wood1'), img('wood2'), img('wood3')], reviews: [{ id: 5, userId: 106, userName: '数码控', rating: 4, content: '音质不错，关键是颜值高，放桌上就是艺术品。', createdAt: '2026-03-12' }],
  },
  {
    id: 6, title: '蓝染手工抱枕套', description: '采用传统蓝染工艺，纯棉面料手工扎染。每个抱枕纹样都是独一无二的。不含枕芯。', price: 138, originalPrice: 180, category: '布艺印染', categoryId: 6, icon: '🎨', creatorId: 7, creatorName: '草木染坊', salesCount: 634, status: 'approved', createdAt: '2025-08-15', stock: 80, tags: ['布艺', '蓝染', '抱枕', '家居'], images: [img('fabric1'), img('fabric2'), img('fabric3')], reviews: [{ id: 6, userId: 107, userName: '家居控', rating: 5, content: '颜色太好看了，给沙发增加了艺术气息。', createdAt: '2026-02-14' }],
  },
  {
    id: 7, title: '天然石手工项链', description: '精选天然半宝石，手工绕线制作。每条项链独一无二，附赠绒布收纳袋。', price: 199, originalPrice: 280, category: '首饰', categoryId: 7, icon: '💎', creatorId: 5, creatorName: '瑾色手作', salesCount: 441, status: 'approved', createdAt: '2025-11-01', stock: 15, tags: ['首饰', '手工', '天然石', '项链'], images: [img('jewelry1'), img('jewelry2'), img('jewelry3')], reviews: [{ id: 7, userId: 105, userName: '小仙女', rating: 5, content: '很好看！比照片还有质感，朋友生日准备再买一条。', createdAt: '2026-01-08' }],
  },
  {
    id: 8, title: '紫光檀木钢笔', description: '选用东非紫光檀木，手工车旋制作。搭配德国铱金笔尖，书写顺滑流畅。', price: 258, originalPrice: 350, category: '文房雅器', categoryId: 8, icon: '🖌️', creatorId: 4, creatorName: '墨林工坊', salesCount: 189, status: 'approved', createdAt: '2025-12-20', stock: 30, tags: ['钢笔', '木制', '手工', '文房'], images: [img('pen1'), img('pen2'), img('pen3')], reviews: [{ id: 8, userId: 104, userName: '书法爱好者', rating: 5, content: '手感极佳，重量适中，长时间书写不累。', createdAt: '2026-02-28' }],
  },
  {
    id: 9, title: '大漆茶则·金缮', description: '脱胎漆器工艺，大漆髹涂，金缮点缀。茶道中的艺术品。', price: 580, originalPrice: 780, category: '漆器', categoryId: 9, icon: '🏮', creatorId: 9, creatorName: '大漆工房', salesCount: 87, status: 'approved', createdAt: '2025-09-10', stock: 5, tags: ['漆器', '茶道', '金缮', '非遗'], images: [img('lacquer1'), img('lacquer2'), img('lacquer3')], reviews: [{ id: 9, userId: 111, userName: '茶道中人', rating: 5, content: '大漆的温润无可替代，爱不释手。', createdAt: '2026-03-01' }],
  },
  {
    id: 10, title: '手工锻打铜壶', description: '非遗铜器锻打工艺，一锤一锤敲出肌理。纯紫铜材质，煮水泡茶口感甘甜。', price: 680, originalPrice: 880, category: '金属工艺', categoryId: 10, icon: '🔨', creatorId: 10, creatorName: '铜艺斋', salesCount: 143, status: 'approved', createdAt: '2025-07-20', stock: 8, tags: ['金属工艺', '铜器', '茶器', '非遗'], images: [img('metal1'), img('metal2'), img('metal3')], reviews: [{ id: 10, userId: 112, userName: '煮茶人', rating: 5, content: '铜壶煮水确实不一样，甘甜许多。', createdAt: '2026-01-10' }],
  },
  {
    id: 11, title: '植鞣牛皮托特包', description: '意大利植鞣牛皮，手工裁切缝制。会随使用时间养出独特色泽。', price: 599, originalPrice: 780, category: '皮艺', categoryId: 11, icon: '👜', creatorId: 11, creatorName: '素人手作', salesCount: 378, status: 'approved', createdAt: '2025-10-05', stock: 25, tags: ['皮艺', '手工', '托特包', '植鞣'], images: [img('leather1'), img('leather2'), img('leather3')], reviews: [{ id: 11, userId: 113, userName: '极简控', rating: 5, content: '皮质很好，越用越有味道。', createdAt: '2026-02-05' }],
  },
  {
    id: 12, title: '水墨山水手卷', description: '青年画家原创水墨山水，宣纸手绘，可卷轴装裱。适合书房、茶室悬挂。', price: 320, originalPrice: 450, category: '绘画', categoryId: 12, icon: '🖼️', creatorId: 12, creatorName: '墨韵轩', salesCount: 156, status: 'approved', createdAt: '2025-12-10', stock: 18, tags: ['绘画', '水墨', '山水', '国画'], images: [img('painting1'), img('painting2'), img('painting3')], reviews: [{ id: 12, userId: 114, userName: '文人墨客', rating: 5, content: '笔墨功底扎实，意境悠远。', createdAt: '2026-03-15' }],
  },
  {
    id: 13, title: '古镇晨雾·艺术微喷', description: '摄影师原创作品，记录江南古镇清晨。博物馆级艺术微喷，可定制尺寸和装裱。', price: 199, originalPrice: 280, category: '摄影', categoryId: 13, icon: '📷', creatorId: 13, creatorName: '光影行者', salesCount: 432, status: 'approved', createdAt: '2025-11-25', stock: 50, tags: ['摄影', '风景', '江南', '装饰画'], images: [img('photo1'), img('photo2'), img('photo3')], reviews: [{ id: 13, userId: 115, userName: '旅行控', rating: 5, content: '拍出了江南的韵味，挂餐厅很美。', createdAt: '2026-04-01' }],
  },
  {
    id: 14, title: '泥塑生肖摆件·兔', description: '非遗泥塑工艺，手工捏制上色。造型憨态可掬，适合案头摆放。', price: 98, originalPrice: 138, category: '雕塑', categoryId: 14, icon: '🗿', creatorId: 14, creatorName: '泥人张传人', salesCount: 678, status: 'approved', createdAt: '2025-08-01', stock: 120, tags: ['雕塑', '泥塑', '生肖', '非遗'], images: [img('sculpture1'), img('sculpture2'), img('sculpture3')], reviews: [{ id: 14, userId: 116, userName: '民俗迷', rating: 5, content: '传统手艺，做得真精致。', createdAt: '2026-01-25' }],
  },
  {
    id: 15, title: '非遗·皮影戏套装', description: '手工雕刻牛皮皮影，含经典角色6件+简易戏台。适合非遗体验、亲子互动。', price: 268, originalPrice: 360, category: '非遗传承', categoryId: 15, icon: '🏛️', creatorId: 15, creatorName: '皮影传承馆', salesCount: 234, status: 'approved', createdAt: '2025-09-20', stock: 35, tags: ['非遗', '皮影', '体验', '亲子'], images: [img('heritage1'), img('heritage2'), img('heritage3')], reviews: [{ id: 15, userId: 117, userName: '带娃达人', rating: 5, content: '孩子玩得不想放下，了解传统文化的好方式。', createdAt: '2026-04-10' }],
  },
];

export const mockCreators: Creator[] = [
  { id: 0, name: '桃园官方', avatar: img('avatar0'), level: '平台官方', bio: '桃园计划官方账号，首发纪念作品发行方。致力于推动中国传统手工艺的数字化传播与商业化探索。', fans: 0, productCount: 1, tags: ['官方', '首发', '纪念'] },
  { id: 1, name: '山月陶舍', avatar: img('avatar1'), level: '资深创作者', bio: '景德镇陶瓷世家第三代传人，专注手工生活陶器。', fans: 3580, productCount: 28, tags: ['陶瓷', '手工', '茶具'] },
  { id: 2, name: '织梦人', avatar: img('avatar2'), level: '认证创作者', bio: '用棉线编织温暖，一针一线都是故事。', fans: 2150, productCount: 15, tags: ['编织', '家居', '挂毯'] },
  { id: 3, name: '纸间艺术', avatar: img('avatar3'), level: '非遗传承人', bio: '从事剪纸艺术20年，致力于将传统剪纸融入现代生活。', fans: 12000, productCount: 42, tags: ['剪纸', '非遗', '装饰'] },
  { id: 4, name: '墨林工坊', avatar: img('avatar4'), level: '资深创作者', bio: '专注于文房器物设计，让书写成为一种享受。', fans: 5230, productCount: 35, tags: ['文房', '钢笔', '木制'] },
  { id: 5, name: '瑾色手作', avatar: img('avatar5'), level: '认证创作者', bio: '独立首饰设计师，偏爱天然材质与极简美学。', fans: 8900, productCount: 56, tags: ['首饰', '天然石', '手工'] },
  { id: 6, name: '木说工作室', avatar: img('avatar6'), level: '资深创作者', bio: '以木为媒，探索木作的无限可能。', fans: 4300, productCount: 22, tags: ['木作', '家居', '数码'] },
  { id: 7, name: '草木染坊', avatar: img('avatar7'), level: '认证创作者', bio: '复原传统草木染工艺，用植物的颜色装点生活。', fans: 6700, productCount: 40, tags: ['布艺印染', '蓝染', '传统工艺'] },
  { id: 8, name: '吴门绣庄', avatar: img('avatar8'), level: '非遗传承人', bio: '苏绣世家第四代，让千年刺绣走进现代日常生活。', fans: 15600, productCount: 60, tags: ['刺绣', '苏绣', '非遗'] },
  { id: 9, name: '大漆工房', avatar: img('avatar9'), level: '资深创作者', bio: '专注大漆工艺十年，探索漆器在当代生活中的可能。', fans: 3200, productCount: 18, tags: ['漆器', '金缮', '茶道'] },
  { id: 10, name: '铜艺斋', avatar: img('avatar10'), level: '非遗传承人', bio: '传统铜器锻打技艺传承人，每一件都是独一无二的手工之作。', fans: 4500, productCount: 25, tags: ['金属工艺', '铜器', '非遗'] },
  { id: 11, name: '素人手作', avatar: img('avatar11'), level: '认证创作者', bio: '坚持手工皮具，追求皮料与时间的对话。', fans: 7800, productCount: 48, tags: ['皮艺', '手工', '极简'] },
  { id: 12, name: '墨韵轩', avatar: img('avatar12'), level: '认证创作者', bio: '美术学院毕业，专注水墨山水与现代审美的融合。', fans: 5600, productCount: 32, tags: ['绘画', '水墨', '国画'] },
  { id: 13, name: '光影行者', avatar: img('avatar13'), level: '认证创作者', bio: '旅行摄影师，用镜头记录中国的山河与人文。', fans: 23400, productCount: 85, tags: ['摄影', '风景', '人文'] },
  { id: 14, name: '泥人张传人', avatar: img('avatar14'), level: '非遗传承人', bio: '天津泥人张第六代传人，让泥土在指尖焕发生命。', fans: 18700, productCount: 72, tags: ['雕塑', '泥塑', '非遗'] },
  { id: 15, name: '皮影传承馆', avatar: img('avatar15'), level: '非遗传承人', bio: '致力于皮影戏的保护与传承，开发非遗体验产品。', fans: 9200, productCount: 30, tags: ['非遗', '皮影', '体验'] },
];

export const mockPosts: Post[] = [
  {
    id: 1, userId: 1, userName: '山月陶舍', userAvatar: img('avatar1'),
    content: '新出窑的一批青花杯，这次尝试了更淡雅的蓝色，在传统纹样的基础上加入了一些现代几何元素。每一只杯子都经历了72道工序，从泥巴到成品，整整花了一个月的时间。分享给大家看看～', images: [img('post1a'), img('post1b'), img('post1c')],
    likes: 328, liked: false, collected: false, comments: [
      { id: 1, userId: 108, userName: '爱喝茶的小明', content: '太好看了！请问可以定制吗？', createdAt: '2026-05-10 14:30' },
      { id: 2, userId: 1, userName: '山月陶舍', content: '可以的，可以私信沟通具体要求～', createdAt: '2026-05-10 15:00' },
    ], createdAt: '2026-05-10T10:00:00', tags: ['陶瓷', '手工', '青花'], type: '原创分享',
  },
  {
    id: 2, userId: 13, userName: '光影行者', userAvatar: img('avatar13'),
    content: '这次去了黔东南的苗寨，清晨的薄雾笼罩着吊脚楼，真的太美了。拍了一组人文纪实，记录下村寨里手艺人的生活。非遗不只是博物馆里的展品，更是这些普通人每天的日常。', images: [img('post5a'), img('post5b'), img('post5c'), img('post5d')],
    likes: 1567, liked: false, collected: false, comments: [
      { id: 3, userId: 118, userName: '人文摄影控', content: '每一张都有故事感，请问是什么器材拍的？', createdAt: '2026-05-12 10:00' },
      { id: 4, userId: 13, userName: '光影行者', content: '用的索尼A7M4 + 24-70mm，主要是等光～', createdAt: '2026-05-12 10:30' },
    ], createdAt: '2026-05-12T08:00:00', tags: ['摄影', '人文', '苗寨', '非遗'], type: '原创分享',
  },
  {
    id: 3, userId: 3, userName: '纸间艺术', userAvatar: img('avatar3'),
    content: '上周在社区文化节做了一场剪纸体验活动，来了好多小朋友和大朋友！大家第一次尝试剪纸，虽然剪得歪歪扭扭，但每个人都特别开心。非遗的传承需要更多这样的机会，让更多人亲手感受传统文化的魅力。', images: [img('post2a'), img('post2b')],
    likes: 567, liked: false, collected: false, comments: [], createdAt: '2026-05-08T16:00:00', tags: ['剪纸', '非遗', '活动'], type: '创作日常',
  },
  {
    id: 4, userId: 5, userName: '瑾色手作', userAvatar: img('avatar5'),
    content: '新作分享——"月白"系列首饰。灵感来自月光下的湖面，选用了月光石和淡水珍珠为主要材料，整体色调清冷温柔。这个系列筹备了两个月，终于可以跟大家见面了！', images: [img('post3a'), img('post3b'), img('post3c'), img('post3d')],
    likes: 892, liked: false, collected: false, comments: [
      { id: 5, userId: 109, userName: '饰物语', content: '已下单月白耳钉，期待收货！', createdAt: '2026-05-05 09:15' },
    ], createdAt: '2026-05-05T08:00:00', tags: ['首饰', '设计', '新品'], type: '原创分享',
  },
  {
    id: 5, userId: 6, userName: '木说工作室', userAvatar: img('avatar6'),
    content: '推荐一套我最近超爱的木雕工具！日本进口的雕刻刀五件套，钢材硬度刚好，握感舒适，细节处理非常到位。对于刚入门的木作爱好者来说，找一套趁手的工具真的太重要了。', images: [img('post4a')],
    likes: 234, liked: false, collected: false, comments: [], createdAt: '2026-05-01T12:00:00', tags: ['木作', '工具', '教程'], type: '好物推荐',
  },
  {
    id: 6, userId: 8, userName: '吴门绣庄', userAvatar: img('avatar8'),
    content: '分享一幅刚完工的双面绣《荷塘月色》。正反两面都是完整的画面，看不到一丝线头。这幅绣了整整三个月，用了48种颜色的丝线。苏绣的魅力就在于针法的无穷变化，一针一线皆心血。', images: [img('post6a'), img('post6b'), img('post6c')],
    likes: 2341, liked: false, collected: false, comments: [
      { id: 6, userId: 119, userName: '丝线情缘', content: '太震撼了！双面绣真的是一绝。', createdAt: '2026-05-14 20:00' },
    ], createdAt: '2026-05-14T18:00:00', tags: ['刺绣', '苏绣', '非遗', '手工艺'], type: '原创分享',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord_001', orderNo: 'TY20260510001', createTime: '2026-05-10 14:30', status: '已完成',
    items: [{ productId: 1, productName: '青花手绘茶杯', price: 168, quantity: 2, image: img('ceramic1') }],
    totalAmount: 336, buyerName: '张先生', buyerPhone: '138****5678', shippingAddress: '北京市朝阳区某某路100号',
  },
  {
    id: 'ord_002', orderNo: 'TY20260515002', createTime: '2026-05-15 09:15', status: '待发货',
    items: [{ productId: 7, productName: '天然石手工项链', price: 199, quantity: 1, image: img('jewelry1') }],
    totalAmount: 199, buyerName: '李女士', buyerPhone: '139****1234', shippingAddress: '上海市浦东新区某某街200号',
  },
  {
    id: 'ord_003', orderNo: 'TY20260516003', createTime: '2026-05-16 11:00', status: '待发货',
    items: [{ productId: 13, productName: '古镇晨雾·艺术微喷', price: 199, quantity: 1, image: img('photo1') }],
    totalAmount: 199, buyerName: '王先生', buyerPhone: '136****8765', shippingAddress: '成都市高新区某某大道300号',
  },
];

export const mockCurrentUser: User = {
  id: 0,
  name: '',
  avatar: '',
  phone: '',
  email: '',
  isCreator: false,
};
