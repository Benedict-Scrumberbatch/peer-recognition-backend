import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from './company/company.module';
import { RecognitionModule } from './recognition/recognition.module'
import { Users } from './dtos/entity/users.entity';
import { Tag } from './dtos/entity/tag.entity';
import { Company } from './dtos/entity/company.entity';
import { RecognitionService } from './recognition/recognition.service';
import { TagModule } from './tag/tag.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerOptions } from 'typeorm';

const ENV = process.env.NODE_ENV
@Module({
  imports: [ ConfigModule.forRoot({
    envFilePath: !ENV ? '.env-dev': `.env-${ENV}`
  }),
  AuthModule, UsersModule, RecognitionModule, CompanyModule, TagModule, TypeOrmModule.forRoot({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [process.env.DB_ENTITIES],
    synchronize: true,
    logging: process.env.DB_LOGGING as LoggerOptions
 })],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
