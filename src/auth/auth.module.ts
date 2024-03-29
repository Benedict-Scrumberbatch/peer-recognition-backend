import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { JwtRefreshTokenStrategy } from './jwt.refreshtoken.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Login } from '../common/entity/login.entity';

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    TypeOrmModule.forFeature([Login]),
    JwtModule.register({
      secret: jwtConstants.access_secret,
      signOptions: { expiresIn: '5m' },  
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}