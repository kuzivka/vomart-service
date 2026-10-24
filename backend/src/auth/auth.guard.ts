import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const header: string = req.headers.authorization ?? "";
    try {
      req.user = await this.jwt.verifyAsync(header.replace("Bearer ", ""));
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
