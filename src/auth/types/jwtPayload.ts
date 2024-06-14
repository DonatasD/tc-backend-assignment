import { UserRole } from '../../user/types/userRole';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  iat: number;
}
