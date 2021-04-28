import {RecognitionService} from './recognition.service';
import {Recognition} from '../peer-recognition-dtos/entity/recognition.entity';
import {Report} from '../peer-recognition-dtos/entity/report.entity';
import {Comment} from '../peer-recognition-dtos/entity/comment.entity';
import {Reaction} from '../peer-recognition-dtos/entity/reaction.entity';
import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from '../peer-recognition-dtos/enum/role.enum';
import { ReactType } from '../peer-recognition-dtos/enum/reacttype.enum'

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

    @UseGuards(JwtAuthGuard)
    @Get('reports/:recID')
    getReports(@Request() req, @Param('recID') rec_id): Promise<Report[] | Error>
    {
        return this.recs.getReports(rec_id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('report/:recID')
    addReport(@Request() req, @Param('recID') rec_id): Promise<Report>
    {
        return this.recs.reportRec(rec_id, req.user);
    }

0

    @UseGuards(JwtAuthGuard)
    @Get('comments/:recID')
    getComments(@Request() req, @Param('recID') rec_id): Promise<Comment[] | Error>
    {
        return this.recs.getComments(rec_id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('comment/:recID')
    addComment(@Request() req, @Param('redID') rec_id, @Body() text: string): Promise<Comment| Error>
    {
        return this.recs.addComment(rec_id, text, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('reactions/:recID')
    getLikes(@Request() req, @Param('recID') rec_id): Promise<Reaction[] | Error>
    {
        return this.recs.getReactions(rec_id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('reaction/:recID')
    addReaction(@Request() req, @Param('recID') rec_id, @Body() type: ReactType) : Promise<Reaction| Error>
    {
        return this.recs.addReaction(rec_id, req.user, type);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('report/:reportID')
    deleteReport(@Request() req, @Param('reportID') report_id): Promise<Report[]>
    {
        return this.recs.removeReport(report_id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('comment/:commentID')
    deleteComment(@Request() req, @Param('commentID') comment_id): Promise<Comment[]>
    {
        return this.deleteComment(comment_id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('reaction/:reactionID')
    deleteReaction(@Request() req, @Param('reactionID') reaction_id): Promise<Reaction[]>
    {
        return this.deleteReaction(reaction_id, req.user);
    }

}
