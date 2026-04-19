export type AuthProvider = 'email' | 'google' | 'facebook';

export interface User {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
}

export interface Receipt {
  id: string;
  imageUri: string;
  date: string;
}

export type DateRangePreset = '2w' | '3w' | '1m';

export type ReceiptViewMode = 'list' | 'grid';
