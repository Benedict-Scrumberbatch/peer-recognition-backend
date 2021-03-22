import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request} from '@nestjs/common';
import {TagService} from './tag.service'
import {Tag} from '../entity/tag.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('tag')
export class TagController {
    constructor(private tags: TagService){}
    //authorization: users with this companyId
    @UseGuards(JwtAuthGuard)
    @Get()
    getCompanyTags(@Request() req): Promise<Tag[]>{
        return this.tags.getCompanyTags(req.user.companyId);
    }
    //authorization restriction should be to admins associated with this company
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Request() req, @Param('id') id){
        return this.tags.deleteTag(req.user.copanyId, id);
    }
    //authorization: admins with this companyId
    @UseGuards(JwtAuthGuard)
    @Post('create')
    create(@Request() req, @Body() tagData): Promise<Tag>{
        if(req.user.companyId != tagData.companyId){
            return null;    //not sure what to return
        }
        return this.tags.createTag(tagData.companyId, tagData.value);
    }


}