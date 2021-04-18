import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards} from '@nestjs/common';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import {RecognitionService} from './recognition.service'
import {Recognition} from '../dtos/entity/recognition.entity';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../dtos/enum/role.enum';

@Controller('recognitions')
export class RecognitionController {
    constructor(private recs: RecognitionService){}

    @UseGuards(JwtAuthGuard)
    @Get('all')
    findAll(@Request() req): Promise<Recognition[]>{
        return this.recs.findCompRec(req.user.companyId);
    }
    @UseGuards(JwtAuthGuard)
    @Post('create')
    create(@Request() req, @Body() recognition: Recognition): Promise<Recognition>{
        return this.recs.createRec(recognition, req.user.empId);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Request() req, @Param('id') id): Promise<DeleteResult>{
        return this.recs.deleteRec(id, req.user.companyId, req.user.employeeId, req.user.role);
    }

}
