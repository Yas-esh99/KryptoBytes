export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
  college_id: string;
  department?: string;
  public_key: string;
  balance: number;
  staked_balance: number;
  is_validator: boolean;
  nonce: number;
}
