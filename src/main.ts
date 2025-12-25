import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow("port");
  const frontendUrl = configService.getOrThrow("frontend.url");

  // CORS
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Dohkar API")
    .setDescription("API для платформы недвижимости Dohkar")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth", "Авторизация")
    .addTag("users", "Пользователи")
    .addTag("properties", "Недвижимость")
    .addTag("favorites", "Избранное")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
