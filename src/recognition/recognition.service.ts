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
    ){}

    
    async findAll(): Promise<Recognition[]>{
        const RecognitionsRepository = getRepository(Recognition);
        return RecognitionsRepository.find();
     }

    async createRec(recDto: CreateRecDto): Promise<Recognition> {
        const UserRepository= getRepository(Users);
        const CompanyRepository= getRepository(Company);
        const TagRepository = getRepository(Tag);
        const RecognitionsRepository = getRepository(Recognition);
        const rec = new Recognition();
        rec.msg = recDto.msg;
        rec.postDate = recDto.post_time;
        rec.recId = recDto.recognitionID;
        rec.company = await CompanyRepository.findOne({where:{companyId : recDto.company}});
        rec.empFrom = await UserRepository.findOne({where:{employeeId:recDto.employeeFrom}});
        rec.empTo = await UserRepository.findOne({where:{employeeId:recDto.employeeTo}});
        for(let i = 0; i < recDto.tags.length;i++){
            rec.tags.push(await TagRepository.findOne({ where: { tagId: recDto.tags[i] } }))
        }
        RecognitionsRepository.save(rec);
        return rec
     }

    async deleteRec(id: number): Promise<any> {
       const RecognitionsRepository = getRepository(Recognition);
       return await RecognitionsRepository.delete({recId:id});
     }

}
