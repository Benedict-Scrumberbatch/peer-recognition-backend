import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UnauthorizedException} from '@nestjs/common';
import {TagService} from './tag.service'
import {Tag} from '../entity/tag.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from '../roles/role.enum';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { DeleteResult } from 'typeorm';


@Controller('tag')
export class TagController {
    constructor(private tags: TagService){}

    @UseGuards(JwtAuthGuard)
    @Get()
    getCompanyTags(@Request() req): Promise<Tag[]>{
        return this.tags.getCompanyTags(req.user.companyId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':value')
    delete(@Request() req, @Param('value') value): Promise<DeleteResult>{
        return this.tags.deleteTag(req.user.companyId, value);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post('create')
    create(@Request() req, @Body() tagData): Promise<Tag>{
        return this.tags.createTag(req.user.companyId, tagData.value);
    }


}