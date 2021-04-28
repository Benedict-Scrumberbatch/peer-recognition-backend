import {RecognitionService} from './recognition.service';
import {Recognition} from '../dtos/entity/recognition.entity';
import {Report} from '../dtos/entity/report.entity';
import {Comment} from '../dtos/entity/comment.entity';
import {Reaction} from '../dtos/entity/reaction.entity';
import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards} from '@nestjs/common';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from '../dtos/enum/role.enum';
import { ReactType } from '../dtos/enum/reacttype.enum'

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
        return this.recs.createRec(recognition, req.user.empId);
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
    @Get(':recID/reports')
    getReports(@Request() req, @Param('recID') rec_id): Promise<Report[] | Error>
    {
        return this.recs.getReports(rec_id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':recID/report')
    addReport(@Request() req, @Param('recID') rec_id): Promise<Report>
    {
        return this.recs.reportRec(rec_id, req.user);
    }

0

    @UseGuards(JwtAuthGuard)
    @Get(':recID/comments')
    getComments(@Request() req, @Param('recID') rec_id): Promise<Comment[] | Error>
    {
        return this.recs.getComments(rec_id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':recID/comment')
    addComment(@Request() req, @Param('redID') rec_id, @Body() text: string): Promise<Comment| Error>
    {
        return this.recs.addComment(rec_id, text, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':recID/reactions')
    getReaction(@Request() req, @Param('recID') rec_id): Promise<Reaction[] | Error>
    {
        return this.recs.getReactions(rec_id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':recID/reaction')
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
