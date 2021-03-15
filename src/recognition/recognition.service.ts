import { Injectable } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';
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

    
    async findAll(): Promise<Recognition[]>{
        return this.recognitionsRepository.find();
     }

    async createRec(recDto: CreateRecDto): Promise<Recognition> {
        const rec = new Recognition();
        rec.msg = recDto.msg;
        rec.postDate = new Date();
        rec.company = await this.companyRepository.findOne({where:{companyId : recDto.company}});
        rec.empFrom = await this.userRepository.findOne({where:{employeeId:recDto.employeeFrom}});
        rec.empTo = await this.userRepository.findOne({where:{employeeId:recDto.employeeTo}});
        rec.tags = [];
        if(recDto.tags != undefined){
        for(let i = 0; i < recDto.tags.length;i++){
            const tag = await this.tagRepository.findOne({ where: { tagId: recDto.tags[i] } });
            if(tag != undefined){
            rec.tags.push()
            }
        }
    }
        await this.recognitionsRepository.save(rec);
        return rec
     }

    async deleteRec(id: number): Promise<any> {
       return await this.recognitionsRepository.delete({recId:id});
     }

}
