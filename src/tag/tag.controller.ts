import { Controller, Get, Post, Delete, Body, Param} from '@nestjs/common';
import {TagService} from './tag.service'
import {Tag} from '../entity/tag.entity';

@Controller('tag')
export class TagController {
    constructor(private tags: TagService){}
    //authorization: users with this companyId
    @Get(':id')
    getCompanyTags(@Param('id') id): Promise<Tag[]>{
        return this.tags.getCompanyTags(id);
    }
    //authorization restriction should be to admins associated with this company
    @Delete(':id')
    delete(@Param('id') id){
        return this.tags.deleteTag(id);
    }
    //authorization: admins with this companyId
    @Post('create')
    create(@Body() tagData): Promise<Tag>{
        //companyId to make sure an admin cannot delete an arbitrary tagId unless it is associated with their company
        return this.tags.createTag(tagData.companyId, tagData.value);
    }


}