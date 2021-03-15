import { Injectable } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {Tag} from '../entity/tag.entity'
import {Company} from '../entity/company.entity'

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>, 
        @InjectRepository(Company)
        private companyRepository: Repository<Company>
    ){}

    async getCompanyTags(companyId: number): Promise<Tag[]>{
        return this.tagRepository.find({where:{companyId: companyId}})
    }

    async findAll(): Promise<Tag[]>{
        return this.tagRepository.find();
    }

    async createTag(companyId: number, value: string): Promise<Tag> {
        const tag = new Tag();
        tag.company = await this.companyRepository.findOne({where:{companyId : companyId}});
        tag.value = value;
        this.tagRepository.save(tag);
        return tag
     }

    async deleteTag(id: number): Promise<any> {
       return await this.tagRepository.delete({tagId:id});
    }

}
