import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './shared/src';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                singleLine: true
            }
        }
    }
     }),
    MongooseModule.forRoot(appConfig().MONGO_DB.URI),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            createKeyv('redis://localhost:6379'),
          ]
        }
      }
    }),
    UsersModule, ProductsModule, CartsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
