import { Injectable } from '@nestjs/common';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {Tag} from '../common/entity/tag.entity'
import {Company} from '../common/entity/company.entity'

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>, 
        @InjectRepository(Company)
        private companyRepository: Repository<Company>
    ){}

    /**
     * 
     * @param companyId 
     * @returns The array of tags
     */
    async getCompanyTags(companyId: number): Promise<Tag[]>{
        return this.tagRepository.find({where:{company: companyId}})
    }

    /**
     * 
     * @param companyId 
     * @param value the new tag to be added
     * @returns the tag that was added
     */
    async createTag(companyId: number, value: string): Promise<Tag> {
        const tag = new Tag();
        tag.company = await this.companyRepository.findOne({where:{companyId : companyId}});
        tag.value = value;
        this.tagRepository.save(tag);
        return tag
    }

    /**
     * 
     * @param companyId 
     * @param id specific tagId of the tag to be deleted
     * @returns 
     */
    async deleteTag(companyId: number, id: number): Promise<DeleteResult> {
        const tag = await this.tagRepository.findOneOrFail({relations: ["company"], where: {tagId: id}});
        // check that the specified tag does exist AND that tag belongs to the same company as this user
        if(tag != undefined && tag.company.companyId == companyId) {
            return this.tagRepository.delete({tagId: tag.tagId});
        }
        // indicates failure
        return null;
    }

}