import { Injectable } from '@nestjs/common';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {Recognition} from '../entity/recognition.entity';
import {Company} from '../entity/company.entity'
import {Users} from '../entity/users.entity'
import {Tag} from '../entity/tag.entity'
import {CreateRecDto} from './dto/create-rec.dto'

@Injectable()
export class RecognitionService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>, 
        @InjectRepository(Recognition)
        private recognitionsRepository: Repository<Recognition>,
    ){}

    async findCompRec(id: number): Promise<Recognition[]>{
     return await this.recognitionsRepository.find({where:{companyCompanyId:id}});
    }

    async findAll(): Promise<Recognition[]>{
        return await this.recognitionsRepository.find();
     }

    async createRec(recognition: Recognition): Promise<Recognition> {
        recognition.postDate = new Date();
        await this.recognitionsRepository.save(recognition);
        return recognition;
     }

    async deleteRec(id: number): Promise<DeleteResult> {
       return await this.recognitionsRepository.delete({recId:id});
     }
     
}