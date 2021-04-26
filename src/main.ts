import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const fs = require('fs');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ["localhost:3000", "http://ec2-18-207-97-175.compute-1.amazonaws.com:3000/"],
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Peer Recognition Software')
    .setDescription('Peer Recognition API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  fs.writeFileSync("./swagger-assets/swagger-spec.json", JSON.stringify(document));
  await app.listen(4200);
}
bootstrap();
