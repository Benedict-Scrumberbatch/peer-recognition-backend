import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import {CreateRecDto} from './dto/create-rec.dto'
import {RecognitionService} from './recognition.service'
import {Recognition} from '../entity/recognition.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../roles/role.enum';
import { DeleteResult } from 'typeorm';

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
