import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { configuration, validate } from "./config";
// import { PrismaService } from "./common/prisma.service";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { ValidationPipe } from "./common/pipes/validation.pipe";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PropertiesModule } from "./properties/properties.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { AdminModule } from "./admin/admin.module";
import { PrismaService } from "./common";
import { SMSRuModule } from 'node-sms-ru/nestjs'

@Module({
  imports: [
     SMSRuModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        api_id: config.get('SMS_RU_API_ID'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    AuthModule,
    UsersModule,
    PropertiesModule,
    FavoritesModule,
    AdminModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
