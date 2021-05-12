import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CompanyModule } from './company/company.module';
import { RecognitionModule } from './recognition/recognition.module'
import { Users } from './common/entity/users.entity';
import { Tag } from './common/entity/tag.entity';
import { Company } from './common/entity/company.entity';
import { RecognitionService } from './recognition/recognition.service';
import { TagModule } from './tag/tag.module';
import { RockstarModule} from './rockstar/rockstar.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerOptions } from 'typeorm';
import { NotificationsModule } from './notifications/notifications.module';

const ENV = process.env.NODE_ENV
let typeormConfig: TypeOrmModuleOptions = {
  
}
@Module({
  imports: [ ConfigModule.forRoot({
    envFilePath: !ENV ? '.env-dev': `.env-${ENV}`
  }),
  AuthModule, UsersModule, RecognitionModule, CompanyModule, TagModule, RockstarModule, TypeOrmModule.forRoot({
    type: "postgres",
    url: process.env.DATABASE_URL && ENV.startsWith('prod') ? process.env.DATABASE_URL : undefined,
    host: process.env.DATABASE_URL && ENV.startsWith('prod') ? undefined : "localhost",
    port: process.env.DATABASE_URL && ENV.startsWith('prod') ? undefined : 5432,
    username: process.env.DATABASE_URL && ENV.startsWith('prod') ? undefined : process.env.DB_USERNAME,
    password: process.env.DATABASE_URL && ENV.startsWith('prod') ? undefined : process.env.DB_PASS,
    database: process.env.DATABASE_URL && ENV.startsWith('prod') ? undefined : process.env.DB_NAME,
    entities: [process.env.DB_ENTITIES],
    ssl: process.env.DATABASE_URL && ENV.startsWith('prod') ? { rejectUnauthorized: false } : false,
    synchronize: true,
    logging: process.env.DB_LOGGING as LoggerOptions
 }), NotificationsModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
