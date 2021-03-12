import { Controller, Get, Post, Delete, Body, Param} from '@nestjs/common';
import {CreateRecDto} from './dto/create-rec.dto'
import {RecognitionService} from './recognition.service'
import {Recognition} from '../entity/recognition.entity';

@Controller('recognition')
export class RecognitionController {
    constructor(private readonly recs: RecognitionService){}
    @Get()
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
