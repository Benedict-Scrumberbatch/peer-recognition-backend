import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { AppController } from './../app.controller';
import { Users } from './users.entity';
import { Login } from './login.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Login])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
