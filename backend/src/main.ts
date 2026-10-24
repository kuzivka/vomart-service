import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { db } from "./prisma/db.js";

async function bootstrap() {
  await db.connect();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
