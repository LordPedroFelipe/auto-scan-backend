export interface JwtUser {
  userId: string;
  email: string;
  roles: string[];
  shopId: string | null;
  shopName: string | null;
}
