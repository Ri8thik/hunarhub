# Migration Guide: Firebase to PostgreSQL API

## Overview
We have migrated the frontend from Firebase (Cloud Firestore & Firebase Auth) to use the backend REST API connected to PostgreSQL database.

## Configuration

### Environment Variables
Before running the project, ensure you have `.env.local` file with:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

For production deployment:
```env
VITE_API_BASE_URL=https://your-production-domain.com/api
```

## Service Files

### 1. Authentication Service (`apiAuthService.ts`)
Replaces Firebase Authentication

**Usage:**
```typescript
import { loginWithEmail, registerWithEmail, logout } from '@/services/apiAuthService';

// Login
const result = await loginWithEmail('user@example.com', 'password');
if (result.success) {
  // User is logged in, session stored in localStorage
} else {
  console.error(result.error);
}

// Register
const registerResult = await registerWithEmail('user@example.com', 'password', 'John Doe', 'customer');

// Logout
await logout();
```

### 2. Data Service (`apiDataService.ts`)
Replaces Firebase Firestore for data operations

**Usage:**
```typescript
import {
  getArtists,
  getArtistById,
  createOrder,
  getOrders,
  getArtistReviews,
  // ... other functions
} from '@/services/apiDataService';

// Fetch all artists
const artists = await getArtists();

// Get specific artist
const artist = await getArtistById('artist-id');

// Create order
const orderId = await createOrder({
  customerId: 'customer-id',
  customerName: 'John',
  artistId: 'artist-id',
  artistName: 'Jane',
  title: 'Custom Painting',
  description: 'A beautiful painting',
  referenceImages: ['url1', 'url2'],
  budget: 5000,
  deadline: '2026-06-20',
  category: 'Painting',
});
```

### 3. Session Management (`sessionManager.ts`)
Manages JWT tokens and user session

**Key Functions:**
- `saveTokens(accessToken, refreshToken, expiresIn)` - Save auth tokens
- `getUserToken()` - Get current access token
- `getAuthHeader()` - Get Authorization header for API calls
- `clearSession()` - Clear all session data

## Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/profile` - Update user profile

### Artists
- `GET /api/artists` - List all artists
- `GET /api/artists/{id}` - Get artist by ID
- `GET /api/artists/featured` - Get featured artists
- `GET /api/artists/search?q=...&category=...` - Search artists
- `POST /api/artists/profile` - Create artist profile
- `PUT /api/artists/profile` - Update artist profile
- `GET /api/artists/{id}/portfolio` - Get artist portfolio

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/customer` - Get customer's orders
- `GET /api/orders/artist` - Get artist's orders
- `PUT /api/orders/{id}/status` - Update order status

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/artist/{artistId}` - Get artist reviews
- `GET /api/reviews/order/{orderId}` - Get order review

### Earnings & Payouts
- `GET /api/earnings/summary` - Get earnings summary
- `GET /api/earnings/ledger` - Get earnings ledger
- `GET /api/payouts` - Get payout history

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark notification as read

## Database Connection

The frontend connects to the backend which uses PostgreSQL:
- **Host**: localhost
- **Port**: 5432
- **Database**: artconnectdb
- **User**: postgres (configurable)

The backend handles all database operations. Frontend only communicates via REST API.

## Running the Project

### Start Backend
```bash
cd /path/to/art-connect
mvn spring-boot:run
# Backend will be available at http://localhost:8080
# API endpoints at http://localhost:8080/api
```

### Start Frontend
```bash
cd /path/to/hunarhub
npm install
npm run dev
# Frontend will be available at http://localhost:5173
```

## Error Handling

All API errors are caught and returned as:
```typescript
interface Result {
  success: boolean;
  error?: string;
  data?: any;
}
```

Session expiration (401 errors) automatically clears local session and triggers `session-expired` event.

## Token Management

- **Access Token**: Short-lived (24 hours), used for API calls
- **Refresh Token**: Long-lived, used to get new access tokens
- Both stored in localStorage under `accessToken` and `refreshToken`
- Automatically sent in Authorization header: `Bearer {token}`

## Legacy Client Cleanup

Migration complete items:
- `/src/services/firestoreService.ts` now acts as an API adapter
- `/src/services/authService.ts` now acts as a legacy compatibility shim
- Runtime uses backend API endpoints through `apiDataService.ts` and `apiAuthService.ts`

## Troubleshooting

### 401 Unauthorized Error
- Clear localStorage and login again
- Check if token is being sent correctly in Authorization header
- Verify backend is running on `http://localhost:8080`

### Connection Refused
- Ensure backend is running: `mvn spring-boot:run`
- Check backend port matches `VITE_API_BASE_URL` configuration
- Verify PostgreSQL database is accessible

### CORS Errors
- Backend is configured to allow requests from `http://localhost:3000` and `http://localhost:5173`
- Check `application.properties` for `cors.allowed-origins` configuration

## Next Steps

1. Update React components to use new services
2. Remove any legacy adapter calls no longer needed by your UI
3. Update AppContext if needed for new auth flow
4. Test all features after migration
5. Deploy to production with correct API URL

