import { Controller, Get, Post, Delete, Body, Param} from '@nestjs/common';
import {CreateRecDto} from '../dtos/dto/create-rec.dto'
import {RecognitionService} from './recognition.service'
import {Recognition} from '../dtos/entity/recognition.entity';

@Controller('recognitions')
export class RecognitionController {
    constructor(private recs: RecognitionService){}
    @Get('all')
    findAll(): Promise<Recognition[]>{
        return this.recs.findAll();
    }
    @Post('create')
        create(@Body() createRecDto: CreateRecDto): Promise<Recognition>{
            return this.recs.createRec(createRecDto);
        }
    @Delete(':id')
        delete(@Param('id') id){
            return this.recs.deleteRec(id);
        }







}
