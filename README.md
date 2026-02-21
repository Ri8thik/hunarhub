# 🎨 HunarHub

**HunarHub** is a full-stack marketplace platform connecting skilled local artists and craftspeople with customers who need custom creative work — from paintings and crafts to music and more. Built as a Progressive Web App (PWA), it delivers a native app-like experience directly in the browser.

> *"Hunar"* means **skill/talent** in Urdu/Hindi — a fitting name for a platform celebrating local artistry.

---

## 🚀 Live Demo

🔗 [https://Ri8thik.github.io/hunarhub](https://Ri8thik.github.io/hunarhub)

---

## ✨ Features

### 👤 For Customers
- **Browse & Explore** — Discover artists by category (Painting, Music, Craft, Photography, etc.)
- **Artist Profiles** — View portfolios, ratings, pricing, and availability
- **Custom Requests** — Place personalized orders directly with artists
- **Order Management** — Track order status in real-time
- **In-App Chat** — Message artists directly about your project
- **Notifications** — Stay updated on order progress and messages
- **Reviews & Ratings** — Rate artists after order completion

### 🎨 For Artists
- **Artist Setup** — Become an artist with a guided onboarding flow
- **Profile Management** — Showcase portfolio, set categories, pricing & availability
- **Order Dashboard** — Manage incoming requests and update order statuses
- **Earnings Tracker** — Monitor revenue with visual breakdowns
- **Chat with Clients** — Communicate directly with customers

### 🛡️ Admin
- **Admin Dashboard** — Manage users, artists, orders, and platform data
- **Secure Admin Login** — Separate authentication for admin access

### 📱 PWA Support
- Installable on Android & iOS — works like a native app
- Offline-ready with service worker
- Home screen icon, splash screen, full-screen mode

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Backend / Database | Firebase (Firestore) |
| Authentication | Firebase Auth |
| Image Storage | Firebase Storage |
| Icons | Lucide React |
| PWA | Custom Service Worker + Web Manifest |
| Deployment | GitHub Pages |

---

## 📁 Project Structure

```
hunarhub/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx          # Landing feed with featured artists
│   │   ├── ExplorePage.tsx       # Browse & filter artists
│   │   ├── ArtistProfilePage.tsx # Public artist profile
│   │   ├── MyArtistProfilePage.tsx # Artist's own profile management
│   │   ├── ArtistSetupPage.tsx   # Onboarding flow for new artists
│   │   ├── RequestPage.tsx       # Place a custom order
│   │   ├── OrdersPage.tsx        # Order list
│   │   ├── OrderDetailPage.tsx   # Order details & status tracking
│   │   ├── ChatPage.tsx          # Chat list & conversation view
│   │   ├── ProfilePage.tsx       # User profile & settings
│   │   ├── EarningsPage.tsx      # Artist earnings dashboard
│   │   ├── NotificationsPage.tsx # Activity notifications
│   │   ├── LoginPage.tsx         # Auth (login / signup)
│   │   ├── AdminLoginPage.tsx    # Admin authentication
│   │   ├── AdminDashboardPage.tsx# Admin control panel
│   │   └── SetupGuidePage.tsx    # App setup guide
│   ├── components/
│   │   ├── Sidebar.tsx           # Desktop sidebar navigation
│   │   ├── TopNav.tsx            # Top navigation bar
│   │   ├── BottomNav.tsx         # Mobile bottom navigation
│   │   ├── MobileNav.tsx         # Mobile nav wrapper
│   │   ├── Avatar.tsx            # User avatar component
│   │   ├── StarRating.tsx        # Star rating UI
│   │   ├── StatusBadge.tsx       # Order status badge
│   │   ├── ImageUploader.tsx     # Image upload with Firebase Storage
│   │   └── SplashScreen.tsx      # App loading splash screen
│   ├── context/
│   │   └── AppContext.tsx        # Global state management
│   ├── services/
│   │   ├── authService.ts        # Firebase Auth helpers
│   │   ├── firestoreService.ts   # Firestore CRUD operations
│   │   ├── imageService.ts       # Image upload service
│   │   ├── locationService.ts    # Location utilities
│   │   ├── sessionManager.ts     # Session persistence
│   │   └── seedService.ts        # Database seeding for dev
│   ├── config/
│   │   └── firebase.ts           # Firebase configuration
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── utils/
│       ├── cn.ts                 # Class name utility
│       └── helpers.ts            # General helpers
├── public/
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service Worker
├── index.html
├── vite_config.ts
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Firebase project

### 1. Clone the Repository

```bash
git clone https://github.com/Ri8thik/hunarhub.git
cd hunarhub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com) and enable:
- **Authentication** (Email/Password + Google)
- **Firestore Database**
- **Storage**

Update `src/config/firebase.ts` with your Firebase config:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 📱 Install as Mobile App (PWA)

No app store needed! Follow these steps:

**Android (Chrome):**
1. Open the app URL on your phone
2. Tap ⋮ menu → "Add to Home Screen" → Install

**iPhone (Safari):**
1. Open the app URL in Safari
2. Tap Share □↑ → "Add to Home Screen" → Add

Want a real APK? Use [PWABuilder.com](https://www.pwabuilder.com) — see [STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md) for details.

---

## 🚀 Deployment

### GitHub Pages (Recommended)

```bash
npm run build
# Deploy the dist/ folder to GitHub Pages
```

The `homepage` field in `package.json` is already configured:
```json
"homepage": "https://Ri8thik.github.io/hunarhub"
```

---

## 🔒 Admin Access

Navigate to `/admin` to access the admin login page. Admin credentials are managed separately in Firebase.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [Firebase](https://firebase.google.com) — backend & auth
- [Tailwind CSS](https://tailwindcss.com) — styling
- [Lucide React](https://lucide.dev) — icons
- [Vite](https://vitejs.dev) — build tooling
- [React Router](https://reactrouter.com) — routing

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Ri8thik">Ri8thik</a>
</div>
