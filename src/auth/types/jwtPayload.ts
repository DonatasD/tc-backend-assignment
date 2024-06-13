import { UserRole } from '../../users/types/userRole';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  iat: number;
}
