import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
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
        private UserRepository = getRepository(Users),
        @InjectRepository(Company)
        private CompanyRepository = getRepository(Company),
        @InjectRepository(Tag)
        private TagRepository = getRepository(Tag),
        @InjectRepository(Recognition)
        private RecognitionsRepository = getRepository(Recognition),
    ){}


    async findAll(): Promise<Recognition[]>{
         return this.RecognitionsRepository.find();
     }

    async createRec(recDto: CreateRecDto): Promise<Recognition> {
        const rec = new Recognition();
        rec.msg = recDto.msg;
        rec.postDate = recDto.post_time;
        rec.recId = recDto.recognitionID;
        rec.company = await this.CompanyRepository.findOne({where:{companyId : recDto.company}});
        rec.empFrom = await this.UserRepository.findOne({where:{employeeId:recDto.employeeFrom}});
        rec.empTo = await this.UserRepository.findOne({where:{employeeId:recDto.employeeTo}});
        for(let i = 0; i < recDto.tags.length;i++){
            rec.tags.push(await this.TagRepository.findOne({ where: { tagId: recDto.tags[i] } }))
        }
        this.RecognitionsRepository.save(rec);
        return rec
     }

    async deleteRec(id: number): Promise<any> {
       return await this.RecognitionsRepository.delete({recId:id});
     }

}
