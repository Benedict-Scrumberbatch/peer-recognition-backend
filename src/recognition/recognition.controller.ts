import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards, Query} from '@nestjs/common';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import {RecognitionService} from './recognition.service'
import {Recognition} from '../dtos/entity/recognition.entity';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/dtos/enum/role.enum';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('recognitions')
export class RecognitionController {
    constructor(private recs: RecognitionService){}

    @UseGuards(JwtAuthGuard)
    @Get('all')
    findAll(@Request() req): Promise<Recognition[]>{
        return this.recs.findCompRec(req.user.companyId);
    }
    @Post('create')
    create(@Body() createRecDto: Recognition): Promise<Recognition>{
        return this.recs.createRec(createRecDto);
    }
  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    delete(@Request() req, @Param('id') id): Promise<DeleteResult>{
        return this.recs.deleteRec(id, req.user.companyId, req.user.employeeId);
    }

    // @UseGuards(JwtAuthGuard)
    @Get('search')
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('firstName_t') firstName_t: string,
        @Query('lastName_t') lastName_t: string,
        @Query('firstName_f') firstName_f: string,
        @Query('lastName_f') lastName_f: string,
        @Query('search') search: string,
        @Query('msg') msg: string,   
    ): Promise<Pagination<Recognition>> {
        limit = limit > 100 ? 100: limit
        return this.recs.paginate_post(
            {page: Number(page), limit: Number(limit), route: 'http://localhost:4200/recognitions/search'},
            firstName_t, lastName_t,
            firstName_f, lastName_f,
            search,
            msg);
    }

}
