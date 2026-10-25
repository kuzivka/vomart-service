import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { db } from '../prisma/db.js';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}
  private fails = new Map<string, { n: number; t: number }>();

  async login(name: string, password: string) {
    const f = this.fails.get(name);
    if (f && f.n >= 5 && Date.now() - f.t < 15 * 60_000) {
      throw new HttpException('Too many attempts, try later', 429);
    }
    const user: any = await db.orm.public.User.where({ name }).first();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      this.fails.set(name, { n: (f?.n ?? 0) + 1, t: Date.now() });
      throw new UnauthorizedException('Wrong name or password');
    }
    this.fails.delete(name);
    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { token, user: { id: user.id, name: user.name, role: user.role } };
  }
}
