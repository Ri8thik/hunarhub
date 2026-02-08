import { Artist, Category, Order, Review, ChatThread, Message } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Sketch', icon: '✏️', count: 124, color: 'bg-amber-100 text-amber-800' },
  { id: '2', name: 'Portrait', icon: '🎨', count: 89, color: 'bg-rose-100 text-rose-800' },
  { id: '3', name: 'Painting', icon: '🖼️', count: 156, color: 'bg-blue-100 text-blue-800' },
  { id: '4', name: 'Home Decor', icon: '🏠', count: 203, color: 'bg-emerald-100 text-emerald-800' },
  { id: '5', name: 'Craft', icon: '🧶', count: 97, color: 'bg-purple-100 text-purple-800' },
  { id: '6', name: 'Calligraphy', icon: '🖋️', count: 64, color: 'bg-orange-100 text-orange-800' },
  { id: '7', name: 'Digital Art', icon: '💻', count: 178, color: 'bg-cyan-100 text-cyan-800' },
  { id: '8', name: 'Sculpture', icon: '🗿', count: 45, color: 'bg-stone-100 text-stone-800' },
];

export const artists: Artist[] = [
  {
    id: 'a1',
    name: 'Priya Sharma',
    email: 'priya@email.com',
    phone: '+91 98765 43210',
    role: 'artist',
    avatar: '',
    location: 'Jaipur, Rajasthan',
    joinedDate: '2023-03-15',
    skills: ['Sketch', 'Portrait', 'Painting'],
    bio: 'Passionate artist with 8+ years of experience in traditional and contemporary art. Specializing in realistic portraits and cultural sketches that capture the essence of Indian heritage.',
    portfolio: [
      { id: 'p1', title: 'Royal Portrait', image: '', category: 'Portrait' },
      { id: 'p2', title: 'Peacock Sketch', image: '', category: 'Sketch' },
      { id: 'p3', title: 'Rajasthani Art', image: '', category: 'Painting' },
      { id: 'p4', title: 'Modern Abstract', image: '', category: 'Painting' },
      { id: 'p5', title: 'Pencil Portrait', image: '', category: 'Sketch' },
      { id: 'p6', title: 'Watercolor Landscape', image: '', category: 'Painting' },
    ],
    priceRange: { min: 500, max: 15000 },
    availability: 'available',
    rating: 4.8,
    reviewCount: 127,
    completedOrders: 156,
    responseTime: '2 hours',
    featured: true,
    verified: true,
    earnings: 245000,
  },
  {
    id: 'a2',
    name: 'Rahul Verma',
    email: 'rahul@email.com',
    phone: '+91 87654 32109',
    role: 'artist',
    avatar: '',
    location: 'Mumbai, Maharashtra',
    joinedDate: '2023-06-20',
    skills: ['Digital Art', 'Calligraphy', 'Portrait'],
    bio: 'Digital artist and calligrapher creating modern interpretations of traditional art. I blend technology with tradition to create unique masterpieces.',
    portfolio: [
      { id: 'p7', title: 'Digital Portrait', image: '', category: 'Digital Art' },
      { id: 'p8', title: 'Hindi Calligraphy', image: '', category: 'Calligraphy' },
      { id: 'p9', title: 'Abstract Digital', image: '', category: 'Digital Art' },
      { id: 'p10', title: 'Wedding Invite', image: '', category: 'Calligraphy' },
    ],
    priceRange: { min: 800, max: 25000 },
    availability: 'available',
    rating: 4.9,
    reviewCount: 89,
    completedOrders: 102,
    responseTime: '1 hour',
    featured: true,
    verified: true,
    earnings: 312000,
  },
  {
    id: 'a3',
    name: 'Anita Devi',
    email: 'anita@email.com',
    phone: '+91 76543 21098',
    role: 'artist',
    avatar: '',
    location: 'Varanasi, Uttar Pradesh',
    joinedDate: '2023-01-10',
    skills: ['Home Decor', 'Craft', 'Painting'],
    bio: 'Traditional craftsperson specializing in handmade home decor items. Each piece is carefully crafted using age-old techniques passed down through generations.',
    portfolio: [
      { id: 'p11', title: 'Handmade Lamp', image: '', category: 'Home Decor' },
      { id: 'p12', title: 'Clay Pottery', image: '', category: 'Craft' },
      { id: 'p13', title: 'Wall Hanging', image: '', category: 'Home Decor' },
    ],
    priceRange: { min: 300, max: 8000 },
    availability: 'busy',
    rating: 4.6,
    reviewCount: 54,
    completedOrders: 78,
    responseTime: '4 hours',
    featured: false,
    verified: true,
    earnings: 156000,
  },
  {
    id: 'a4',
    name: 'Karthik Nair',
    email: 'karthik@email.com',
    phone: '+91 65432 10987',
    role: 'artist',
    avatar: '',
    location: 'Kochi, Kerala',
    joinedDate: '2023-09-05',
    skills: ['Sculpture', 'Craft', 'Home Decor'],
    bio: 'Sculptor and craft artist creating bespoke pieces inspired by South Indian temple architecture and nature. Every creation tells a story.',
    portfolio: [
      { id: 'p14', title: 'Bronze Sculpture', image: '', category: 'Sculpture' },
      { id: 'p15', title: 'Wood Carving', image: '', category: 'Craft' },
      { id: 'p16', title: 'Temple Art', image: '', category: 'Sculpture' },
      { id: 'p17', title: 'Decorative Piece', image: '', category: 'Home Decor' },
      { id: 'p18', title: 'Brass Idol', image: '', category: 'Sculpture' },
    ],
    priceRange: { min: 1500, max: 50000 },
    availability: 'available',
    rating: 4.7,
    reviewCount: 42,
    completedOrders: 56,
    responseTime: '3 hours',
    featured: true,
    verified: false,
    earnings: 198000,
  },
  {
    id: 'a5',
    name: 'Meera Patel',
    email: 'meera@email.com',
    phone: '+91 54321 09876',
    role: 'artist',
    avatar: '',
    location: 'Ahmedabad, Gujarat',
    joinedDate: '2024-01-15',
    skills: ['Painting', 'Sketch', 'Digital Art'],
    bio: 'Contemporary artist blending traditional Gujarati motifs with modern aesthetics. My work celebrates the vibrant colors and culture of India.',
    portfolio: [
      { id: 'p19', title: 'Mandala Art', image: '', category: 'Painting' },
      { id: 'p20', title: 'Warli Painting', image: '', category: 'Painting' },
      { id: 'p21', title: 'Pet Portrait', image: '', category: 'Sketch' },
    ],
    priceRange: { min: 600, max: 12000 },
    availability: 'available',
    rating: 4.5,
    reviewCount: 31,
    completedOrders: 38,
    responseTime: '2 hours',
    featured: false,
    verified: true,
    earnings: 89000,
  },
  {
    id: 'a6',
    name: 'Arjun Singh',
    email: 'arjun@email.com',
    phone: '+91 43210 98765',
    role: 'artist',
    avatar: '',
    location: 'Delhi, NCR',
    joinedDate: '2023-07-22',
    skills: ['Calligraphy', 'Sketch', 'Portrait'],
    bio: 'Master calligrapher specializing in Urdu, Hindi, and English scripts. Creating personalized art pieces, wedding cards, and corporate branding.',
    portfolio: [
      { id: 'p22', title: 'Urdu Calligraphy', image: '', category: 'Calligraphy' },
      { id: 'p23', title: 'Wedding Card', image: '', category: 'Calligraphy' },
      { id: 'p24', title: 'Name Art', image: '', category: 'Sketch' },
      { id: 'p25', title: 'Corporate Logo', image: '', category: 'Calligraphy' },
    ],
    priceRange: { min: 400, max: 10000 },
    availability: 'available',
    rating: 4.4,
    reviewCount: 67,
    completedOrders: 89,
    responseTime: '1 hour',
    featured: false,
    verified: true,
    earnings: 178000,
  },
];

export const reviews: Review[] = [
  {
    id: 'r1', orderId: 'o1', customerId: 'c1', customerName: 'Amit Kumar',
    customerAvatar: '', artistId: 'a1', rating: 5,
    comment: 'Priya did an amazing job with my family portrait! The attention to detail is incredible. Highly recommended!',
    date: '2024-11-15',
  },
  {
    id: 'r2', orderId: 'o2', customerId: 'c2', customerName: 'Sneha Gupta',
    customerAvatar: '', artistId: 'a1', rating: 5,
    comment: 'Beautiful sketch of my pet dog. She captured his personality perfectly. Will definitely order again!',
    date: '2024-11-10',
  },
  {
    id: 'r3', orderId: 'o3', customerId: 'c3', customerName: 'Ravi Teja',
    customerAvatar: '', artistId: 'a1', rating: 4,
    comment: 'Great painting for my living room. Delivered on time and well-packaged. Minor color difference from reference but overall very good.',
    date: '2024-10-28',
  },
  {
    id: 'r4', orderId: 'o4', customerId: 'c4', customerName: 'Deepa Menon',
    customerAvatar: '', artistId: 'a2', rating: 5,
    comment: 'The calligraphy work for my wedding invitations was absolutely stunning. Rahul is incredibly talented!',
    date: '2024-11-12',
  },
  {
    id: 'r5', orderId: 'o5', customerId: 'c5', customerName: 'Vikram Joshi',
    customerAvatar: '', artistId: 'a2', rating: 5,
    comment: 'Excellent digital portrait. The colors and composition were beyond my expectations.',
    date: '2024-11-05',
  },
  {
    id: 'r6', orderId: 'o6', customerId: 'c1', customerName: 'Amit Kumar',
    customerAvatar: '', artistId: 'a4', rating: 5,
    comment: 'The bronze sculpture is a masterpiece. Karthik is truly gifted. Worth every rupee!',
    date: '2024-10-20',
  },
];

export const orders: Order[] = [
  {
    id: 'o1', customerId: 'c1', customerName: 'Amit Kumar', artistId: 'a1', artistName: 'Priya Sharma',
    title: 'Family Portrait Painting', description: 'I want a detailed oil painting portrait of my family of 4. Size: 24x36 inches. Realistic style with warm color palette.',
    referenceImages: [], budget: 8000, deadline: '2024-12-15', status: 'in_progress',
    createdAt: '2024-11-01', updatedAt: '2024-11-05', category: 'Portrait',
  },
  {
    id: 'o2', customerId: 'c2', customerName: 'Sneha Gupta', artistId: 'a1', artistName: 'Priya Sharma',
    title: 'Pet Dog Sketch', description: 'Pencil sketch of my Golden Retriever. A4 size, detailed and realistic.',
    referenceImages: [], budget: 1500, deadline: '2024-12-01', status: 'completed',
    createdAt: '2024-10-20', updatedAt: '2024-11-10', category: 'Sketch',
  },
  {
    id: 'o3', customerId: 'c3', customerName: 'Ravi Teja', artistId: 'a2', artistName: 'Rahul Verma',
    title: 'Wedding Invitation Calligraphy', description: 'Elegant calligraphy for 200 wedding invitations in Hindi and English.',
    referenceImages: [], budget: 12000, deadline: '2024-12-20', status: 'accepted',
    createdAt: '2024-11-08', updatedAt: '2024-11-10', category: 'Calligraphy',
  },
  {
    id: 'o4', customerId: 'c4', customerName: 'Deepa Menon', artistId: 'a3', artistName: 'Anita Devi',
    title: 'Handmade Wall Decoration', description: 'Traditional Rajasthani style wall hanging for my living room. Size around 3x4 feet.',
    referenceImages: [], budget: 5000, deadline: '2024-12-10', status: 'requested',
    createdAt: '2024-11-12', updatedAt: '2024-11-12', category: 'Home Decor',
  },
  {
    id: 'o5', customerId: 'c5', customerName: 'Vikram Joshi', artistId: 'a4', artistName: 'Karthik Nair',
    title: 'Custom Brass Idol', description: 'Small brass idol of Lord Ganesha, about 6 inches tall, traditional Kerala style.',
    referenceImages: [], budget: 15000, deadline: '2025-01-15', status: 'in_progress',
    createdAt: '2024-10-25', updatedAt: '2024-11-01', category: 'Sculpture',
  },
  {
    id: 'o6', customerId: 'c1', customerName: 'Amit Kumar', artistId: 'a5', artistName: 'Meera Patel',
    title: 'Mandala Art for Office', description: 'Large mandala painting with vibrant colors for my office reception. Canvas size: 36x36 inches.',
    referenceImages: [], budget: 7000, deadline: '2024-12-25', status: 'delivered',
    createdAt: '2024-10-15', updatedAt: '2024-11-18', category: 'Painting',
  },
];

export const chatThreads: ChatThread[] = [
  {
    id: 'ct1', participantId: 'a1', participantName: 'Priya Sharma', participantAvatar: '',
    lastMessage: 'I have started working on your portrait. Will share progress soon!',
    lastMessageTime: '2 min ago', unreadCount: 2, orderId: 'o1',
  },
  {
    id: 'ct2', participantId: 'a2', participantName: 'Rahul Verma', participantAvatar: '',
    lastMessage: 'Thank you for the reference images. I will prepare a draft.',
    lastMessageTime: '1 hour ago', unreadCount: 0, orderId: 'o3',
  },
  {
    id: 'ct3', participantId: 'a5', participantName: 'Meera Patel', participantAvatar: '',
    lastMessage: 'Your mandala painting is ready! Please check the photos.',
    lastMessageTime: '3 hours ago', unreadCount: 1, orderId: 'o6',
  },
  {
    id: 'ct4', participantId: 'a4', participantName: 'Karthik Nair', participantAvatar: '',
    lastMessage: 'The brass casting is in process. Expected to finish by next week.',
    lastMessageTime: 'Yesterday', unreadCount: 0, orderId: 'o5',
  },
];

export const chatMessages: Record<string, Message[]> = {
  'ct1': [
    { id: 'm1', senderId: 'c1', receiverId: 'a1', content: 'Hi Priya! I wanted to commission a family portrait.', timestamp: '10:00 AM', type: 'text', read: true },
    { id: 'm2', senderId: 'a1', receiverId: 'c1', content: 'Hello! I would love to work on that. Can you share some reference photos?', timestamp: '10:05 AM', type: 'text', read: true },
    { id: 'm3', senderId: 'c1', receiverId: 'a1', content: 'Sure! Here are some family photos. We want a warm, realistic style.', timestamp: '10:10 AM', type: 'text', read: true },
    { id: 'm4', senderId: 'a1', receiverId: 'c1', content: 'Beautiful family! I can definitely create something special. For a 24x36 inch oil painting, it will take about 2 weeks.', timestamp: '10:15 AM', type: 'text', read: true },
    { id: 'm5', senderId: 'c1', receiverId: 'a1', content: 'That sounds perfect. Please go ahead!', timestamp: '10:20 AM', type: 'text', read: true },
    { id: 'm6', senderId: 'a1', receiverId: 'c1', content: 'I have started working on your portrait. Will share progress soon!', timestamp: '2:30 PM', type: 'text', read: false },
  ],
  'ct3': [
    { id: 'm7', senderId: 'c1', receiverId: 'a5', content: 'Hi Meera, how is the mandala coming along?', timestamp: '9:00 AM', type: 'text', read: true },
    { id: 'm8', senderId: 'a5', receiverId: 'c1', content: 'Almost done! Just adding the final details.', timestamp: '9:30 AM', type: 'text', read: true },
    { id: 'm9', senderId: 'a5', receiverId: 'c1', content: 'Your mandala painting is ready! Please check the photos.', timestamp: '11:00 AM', type: 'text', read: false },
  ],
};

// Color generation for avatars
const avatarColors = [
  'bg-amber-600', 'bg-rose-600', 'bg-emerald-600', 'bg-blue-600',
  'bg-purple-600', 'bg-orange-600', 'bg-teal-600', 'bg-indigo-600',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Portfolio placeholder colors
const portfolioColors = [
  'from-amber-300 to-orange-400',
  'from-rose-300 to-pink-400',
  'from-emerald-300 to-teal-400',
  'from-blue-300 to-indigo-400',
  'from-purple-300 to-violet-400',
  'from-yellow-300 to-amber-400',
  'from-cyan-300 to-blue-400',
  'from-stone-300 to-gray-400',
];

export function getPortfolioColor(index: number): string {
  return portfolioColors[index % portfolioColors.length];
}
