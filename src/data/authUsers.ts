import { AppUser } from '../types';

export const DEFAULT_CUSTOMER: AppUser = {
  id: 'cust_fahim',
  name: 'Fahim Alom',
  email: 'fahimalom013@gmail.com',
  phone: '+880 1712-998877',
  role: 'customer',
  location: 'Dhanmondi',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  createdAt: '2026-09-01',
  detailedAddress: 'House 42, Road 27, Dhanmondi, Dhaka 1209',
  bio: 'Please call 10 minutes before arrival at gate.',
  emergencyContactName: 'Family Contact',
  emergencyContactPhone: '+880 1711-001122',
  preferredPaymentMethod: 'bkash',
};

export const DEFAULT_PROVIDER: AppUser = {
  id: 'prov_1',
  name: 'Rahim Electronics',
  email: 'rahim.electronics@smartfix.bd',
  phone: '+880 1711-234567',
  role: 'provider',
  location: 'Dhanmondi',
  avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=240&auto=format&fit=crop&q=80',
  businessName: 'Rahim Electronics & AC Care',
  serviceCategory: 'Appliance and Gadget Repair',
  providerId: 'prov_1',
  createdAt: '2026-08-15',
  experienceYears: 8,
  basePrice: 1000,
  tradeLicense: 'TRAD-DNCC-2024-8891',
  specialties: ['AC Repair & Servicing', 'Refrigerator Repair', 'Microwave Oven Repair'],
  bio: 'Certified technician with over 8+ years experience servicing high-end inverter ACs, refrigerators, and circuit boards across Dhaka.',
  isAvailable: true,
};

export const DEFAULT_ADMIN: AppUser = {
  id: 'admin_sys',
  name: 'Tanvir Hossain',
  email: 'admin@servo.bd',
  phone: '+880 1800-999000',
  role: 'admin',
  location: 'Gulshan HQ',
  avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80',
  adminDepartment: 'Operations & Dispatch Commander',
  bio: 'Supervises real-time field technician dispatching, escrow clearance, and high-priority emergency responses throughout the Dhaka Metropolitan area.',
  createdAt: '2026-01-01',
};

export interface StoredAccount {
  user: AppUser;
  passwordHash: string; // Plain/demo string for local prototype
}

export const INITIAL_ACCOUNTS: StoredAccount[] = [
  {
    user: DEFAULT_CUSTOMER,
    passwordHash: 'customer123',
  },
  {
    user: DEFAULT_PROVIDER,
    passwordHash: 'provider123',
  },
  {
    user: DEFAULT_ADMIN,
    passwordHash: 'admin123',
  },
];

const USERS_STORAGE_KEY = 'servo_registered_accounts_v1';
const SESSION_STORAGE_KEY = 'servo_active_session_user_v1';

export function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse accounts from storage', e);
  }
  return INITIAL_ACCOUNTS;
}

export function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to storage', e);
  }
}

export function getActiveSessionUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse active session user', e);
  }
  return DEFAULT_CUSTOMER; // default to Fahim Alom for immediate preview, but user can logout anytime!
}

export const DEMO_CUSTOMER_USER = DEFAULT_CUSTOMER;
export const DEMO_PROVIDER_USER = DEFAULT_PROVIDER;
export const DEMO_ADMIN_USER = DEFAULT_ADMIN;

export function setActiveSessionUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to set active session user', e);
  }
}

export function clearActiveSession(): void {
  setActiveSessionUser(null);
}

export function updateStoredUser(updatedUser: AppUser): void {
  try {
    // 1. Update in stored accounts
    const accounts = getStoredAccounts();
    const updatedAccounts = accounts.map((acc) => {
      if (acc.user.id === updatedUser.id) {
        return {
          ...acc,
          user: updatedUser,
        };
      }
      return acc;
    });
    saveStoredAccounts(updatedAccounts);

    // 2. Update active session user if same id
    const active = getActiveSessionUser();
    if (active && active.id === updatedUser.id) {
      setActiveSessionUser(updatedUser);
    }
  } catch (e) {
    console.error('Failed to update stored user', e);
  }
}
