import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards} from '@nestjs/common';
import {CreateRecDto} from './dto/create-rec.dto'
import {RecognitionService} from './recognition.service'
import {Recognition} from '../dtos/entity/recognition.entity';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('recognitions')
export class RecognitionController {
    constructor(private recs: RecognitionService){}

    @Get('all')
    findAll(): Promise<Recognition[]>{
        return this.recs.findAll();
    }
    @Post('create')
        create(@Body() recognition: Recognition): Promise<Recognition>{
            return this.recs.createRec(recognition);
        }
    
    @Delete(':id')
        delete(@Param('id') id): Promise<DeleteResult>{
            return this.recs.deleteRec(id);
        }
        
    @UseGuards(JwtAuthGuard)
    @Get('all/company')
    findCompRec(@Request() req){
        return this.recs.findCompRec(req.user.companyId);
    }





}
