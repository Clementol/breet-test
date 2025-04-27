import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(Logger))
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );


  const config = new DocumentBuilder()
    .setTitle('Breet')
    .setDescription('Breet API test Documentation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
