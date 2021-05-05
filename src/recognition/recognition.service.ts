import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Brackets, DeleteResult, getConnection, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../dtos/entity/recognition.entity';
import { Company } from '../dtos/entity/company.entity';
import { Users } from '../dtos/entity/users.entity';
import { Tag } from '../dtos/entity/tag.entity';
import { TagStats } from '../dtos/entity/tagstats.entity';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import {Report} from '../dtos/entity/report.entity';
import { reverse } from 'node:dns';
import {Comment} from '../dtos/entity/comment.entity';
import {Reaction} from '../dtos/entity/reaction.entity';
import { text } from 'express';
import { ReactType } from '../dtos/enum/reacttype.enum'

import { Role } from '../dtos/enum/role.enum';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';


@Injectable()
export class RecognitionService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>, 
        @InjectRepository(Recognition)
        private recognitionsRepository: Repository<Recognition>,
        @InjectRepository(TagStats)
        private tagStatsRepo: Repository<TagStats>,
        @InjectRepository(Report)
        private reportRepo: Repository<Report>,
        @InjectRepository(Comment)
        private commentRepo: Repository<Comment>,
        @InjectRepository(Reaction)
        private reactRepo: Repository<Reaction>

    ){} 
    /**
     * Finds the recognitions for given {@link Company}
     * @param id companyId number
     * @returns an array of {@link Recognition} objects
     */
    async findCompRec(id: number): Promise<Recognition[]>{
     return await this.recognitionsRepository.find({relations: ['empFrom', 'empTo', 'tags'], where:{company:id}});
    }
    /**
     * Finds all recognitions in the database
     * @returns an array of {@link Recognition} objects
     */
    async findAll(): Promise<Recognition[]>{
        return await this.recognitionsRepository.find({relations: ['empFrom', 'empTo', 'tags']});
    }

   /**
     * Adds a new recognition to the database and updates user stats
     * @param recognition takes in a {@link Recognition} object and the current's user's ID number
     * @returns a {@link Recognition} object
     */    
    async createRec(recognition: Recognition, compId: number, empId: number): Promise<Recognition> {
        if(recognition.empTo.employeeId === empId){
            throw new UnauthorizedException();
        }
        let empFrom = new Users();
        let comp = new Company();
        comp.companyId = compId;
        empFrom.companyId = compId;
        empFrom.employeeId = empId;
        recognition.empFrom = empFrom;
        recognition.company = comp;
        recognition.postDate = new Date();
        await this.recognitionsRepository.save(recognition);
        await this.changeUserStats(recognition, true);
        return recognition
    }
  
  /**
 * Confirms a user is valid to delete a post and then deletes post by given id number and changes user stats
 * @param id RecognitionId of post user wants to delete
 * @param companyId companyId of logged in user
 * @param empId employee ID of logged in user
 * @param role the role of the logged in user
 * @returns {@link DeleteResult} 
 */
    async deleteRec(id: number, companyId: number, empId: number, role: Role): Promise<DeleteResult> {        
        let rec = await this.recognitionsRepository.findOne({ relations: ["empFrom", "empTo", "company", "tags"], where: { recId: id } });
        if(rec.empFrom.employeeId !== empId && rec.empTo.employeeId !== empId && role !== 'admin'){
            throw new UnauthorizedException();
        }

        await this.changeUserStats(rec, false);

        let deletor = await this.userRepository.findOne({ where: {companyId: companyId, employeeId: empId} });
        /await this.recognitionsRepository.update(id, {deletedBy: deletor});/

        return await this.recognitionsRepository.softDelete({recId:id});
    }

    /**
     * Increment or decrement user tag stats and recognition stats.
     * @param recDto Info about the recognition. (This will be changed to use the {@link Recognition} entity)
     * @param increment `boolean` value that specifies whether we are incrementing or decrementing the recognition and tag stats.
     */
    private async changeUserStats(recDto: Recognition, increment: boolean) { 
        let sign = '-';
        if (increment)
            sign = '+';

        //Increment numRecsSent stat
        await this.userRepository.createQueryBuilder()
            .update()
            .set({
                numRecsSent: () => `"numRecsSent" ${sign} 1`
            })
            .where("companyId = :company", {company: recDto.company.companyId})
            .andWhere("employeeId = :employee", {employee: recDto.empFrom.employeeId})
            .execute();

        //Increment numRecsReceived stat
        await this.userRepository.createQueryBuilder()
            .update()
            .set({
                numRecsReceived: () => `"numRecsReceived" ${sign} 1`
            })
            .where("companyId = :company", {company: recDto.company.companyId})
            .andWhere("employeeId = :employee", {employee: recDto.empTo.employeeId})
            .execute();

        
        let userFrom = await this.userRepository.findOne({ where: {employeeId: recDto.empFrom.employeeId, companyId: recDto.company.companyId}});
        let userTo = await this.userRepository.findOne({where: {employeeId: recDto.empTo.employeeId, companyId: recDto.company.companyId}})
        for(let i = 0; i < recDto.tags.length; i++){
            const currTag = await this.tagRepository.findOne({ where: { tagId: recDto.tags[i].tagId } });
            if (currTag != undefined) {

                //Employee from tag stats
                let findFrom = await this.tagStatsRepo.createQueryBuilder()
                        .where('"employeeCompanyId" = :comp', {comp: recDto.company.companyId})
                        .andWhere('"employeeEmployeeId" = :emp', { emp: recDto.empFrom.employeeId })
                        .andWhere('"tagTagId" = :tag', {tag: recDto.tags[i].tagId})
                        .getOne();
                if (findFrom != undefined) {
                    await this.tagStatsRepo.createQueryBuilder()
                        .update()
                        .set({
                            countSent: () => `"countSent" ${sign} 1`,
                        })
                        .where("employeeCompanyId = :comp", {comp: recDto.company.companyId})
                        .andWhere("employeeEmployeeId = :emp", { emp: recDto.empFrom.employeeId })
                        .andWhere("tagTagId = :tag", {tag: recDto.tags[i].tagId})
                        .execute();
                }
                else if (increment){
                    await this.tagStatsRepo.createQueryBuilder()
                        .insert()
                        .values([{
                            countSent: 1,
                            employee: userFrom,
                            tag: currTag
                        }])
                        .execute();
                }

                //Employee to tag stats.
                let findTo = await this.tagStatsRepo.createQueryBuilder()
                        .where('"employeeCompanyId" = :comp', {comp: recDto.company.companyId})
                        .andWhere('"employeeEmployeeId" = :emp', { emp: recDto.empTo.employeeId })
                        .andWhere('"tagTagId" = :tag', {tag: recDto.tags[i].tagId})
                        .getOne();
                if (findTo != undefined) {
                    let res = await this.tagStatsRepo.createQueryBuilder()
                        .update()
                        .set({
                            countReceived: () => `"countReceived" ${sign} 1`,
                        })
                        .where("employeeCompanyId = :comp", {comp: recDto.company.companyId})
                        .andWhere("employeeEmployeeId = :emp", { emp: recDto.empTo.employeeId })
                        .andWhere("tagTagId = :tag", {tag: recDto.tags[i].tagId})
                        .execute();
                }
                else if (increment) {
                    await this.tagStatsRepo.createQueryBuilder()
                        .insert()
                        .values([{
                            countReceived: 1,
                            employee: userTo,
                            tag: currTag
                        }])
                        .execute();
                }
                
            }
        }
    }

    /**
     * Create a {@link Report} for a {@link Recognition} and writes it to the DB
     * @param rec_id ID of the recognition to be reported
     * @param reporter the {@link Users} who is filing the report
     * @returns {@link Report} the filed report
     */
    async reportRec(rec_id: number, reporter: Users)
    {
        let recog = await this.recognitionsRepository.findOne( {  where: { recId: rec_id }} );

        let report = new Report();
        report.employeeFrom = reporter;
        report.recognition = recog;
        report.ReportDate = new Date();
        await this.reportRepo.save(report);

        return report;
    }

    /**
     * Create a {@link Comment} for a {@link Recognition} and writes it to the DB
     * @param rec_id ID of the recognition to be reported
     * @param text the string of what the user wrote 
     * @param user the {@link Users} who is making the comment
     * @returns {@link Comment} the comment entity
     */
    async addComment(rec_id: number, text: String, user: Users)
    {
        if (text == undefined)
        {
            return new Error('No Body found');
        }
        else
        {
            let newComment = new Comment();
            newComment.CommentDate = new Date();
            newComment.employeeFrom = user;
            let recognition = await this.recognitionsRepository.findOne( {  where: { recId: rec_id }} );
            newComment.recognition = recognition;
        if (newComment.recognition == undefined)
        {
            return new Error('no recognition with that ID was found');
        }
            await this.commentRepo.save(newComment);
            return newComment;
        }
        
    }

    /**
     * Create a {@link Reaction} for a {@link recognition} and writes it to the DB
     * @param rec_id ID of the recognition to be reacted to
     * @param user the {@link Users} who is making the reaction
     * @param reactType the type of the reaction, from {@link ReactType}
     * @returns {@link Reaction} the Reaction entity
     */
    async addReaction(rec_id: number, user: Users, type: ReactType)
    {
        let newReaction = new Reaction();
        newReaction.reactDate = new Date();
        newReaction.employeeFrom = user;
        newReaction.reactType = type;
        
        let recog = await this.recognitionsRepository.findOne( {  where: { recId: rec_id }} );
        newReaction.recognition = recog;
        await this.reactRepo.save(newReaction);

        return newReaction;
    }
    
    /**
     * Gets all {@link Report} for a given recognition and returns them
     * @param rec_id ID of the recognition to find reports for
     * @param user unused {@link Users} 
     * @returns {@link Report} an array of found reports
     */
    async getReports(rec_id: Number, user: Users)
    {
        let recognition = await this.recognitionsRepository.findOne( { where: {recId: rec_id}});
        let reports = await this.reportRepo.find( {  where: { recognition: recognition }} );
        if (reports != undefined)
        {
            return reports;
        }
        else
        {
            return new Error("No reports found");
        }
    }

    /**
     * Gets all {@link Comment} for a given recognition and returns them
     * @param rec_id ID of the recognition to find reports for
     * @param user unused {@link Users} 
     * @returns {@link Comment} an array of found comments
     */
    async getComments(rec_id: Number, user: Users)
    {
        let recognition = await this.recognitionsRepository.findOne( { where: {recId: rec_id}});
        let comments = await this.commentRepo.find( {  where: { recognition: recognition }} );
        if (comments != undefined)
        {
            return comments;
        }
        else
        {
            return new Error("No comments found");
        }
    }

    /**
     * Gets all {@link Reaction} for a given recognition and returns them
     * @param rec_id ID of the recognition to find reports for
     * @param user unused {@link Users} 
     * @returns {@link Reaction} an array of found reactions
     */
    async getReactions(rec_id: Number, user: Users)
    {
        let recognition = await this.recognitionsRepository.findOne( { where: {recId: rec_id}});
        let reactions = await this.reactRepo.find( {  where: { recognition: recognition }} );
        if (reactions != undefined)
        {
            return reactions;
        }
        else
        {
            return new Error("No reactions found");
        }
    }

    /**
     * Removes the given {@link Reaction}
     * @param reactionID ID of the reaction to remove
     * @returns {@link Reaction} the removed reaction or null if it didn't exist
     */
    async removeReaction(reactionID: number): Promise<Reaction[]> {
        const reaction = await this.reactRepo.findOne({ reactionID: reactionID });
        return await this.reactRepo.remove([reaction]);
    }

    /**
     * Soft Deletes the given  {@link Comment}
     * @param commentID ID of the reaction to remove 
     * @returns {@link Comment} the removed comment or null if it didn't exist
     */
    async removeComment(commentID: number): Promise<Comment[]> {
        const comment = await this.commentRepo.findOne({commentID: commentID});
        return await this.commentRepo.softRemove([comment]);
    }

     /**
     * Soft Deletes the given  {@link Report}
     * @param reportID ID of the reaction to remove 
     * @returns {@link Report} the removed report or null if it didn't exist
     */
    async removeReport(reportID: number): Promise<Report[]> {
        const report = await this.reportRepo.findOne({reportID: reportID});
        return await this.reportRepo.softRemove([report]);
    }
    async paginate_post(options: IPaginationOptions, 
        firstName_t: string, 
        lastName_t: string,
        firstName_f: string,
        lastName_f: string,
        empTo_id: number,
        empFrom_id: number,
        empToFrom_id: number,
        search: string,
        msg: string,
        comp_id: number): Promise<Pagination<Recognition>> {
        
        const matchCase = firstName_f || firstName_t || lastName_f|| lastName_t || empFrom_id || empTo_id || empToFrom_id || msg
        const queryBuilder = this.recognitionsRepository.createQueryBuilder('rec');

        queryBuilder.leftJoinAndSelect('rec.empTo', 'empTo').leftJoinAndSelect('rec.empFrom', 'empFrom')
        .where("empTo.companyId = :comp_id", {comp_id: comp_id});
        if(search || matchCase){
            queryBuilder.andWhere(new Brackets (comp => {
                if (search) {
                    comp.orWhere("empTo.lastName ilike :search", {search: '%' + search + '%'})
                    .orWhere("empTo.firstName ilike :search", {search: '%' + search + '%'})
                    .orWhere("empFrom.firstName ilike :search", {search: '%' + search + '%'})
                    .orWhere("empFrom.lastName ilike :search", {search: '%' + search + '%'})
                    .orWhere("msg like :search", {search: '%' + search + '%'});
                }
                if (matchCase) {
                    comp.orWhere(new Brackets (bracket => {
                        if (firstName_t) {
                            bracket.andWhere("empTo.firstName ilike :firstName_t", {firstName_t: '%'+firstName_t+'%'});
                        }

                        if (firstName_f) {
                            bracket.andWhere("empFrom.firstName ilike :firstName_f", {firstName_f: '%'+firstName_f+'%'});
                        }
        
                        if (lastName_t) {
                            bracket.andWhere("empTo.lastName ilike :lastName_t", {lastName_t: '%'+lastName_t+'%'});
                        }

                        if (lastName_f) {
                            bracket.andWhere("empFrom.lastName ilike :lastName_f", {lastName_f: '%'+lastName_f+'%'});
                        }

                        if (empFrom_id) {
                            bracket.andWhere("empFrom.employeeId = :empFrom_id", {empFrom_id: empFrom_id})
                        }

                        if (empTo_id) {
                            bracket.andWhere("empTo.employeeId = :empTo_id", {empTo_id: empTo_id})
                        }

                        if(msg) {
                            bracket.andWhere("msg like :msg", {msg: '%' + msg + '%'})
                        }

                        if (empToFrom_id) {
                            bracket.andWhere(new Brackets (query => {
                                query.orWhere("empTo.employeeId = :empToFrom_id", {empToFrom_id: empToFrom_id})
                                .orWhere("empFrom.employeeId = :empToFrom_id", {empToFrom_id: empToFrom_id})
                            }))
                        }
        
                    }));
                }        
            })); 
        }
        return paginate<Recognition>(queryBuilder, options);
    }
}
