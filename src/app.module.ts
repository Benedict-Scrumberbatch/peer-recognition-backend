import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecognitionController } from './recognition/recognition.controller';
import { RecognitionService } from './recognition/recognition.service';
import {RecognitionModule} from './recognition/recognition.module'

@Module({
  imports: [AuthModule, UsersModule, RecognitionModule, TypeOrmModule.forRoot()],
  controllers: [AppController, RecognitionController],
  providers: [AppService, RecognitionService],

})
export class AppModule {}
