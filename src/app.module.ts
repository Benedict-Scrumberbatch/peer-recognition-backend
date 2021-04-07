import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from './company/company.module';
import { RecognitionModule } from './recognition/recognition.module';
import { TagModule } from './tag/tag.module';
import { ConfigModule } from '@nestjs/config';

const ENV = process.env.NODE_ENV
console.log(process.env.NODE_ENV)
console.log(ENV)
console.log(!ENV ? '.env-dev': `.env-${ENV}`)
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
    entities: ["dist/**/*.entity{.ts,.js}"],
    synchronize: true,
    logging: "all"
 }),],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
