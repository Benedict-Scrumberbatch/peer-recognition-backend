import {RecognitionService} from './recognition.service';
import {Recognition} from '../dtos/entity/recognition.entity';
import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/dtos/enum/role.enum';

@Controller('recognitions')
export class RecognitionController {
    constructor(private recs: RecognitionService){}

    @Get('all')
    findAll(): Promise<Recognition[]>{
        return this.recs.findAll();
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

}
