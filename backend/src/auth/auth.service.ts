import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { db } from "../prisma/db.js";

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async login(name: string, password: string) {
    const user: any = await db.orm.public.User.where({ name }).first();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Wrong name or password");
    }
    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { token, user: { id: user.id, name: user.name, role: user.role } };
  }
}
