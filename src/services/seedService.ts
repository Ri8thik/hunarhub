// ============================================================
// 🌱 SEED SERVICE — Populate Firestore with initial data
// ============================================================

import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';
import { artists as mockArtists, categories as mockCategories, reviews as mockReviews } from '@/data/mockData';

/** Check if database already has data */
export async function isSeedingComplete(): Promise<boolean> {
  if (!isFirebaseConfigured()) return true;
  try {
    const catSnapshot = await getDocs(collection(db, 'categories'));
    const artistSnapshot = await getDocs(collection(db, 'artists'));
    return catSnapshot.docs.length > 0 && artistSnapshot.docs.length > 0;
  } catch {
    return false;
  }
}

/** Seed the database with sample data */
export async function seedDatabase(
  onProgress?: (step: string) => void,
  currentUserId?: string
): Promise<{ success: boolean; errors: string[] }> {
  if (!isFirebaseConfigured()) {
    console.log('[Seed] Firebase not configured, skipping seed');
    return { success: false, errors: ['Firebase not configured'] };
  }

  const errors: string[] = [];
  console.log('[Seed] Starting database seed...');

  // ---- Seed Categories ----
  try {
    onProgress?.('Seeding categories...');
    for (const cat of mockCategories) {
      await setDoc(doc(db, 'categories', cat.id), {
        name: cat.name,
        icon: cat.icon,
        count: cat.count,
        color: cat.color,
      });
    }
    console.log('[Seed] ✅ Categories seeded:', mockCategories.length);
  } catch (error) {
    const msg = `Categories failed: ${error}`;
    console.error('[Seed]', msg);
    errors.push(msg);
  }

  // ---- Seed Artists ----
  try {
    onProgress?.('Seeding artists...');
    for (const artist of mockArtists) {
      await setDoc(doc(db, 'artists', artist.id), {
        name: artist.name,
        email: artist.email,
        phone: artist.phone,
        role: 'artist',
        avatar: '',
        location: artist.location,
        joinedDate: artist.joinedDate,
        skills: artist.skills,
        bio: artist.bio,
        portfolio: artist.portfolio,
        priceRange: artist.priceRange,
        availability: artist.availability,
        rating: artist.rating,
        reviewCount: artist.reviewCount,
        completedOrders: artist.completedOrders,
        responseTime: artist.responseTime,
        featured: artist.featured,
        verified: artist.verified,
        earnings: artist.earnings,
      });
    }
    console.log('[Seed] ✅ Artists seeded:', mockArtists.length);
  } catch (error) {
    const msg = `Artists failed: ${error}`;
    console.error('[Seed]', msg);
    errors.push(msg);
  }

  // ---- Seed Reviews ----
  try {
    onProgress?.('Seeding reviews...');
    for (const review of mockReviews) {
      await setDoc(doc(db, 'reviews', review.id), {
        orderId: review.orderId,
        customerId: review.customerId,
        customerName: review.customerName,
        customerAvatar: review.customerAvatar,
        artistId: review.artistId,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
      });
    }
    console.log('[Seed] ✅ Reviews seeded:', mockReviews.length);
  } catch (error) {
    const msg = `Reviews failed: ${error}`;
    console.error('[Seed]', msg);
    errors.push(msg);
  }

  // ---- Seed Earnings for each artist ----
  try {
    onProgress?.('Seeding earnings...');
    for (const artist of mockArtists) {
      const totalEarnings = artist.earnings || 0;
      await setDoc(doc(db, 'earnings', artist.id), {
        artistId: artist.id,
        artistName: artist.name,
        totalEarnings: totalEarnings,
        thisMonth: Math.round(totalEarnings * 0.3),
        pendingPayout: Math.round(totalEarnings * 0.1),
        completedOrders: artist.completedOrders || 0,
        platformFee: Math.round(totalEarnings * 0.05),
      });
    }
    console.log('[Seed] ✅ Earnings seeded:', mockArtists.length);
  } catch (error) {
    const msg = `Earnings failed: ${error}`;
    console.error('[Seed]', msg);
    errors.push(msg);
  }

  // ---- Seed Transactions for each artist ----
  try {
    onProgress?.('Seeding transactions...');
    const txnTemplates = [
      { title: 'Family Portrait Commission', type: 'credit' as const, status: 'completed' as const, description: 'Payment received for portrait' },
      { title: 'Pet Sketch Order', type: 'credit' as const, status: 'completed' as const, description: 'Payment received for sketch' },
      { title: 'Platform Fee (5%)', type: 'debit' as const, status: 'completed' as const, description: 'HunarHub platform commission' },
      { title: 'Bank Withdrawal', type: 'debit' as const, status: 'completed' as const, description: 'Transferred to bank account' },
      { title: 'Abstract Art Commission', type: 'credit' as const, status: 'pending' as const, description: 'Payment held in escrow' },
      { title: 'Wedding Card Design', type: 'credit' as const, status: 'completed' as const, description: 'Payment received for design' },
    ];

    let txnCount = 0;
    for (const artist of mockArtists) {
      const baseAmount = (artist.earnings || 10000) / 6;
      for (let i = 0; i < txnTemplates.length; i++) {
        const tmpl = txnTemplates[i];
        const amount = tmpl.type === 'debit'
          ? -Math.round(baseAmount * (tmpl.title.includes('Platform') ? 0.05 : 2))
          : Math.round(baseAmount * (1 + Math.random()));

        const daysAgo = i * 5 + Math.floor(Math.random() * 3);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        await setDoc(doc(db, 'transactions', `${artist.id}_txn${i + 1}`), {
          artistId: artist.id,
          title: tmpl.title,
          amount: amount,
          type: tmpl.type,
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: tmpl.status,
          description: tmpl.description,
        });
        txnCount++;
      }
    }
    console.log('[Seed] ✅ Transactions seeded:', txnCount);
  } catch (error) {
    const msg = `Transactions failed: ${error}`;
    console.error('[Seed]', msg);
    errors.push(msg);
  }

  // ---- Seed Earnings for currently logged-in user ----
  if (currentUserId) {
    try {
      onProgress?.('Seeding your earnings...');
      await setDoc(doc(db, 'earnings', currentUserId), {
        artistId: currentUserId,
        artistName: 'You',
        totalEarnings: 45000,
        thisMonth: 12500,
        pendingPayout: 5000,
        completedOrders: 15,
        platformFee: 2250,
      });

      const myTransactions = [
        { title: 'Portrait Commission', amount: 8000, type: 'credit' as const, status: 'completed' as const, date: 'Dec 10, 2024', description: 'Payment for custom portrait' },
        { title: 'Landscape Painting', amount: 12000, type: 'credit' as const, status: 'completed' as const, date: 'Dec 5, 2024', description: 'Payment for landscape art' },
        { title: 'Platform Fee (5%)', amount: -1000, type: 'debit' as const, status: 'completed' as const, date: 'Dec 5, 2024', description: 'HunarHub commission' },
        { title: 'Bank Withdrawal', amount: -15000, type: 'debit' as const, status: 'completed' as const, date: 'Dec 1, 2024', description: 'Transferred to bank' },
        { title: 'Wedding Card Design', amount: 5000, type: 'credit' as const, status: 'pending' as const, date: 'Nov 28, 2024', description: 'Payment held in escrow' },
        { title: 'Logo Design', amount: 3500, type: 'credit' as const, status: 'completed' as const, date: 'Nov 20, 2024', description: 'Payment for logo design' },
        { title: 'Platform Fee (5%)', amount: -425, type: 'debit' as const, status: 'completed' as const, date: 'Nov 20, 2024', description: 'HunarHub commission' },
        { title: 'Sketch Commission', amount: 2000, type: 'credit' as const, status: 'completed' as const, date: 'Nov 15, 2024', description: 'Payment for pencil sketch' },
      ];

      for (let i = 0; i < myTransactions.length; i++) {
        const txn = myTransactions[i];
        await setDoc(doc(db, 'transactions', `${currentUserId}_txn${i + 1}`), {
          artistId: currentUserId,
          title: txn.title,
          amount: txn.amount,
          type: txn.type,
          date: txn.date,
          status: txn.status,
          description: txn.description,
        });
      }
      console.log('[Seed] ✅ Your earnings & transactions seeded');
    } catch (error) {
      const msg = `Your earnings failed: ${error}`;
      console.error('[Seed]', msg);
      errors.push(msg);
    }
  }

  const success = errors.length === 0;
  console.log(success ? '[Seed] ✅ Database seeding complete!' : '[Seed] ⚠️ Seeding completed with errors');
  onProgress?.(success ? 'Done! All data seeded ✅' : 'Completed with some errors');

  return { success, errors };
}
