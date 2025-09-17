// Common types for HDBank React application

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  accountNumber?: string;
  accountType: 'personal' | 'corporate' | 'investor';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'investment';
  balance: number;
  currency: 'VND' | 'USD' | 'EUR';
  isActive: boolean;
  userId: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  recipientAccount?: string;
  recipientName?: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface BannerSlide {
  id: number;
  image: string;
  href: string;
  buttons: {
    text: string;
    href: string;
  }[];
}

export interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: 'personal' | 'corporate';
  agreeToTerms: boolean;
}

export interface LoanForm {
  amount: number;
  term: number;
  interestRate: number;
}

// Language and localization
export type Locale = 'en' | 'vi';

export interface LocaleConfig {
  locale: Locale;
  label: string;
  flag: string;
}
