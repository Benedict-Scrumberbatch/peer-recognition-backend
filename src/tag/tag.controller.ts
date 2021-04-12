import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UnauthorizedException} from '@nestjs/common';
import {TagService} from './tag.service'
import {Tag} from '../dtos/entity/tag.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from '../dtos/enum/role.enum';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { DeleteResult } from 'typeorm';


@Controller('tag')
export class TagController {
    constructor(private tags: TagService){}

    /**
     * Gets the core values tags for the company of the user that is logged in
     * @param req passed by the JWT token, contains logged-in user information
     * @returns An array of the tags for the user's company, not including any deleted tags
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    getCompanyTags(@Request() req): Promise<Tag[]>{
        return this.tags.getCompanyTags(req.user.companyId);
    }

    /**
     * An Admin can delete only tags for their own company
     * @param req passed by the JWT auth token, contains logged-in user information
     * @param id The id of the {@link Tag} to be deleted
     * @returns a DeleteResult, or null if the tags is not found / does not belong to the user's company
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    delete(@Request() req, @Param('id') id: number): Promise<DeleteResult>{
        return this.tags.deleteTag(req.user.companyId, id);
    }

    /**
     * An Admin can create tags for their company
     * @param req passed by the JWT token, contains logged-in user information
     * @param tagData an object containing a string that is the core value to be added to this company's core value tags
     * @returns The {@link Tag} that was added
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post('create')
    create(@Request() req, @Body() tagData): Promise<Tag>{
        return this.tags.createTag(req.user.companyId, tagData.value);
    }


}