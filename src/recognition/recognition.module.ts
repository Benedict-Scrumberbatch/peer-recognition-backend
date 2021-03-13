import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecognitionController } from './recognition.controller';
import { RecognitionService } from './recognition.service';
import {Recognition} from '../entity/recognition.entity'
import { Users } from 'src/entity/users.entity';
import { Tag } from 'src/entity/tag.entity';
import { Company } from 'src/entity/company.entity';
@Module({
  imports: [ TypeOrmModule.forFeature([ Recognition])],
  providers: [RecognitionService],
  controllers: [ RecognitionController],
  exports: [RecognitionService]
})
export class RecognitionModule {}
