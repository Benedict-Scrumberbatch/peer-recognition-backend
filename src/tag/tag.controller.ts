import { Controller, Get, Post, Delete, Body, Param} from '@nestjs/common';
import {TagService} from './tag.service'
import {Tag} from '../entity/tag.entity';

@Controller('tag')
export class TagController {
    constructor(private tags: TagService){}
    //Need to add some way of requiring authorization, like maybe get passed the currently logged in user and get companyId from there?
    @Get(':id')
    getCompanyTags(@Param('id') id): Promise<Tag[]>{
        return this.tags.getCompanyTags(id);
    }
    @Delete(':id')
    delete(@Param('id') id){
        return this.tags.deleteTag(id);
    }
    @Post('create')
    create(@Body() tagData: any): Promise<Tag>{
        return this.tags.createTag(tagData.companyId, tagData.value);
    }


}