import { Injectable } from '@nestjs/common';
import { DeleteResult, getRepository, Repository } from 'typeorm';
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

    async createTag(companyId: number, value: string): Promise<Tag> {
        const tag = new Tag();
        tag.company = await this.companyRepository.findOne({where:{companyId : companyId}});
        tag.value = value;
        this.tagRepository.save(tag);
        return tag
     }

    async deleteTag(companyId: number, id: number): Promise<DeleteResult> {
        const test = await this.tagRepository.findOne({where: {"tagId": id}})
        if(test != undefined && test.company.companyId == companyId){
            return this.tagRepository.delete({tagId:id});
        }
        return null;    //not sure what to return for failure, either this user is in the wrong company or the tag does not exist
    }

}