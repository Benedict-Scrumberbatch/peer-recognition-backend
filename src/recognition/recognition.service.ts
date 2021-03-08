import { Injectable } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {Recognition} from '../entity/recognition.entity';
import {CreateRecDto} from './dto/create-rec.dto'

@Injectable()
export class RecognitionService {
    constructor(
        @InjectRepository(Recognition)
        private recognitionsRepository: Repository<Recognition>
    ){}


     async findAll(): Promise<Recognition[]>{
         return this.recognitionsRepository.find();
     }

     async createRec(recDto: CreateRecDto): Promise<any>{
        return this.recognitionsRepository.createQueryBuilder().insert().into(Recognition).values([{
            "recId": recDto.recognitionID,
            "empFrom": recDto.employeeFrom,
            "empTo": recDto.employeeTo,
            "company": recDto.company,
            "postDate": recDto.post_time
        }]).execute();
     }

     async deleteRec(id: number): Promise<any> {
        return this.recognitionsRepository.createQueryBuilder().delete().from(Recognition).where("id = :id", {id: id}).execute();
     }

}
