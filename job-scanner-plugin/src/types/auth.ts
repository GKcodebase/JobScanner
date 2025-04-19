export interface AuthResponse {
  token: string;
  user: {
    uid: string;
    email: string | null;
  };
}