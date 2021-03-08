import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecognitionController } from './recognition.controller';
import { RecognitionService } from './recognition.service';
import {Recognition} from '../entity/recognition.entity'
@Module({
  imports: [ TypeOrmModule.forFeature([Recognition])],
  controllers: [ RecognitionController],
  providers: [ RecognitionService],

})
export class RecognitionModule {}
