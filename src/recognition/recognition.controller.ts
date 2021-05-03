import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards, Query} from '@nestjs/common';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import {RecognitionService} from './recognition.service'
import {Recognition} from '../dtos/entity/recognition.entity';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../dtos/enum/role.enum';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('recognitions')
export class RecognitionController {
    constructor(private recs: RecognitionService){}
    /**
     * Returns a list of all recognitions in the database for the current user's company
     * @returns an array of {@link Recognition} objects
     */
    @UseGuards(JwtAuthGuard)
    @Get('all')
    findAll(@Request() req): Promise<Recognition[]>{
        return this.recs.findCompRec(req.user.companyId);
    }
  /**
     * Allows for user to create a new recognition in the database
     * @param recognition takes in a {@link Recognition} object and a req object
     * @returns {@link Recognition} object which was added to database
     */
    @UseGuards(JwtAuthGuard)
    @Post('create')
    create(@Request() req, @Body() recognition: Recognition): Promise<Recognition>{
        return this.recs.createRec(recognition, req.user.companyId, req.user.employeeId);
    }
  
   
    /**
     * Deletes a specific recognition post by the given RecognitionId
     * @param req Request object which stores user information
     * @param id id of the {@link Recognition} object to be deleted
     * @returns {@link DeleteResult} object which states how many entries were deleted
     */
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Request() req, @Param('id') id): Promise<DeleteResult>{
        return this.recs.deleteRec(id, req.user.companyId, req.user.employeeId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Get('search')
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('firstName_t') firstName_t: string,
        @Query('lastName_t') lastName_t: string,
        @Query('firstName_f') firstName_f: string,
        @Query('lastName_f') lastName_f: string,
        @Query('empTo_id') empTo_id: number,
        @Query('empFrom_id') empFrom_id: number,
        @Query('search') search: string,
        @Query('msg') msg: string,   
        @Request() req
    ): Promise<Pagination<Recognition>> {
        limit = limit > 100 ? 100: limit
        return this.recs.paginate_post(
            {page: Number(page), limit: Number(limit), route: 'http://localhost:4200/recognitions/search'},
            firstName_t, lastName_t,
            firstName_f, lastName_f,
            empTo_id, empFrom_id,
            search,
            msg,
            req.user.companyId);
    }

}
