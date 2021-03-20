import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [AuthModule, UsersModule, CompanyModule, TypeOrmModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
