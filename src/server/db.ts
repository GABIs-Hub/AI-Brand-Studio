import { brands } from '../db/schema';
import { BrandBible } from '../types';

let mockBrandsStore = new Map<string, any>();
let mockUsersStore = new Map<string, any>();

// MOCK: Tagged template for Neon `sql\`...\``
export function getSql(): any {
  return async (strings: any, ...values: any[]) => {
    const query = strings.join('?').toLowerCase();
    
    if (query.includes('insert into users')) {
       const id = values[0];
       const name = values[1];
       const email = values[2];
       const hash = values[3];
       mockUsersStore.set(email, { id, name, email, password_hash: hash, emailVerified: null });
       return [];
    }
    
    if (query.includes('select id from users where lower(email)')) {
       const email = values[0];
       const user = mockUsersStore.get(email);
       return user ? [{ id: user.id }] : [];
    }
    
    if (query.includes('select id, name, email, password_hash')) {
       const email = values[0];
       const user = mockUsersStore.get(email);
       return user ? [user] : [];
    }

    if (query.includes('select email from users where id')) {
       const id = values[0];
       for (const u of mockUsersStore.values()) {
         if (u.id === id) return [{ email: u.email }];
       }
       return [];
    }

    if (query.includes('update users set "emailverified" = now()')) {
       const id = values[0]; // wait, the query in auth.ts uses email or id
       // it's fine, we can just do nothing or try to update
       for (const u of mockUsersStore.values()) {
         if (u.id === id || u.email === id) u.emailVerified = new Date().toISOString();
       }
       return [];
    }

    return [];
  };
}

export function getDb(): any {
  return {};
}

export function isDbConfigured(): boolean {
  return false; // Tells auth not to use NeonAdapter
}

export async function setupDb(): Promise<void> {
  console.log('[DB] Mock DB setup.');
}

export async function getBrandsByUser(userId: string): Promise<BrandBible[]> {
  const result: BrandBible[] = [];
  for (const record of mockBrandsStore.values()) {
    if (record.userId === userId) {
      result.push(record.data);
    }
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function upsertBrand(userId: string, brand: BrandBible): Promise<void> {
  mockBrandsStore.set(brand.id, {
    id: brand.id,
    userId: userId,
    data: brand,
    brandName: brand.brandName || '',
    industry: brand.industry || null,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function deleteBrand(userId: string, brandId: string): Promise<void> {
  const record = mockBrandsStore.get(brandId);
  if (record && record.userId === userId) {
    mockBrandsStore.delete(brandId);
  }
}
