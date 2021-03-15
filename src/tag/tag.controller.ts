import { Controller, Get, Post, Delete, Body, Param} from '@nestjs/common';
import {TagService} from './tag.service'
import {Tag} from '../entity/tag.entity';

@Controller('tag')
export class TagController {
    constructor(private tags: TagService){}
    @Get()
    findAll(): Promise<Tag[]>{
        return this.tags.findAll();
    }
    getCompanyTags(companyId: number): Promise<Tag[]>{
        return this.tags.getCompanyTags(companyId);
    }
    @Delete(':id')
    delete(@Param('id') id){
        return this.tags.deleteTag(id);
    }

}