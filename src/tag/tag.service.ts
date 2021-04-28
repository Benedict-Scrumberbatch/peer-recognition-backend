import { Injectable } from '@nestjs/common';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {Tag} from '../peer-recognition-dtos/entity/tag.entity'
import {Company} from '../peer-recognition-dtos/entity/company.entity'

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>, 
        @InjectRepository(Company)
        private companyRepository: Repository<Company>
    ){}

    async getCompanyTags(companyId: number): Promise<Tag[]>{
        return this.tagRepository.find({where:{company: companyId}})
    }

    async createTag(companyId: number, value: string): Promise<Tag> {
        const tag = new Tag();
        tag.company = await this.companyRepository.findOne({where:{companyId : companyId}});
        tag.value = value;
        this.tagRepository.save(tag);
        return tag
     }

    async deleteTag(companyId: number, id: number): Promise<DeleteResult> {
        const tag = await this.tagRepository.findOneOrFail({relations: ["company"], where: {tagId: id}});

        if(tag != undefined && tag.company.companyId == companyId) {
            return this.tagRepository.delete({tagId: tag.tagId});
        }
        return null;    //not sure what to return for failure, either this user is in the wrong company or the tag does not exist
    }

}