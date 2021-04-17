import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UnauthorizedException} from '@nestjs/common';
import {TagService} from './tag.service'
import {Tag} from '../dtos/entity/tag.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../dtos/enum/role.enum';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
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
    @Delete(':id')
    delete(@Request() req, @Param('id') id: number): Promise<DeleteResult>{
        return this.tags.deleteTag(req.user.companyId, id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post('create')
    create(@Request() req, @Body() tagData): Promise<Tag>{
        return this.tags.createTag(req.user.companyId, tagData.value);
    }


}