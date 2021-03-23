import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from './company/company.module';
import { RecognitionModule } from './recognition/recognition.module'
import { Users } from './entity/users.entity';
import { Tag } from './entity/tag.entity';
import { Company } from './entity/company.entity';
import { RecognitionService } from './recognition/recognition.service';

@Module({
  imports: [AuthModule, UsersModule, RecognitionModule, CompanyModule TypeOrmModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
