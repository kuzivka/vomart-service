import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { RequestsService } from "./requests.service.js";

const canWrite = (req: any) => {
  if (req.user.role === "GUEST") throw new ForbiddenException("Read only");
};

@UseGuards(AuthGuard)
@Controller("requests")
export class RequestsController {
  constructor(private s: RequestsService) {}

  @Get() list(@Query() q: Record<string, string>) { return this.s.list(q); }
  @Get(":id") get(@Param("id", ParseIntPipe) id: number) { return this.s.get(id); }

  @Post() create(@Req() req: any, @Body() b: any) {
    canWrite(req);
    return this.s.create(b, req.user.sub);
  }
  @Patch(":id") update(@Req() req: any, @Param("id", ParseIntPipe) id: number, @Body() b: any) {
    canWrite(req);
    return this.s.update(id, b);
  }
  @Post(":id/works") addWork(@Req() req: any, @Param("id", ParseIntPipe) id: number, @Body() b: any) {
    canWrite(req);
    return this.s.addWork(id, b);
  }
}
