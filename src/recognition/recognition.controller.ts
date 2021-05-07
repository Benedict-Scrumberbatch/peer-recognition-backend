import {RecognitionService} from './recognition.service';
import {Recognition} from '../dtos/entity/recognition.entity';
import {Report} from '../dtos/entity/report.entity';
import {Comment} from '../dtos/entity/comment.entity';
import {Reaction} from '../dtos/entity/reaction.entity';
import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards, Query} from '@nestjs/common';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
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

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Request() req, @Param('id') id): Promise<Recognition>{
        return this.recs.findRecById(req.user.companyId, id);
    }
  /**
     * Allows for user to create a new recognition in the database
     * @param recognition takes in a {@link Recognition} object and a req object
     * @returns {@link Recognition} object which was added to database
     */
    @UseGuards(JwtAuthGuard)
    @Post('create')
    create(@Request() req, @Body() recognition: Recognition): Promise<Recognition>{
        return this.recs.createRec(recognition, req.user);
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
        return this.recs.deleteRec(id, req.user);
    }

     /**
     * Gets all reports for the given recognition ID
     * @param req Request object which stores user information
     * @param rec_id id of the {@link Recognition} to find {@link Report}s for
     * @returns {@link Report} arrays which returns all the reports
     */
    @UseGuards(JwtAuthGuard)
    @Get(':recID/reports')
    getReports(@Request() req, @Param('recID') rec_id): Promise<Report[] | Error>
    {
        return this.recs.getReports(rec_id, req.user);
    }

    /**
     * Creates a report for the given rec_id
     * @param req Request object which stores user information
     * @param rec_id id of the {@link Recognition} to create a {@link Report} for
     * @returns {@link Report} the created report
     */

    @UseGuards(JwtAuthGuard)
    @Post(':recID/report')
    addReport(@Request() req, @Param('recID') rec_id, @Body() report: Report): Promise<Report>
    {
        return this.recs.reportRec(rec_id, req.user, report);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':recID/comment/:commentId/report')
    addReportComment(@Request() req, @Param('commentId') comment_id, @Body() report: Report): Promise<Report>
    {
        return this.recs.reportComment(comment_id, req.user, report);
    }

    /**
     * Gets all comments for the given recognition ID
     * @param req Request object which stores user information
     * @param rec_id id of the {@link Recognition} to find {@link Comment}s for
     * @returns {@link Comment} array which returns all the comments
     */

    @UseGuards(JwtAuthGuard)
    @Get(':recID/comments')
    getComments(@Request() req, @Param('recID') rec_id): Promise<Comment[] | Error>
    {
        return this.recs.getComments(rec_id, req.user);
    }

    /**
     * Creates a comment for the given rec_id
     * @param req Request object which stores user information
     * @param rec_id id of the {@link Recognition} to create a {@link Comment} for
     * @returns {@link Comment} the created comment
     */
    @UseGuards(JwtAuthGuard)
    @Post(':recID/comment')
    addComment(@Request() req, @Param('redID') rec_id, @Body() comment: Comment): Promise<Comment>
    {
        return this.recs.addComment(rec_id, comment, req.user);
    }

    /**
     * Gets all reports for the given recognition ID
     * @param req Request object which stores user information
     * @param rec_id id of the {@link Recognition} to find {@link Reaction}s for
     * @returns {@link Reaction} array which returns all the reports
     */

    @UseGuards(JwtAuthGuard)
    @Get(':recID/reactions')
    getReaction(@Request() req, @Param('recID') rec_id): Promise<Reaction[] | Error>
    {
        return this.recs.getReactions(rec_id, req.user);
    }

    /**
     * Creates a reaction for the given rec_id
     * @param req Request object which stores user information
     * @param rec_id id of the {@link Recognition} to create a {@link Reaction} for
     * @param type type of the reaction from {@link reacttype.enum} 
     * @returns {@link Reaction} the created reaction
     */
    @UseGuards(JwtAuthGuard)
    @Post(':recID/reaction')
    addReaction(@Request() req, @Param('recID') rec_id) : Promise<Reaction| Error>
    {
        return this.recs.addReaction(rec_id, req.user);
    }

    /**
     * Soft Deletes the given Report
     * @param req Request object which stores user information
     * @param reportID id of the {@link Report} to delete
     * @returns {@link Report} the deleted Report
     */
    @UseGuards(JwtAuthGuard)
    @Delete('report/:reportID')
    deleteReport(@Request() req, @Param('reportID') report_id): Promise<Report[]>
    {
        return this.recs.removeReport(report_id);
    }

    /**
     * Soft Deletes the given Comment
     * @param req Request object which stores user information
     * @param commentID id of the {@link Comment} to delete
     * @returns {@link Comment} the deleted Comment
     */

    @UseGuards(JwtAuthGuard)
    @Delete('comment/:commentID')
    deleteComment(@Request() req, @Param('commentID') comment_id): Promise<Comment[]>
    {
        return this.recs.removeComment(comment_id);
    }

    /**
     * Deletes the given Reaction
     * @param req Request object which stores user information
     * @param reactiontID id of the {@link Reaction} to delete
     * @returns {@link Reaction} the deleted reaction
     */

    @UseGuards(JwtAuthGuard)
    @Delete('reaction/:reactionID')
    deleteReaction(@Request() req, @Param('reactionID') reaction_id): Promise<Reaction[]>
    {
        return this.recs.removeReaction(reaction_id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('search')
    async index(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('firstName_to') firstName_t: string,
        @Query('lastName_to') lastName_t: string,
        @Query('firstName_from') firstName_f: string,
        @Query('lastName_from') lastName_f: string,
        @Query('empTo_id') empTo_id: number,
        @Query('empToFrom_id') empToFrom_id: number,
        @Query('empFrom_id') empFrom_id: number,
        @Query('search') search: string,
        @Query('msg') msg: string,   
        @Request() req
    ): Promise<Pagination<Recognition>> {
        const pageRegex = /&page(\=[^&]*)?(?=&|$)|^page(\=[^&]*)?(&|$)/;
        const limitRegex = /&limit(\=[^&]*)?(?=&|$)|^limit(\=[^&]*)?(&|$)/;
        let path: string = req.url;
        path = path.replace(pageRegex, '')
        path = path.replace(limitRegex, '')
        limit = limit > 100 ? 100: limit
        limit = limit <= 0 ? 1: limit
        return this.recs.paginate_post(
            {page: Number(page), limit: Number(limit), route: req.headers.host + path},
            firstName_t, lastName_t,
            firstName_f, lastName_f,
            empTo_id, empFrom_id,
            empToFrom_id, 
            search, msg,
            req.user.companyId);
    }

}
