import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from './company/company.module';
import { RecognitionModule } from './recognition/recognition.module'
import { Users } from './peer-recognition-dtos/entity/users.entity';
import { Tag } from './peer-recognition-dtos/entity/tag.entity';
import { Company } from './peer-recognition-dtos/entity/company.entity';
import { RecognitionService } from './recognition/recognition.service';
import { TagModule } from './tag/tag.module';
import { RockstarModule} from './rockstar/rockstar.module';

@Module({
  imports: [AuthModule, UsersModule, RockstarModule, RecognitionModule, CompanyModule, TagModule, TypeOrmModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
