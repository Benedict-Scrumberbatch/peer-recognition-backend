import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards} from '@nestjs/common';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import {RecognitionService} from './recognition.service'
import {Recognition} from '../dtos/entity/recognition.entity';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/dtos/enum/role.enum';

@Controller('recognitions')
export class RecognitionController {
    constructor(private recs: RecognitionService){}
    /**
     * Returns a list of all recognitions in the database
     * @returns an array of {@link Recognition} objects
     */
    @Get('all')
    findAll(): Promise<Recognition[]>{
        return this.recs.findAll();
    }
    /**
     * Allows for user to create a new recognition in the database
     * @param recognition takes in a {@link Recognition} object
     * @returns {@link Recognition} object which was added to database
     */
    @Post('create')
    create(@Body() recognition: Recognition): Promise<Recognition>{
        return this.recs.createRec(recognition);
    }
    /**
     * Deletes a specific recognition post by the given RecognitionId
     * @param req Request object which stores user information
     * @param id id of the {@link Recognition} object to be deleted
     * @returns {@link DeleteResult} object which states how many entries were deleted
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    delete(@Request() req, @Param('id') id): Promise<DeleteResult>{
        return this.recs.deleteRec(id, req.user.companyId, req.user.employeeId);
    }

}
