   import "dotenv/config";
   import { NestFactory } from "@nestjs/core";
   import helmet from "helmet";
   import { AppModule } from "./app.module.js";
   import { db } from "./prisma/db.js";

   async function bootstrap() {
     if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
       throw new Error("JWT_SECRET is missing or too short");
     }
     await db.connect();
     const app = await NestFactory.create(AppModule);
     app.use(helmet());
     app.enableCors({
       origin: (process.env.FRONTEND_URL ?? "http://localhost:5173,http://localhost:5174").split(","),
     });
     app.enableShutdownHooks();
     await app.listen(process.env.PORT ?? 3000);
   }
   bootstrap();