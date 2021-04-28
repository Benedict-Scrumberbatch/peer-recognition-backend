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
    async createRec(recognition: Recognition, empId: number): Promise<Recognition> {
        if(recognition.empFrom.employeeId !== empId || recognition.empTo.employeeId === empId){
            throw new UnauthorizedException();
        }
        recognition.postDate = new Date();
        await this.recognitionsRepository.save(recognition);
        let tagArr = [];
        recognition.tags.forEach(tag => {tagArr.push(tag.tagId)})
        const recDto: CreateRecDto = {
            company: recognition.company.companyId,
            employeeFrom: recognition.empFrom.employeeId,
            employeeTo: recognition.empTo.employeeId,
            msg: recognition.msg,
            tags: tagArr
        }
        await this.changeUserStats(recDto, true)
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

        let tagArr = [];
        rec.tags.forEach(tag => {tagArr.push(tag.tagId)})
        let recDto: CreateRecDto = {
            company: rec.company.companyId,
            employeeFrom: rec.empFrom.employeeId,
            employeeTo: rec.empTo.employeeId,
            msg: rec.msg,
            tags: tagArr
        }

        await this.changeUserStats(recDto, false);

        let deletor = await this.userRepository.findOne({ where: {companyId: companyId, employeeId: empId} });
        /await this.recognitionsRepository.update(id, {deletedBy: deletor});/

        return await this.recognitionsRepository.softDelete({recId:id});
    }

    /**
     * Increment or decrement user tag stats and recognition stats.
     * @param recDto Info about the recognition. (This will be changed to use the {@link Recognition} entity)
     * @param increment `boolean` value that specifies whether we are incrementing or decrementing the recognition and tag stats.
     */
    private async changeUserStats(recDto: CreateRecDto, increment: boolean) { 
        let sign = '-';
        if (increment)
            sign = '+';

        //Increment numRecsSent stat
        await this.userRepository.createQueryBuilder()
            .update()
            .set({
                numRecsSent: () => `"numRecsSent" ${sign} 1`
            })
            .where("companyId = :company", {company: recDto.company})
            .andWhere("employeeId = :employee", {employee: recDto.employeeFrom})
            .execute();

        //Increment numRecsReceived stat
        await this.userRepository.createQueryBuilder()
            .update()
            .set({
                numRecsReceived: () => `"numRecsReceived" ${sign} 1`
            })
            .where("companyId = :company", {company: recDto.company})
            .andWhere("employeeId = :employee", {employee: recDto.employeeTo})
            .execute();

        
        let userFrom = await this.userRepository.findOne({ where: {employeeId: recDto.employeeFrom, companyId: recDto.company}});
        let userTo = await this.userRepository.findOne({where: {employeeId: recDto.employeeTo, companyId: recDto.company}})
        for(let i = 0; i < recDto.tags.length; i++){
            const currTag = await this.tagRepository.findOne({ where: { tagId: recDto.tags[i] } });
            if (currTag != undefined) {

                //Employee from tag stats
                let findFrom = await this.tagStatsRepo.createQueryBuilder()
                        .where('"employeeCompanyId" = :comp', {comp: recDto.company})
                        .andWhere('"employeeEmployeeId" = :emp', { emp: recDto.employeeFrom })
                        .andWhere('"tagTagId" = :tag', {tag: recDto.tags[i]})
                        .getOne();
                if (findFrom != undefined) {
                    await this.tagStatsRepo.createQueryBuilder()
                        .update()
                        .set({
                            countSent: () => `"countSent" ${sign} 1`,
                        })
                        .where("employeeCompanyId = :comp", {comp: recDto.company})
                        .andWhere("employeeEmployeeId = :emp", { emp: recDto.employeeFrom })
                        .andWhere("tagTagId = :tag", {tag: recDto.tags[i]})
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
                        .where('"employeeCompanyId" = :comp', {comp: recDto.company})
                        .andWhere('"employeeEmployeeId" = :emp', { emp: recDto.employeeTo })
                        .andWhere('"tagTagId" = :tag', {tag: recDto.tags[i]})
                        .getOne();
                if (findTo != undefined) {
                    let res = await this.tagStatsRepo.createQueryBuilder()
                        .update()
                        .set({
                            countReceived: () => `"countReceived" ${sign} 1`,
                        })
                        .where("employeeCompanyId = :comp", {comp: recDto.company})
                        .andWhere("employeeEmployeeId = :emp", { emp: recDto.employeeTo })
                        .andWhere("tagTagId = :tag", {tag: recDto.tags[i]})
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

    async removeReaction(reactionID: number, user: Users): Promise<Reaction[]> {
        const reaction = await this.reactRepo.findOne({ reactionID: reactionID });
        return await this.reactRepo.softRemove([reaction]);
    }

    async removeComment(commentID: number, user: Users): Promise<Comment[]> {
        const comment = await this.commentRepo.findOne({commentID: commentID});
        return await this.commentRepo.softRemove([comment]);
    }

    async removeReport(reportID: number, user: Users): Promise<Report[]> {
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
        search: string,
        msg: string,
        comp_id: number): Promise<Pagination<Recognition>> {
        const queryBuilder = this.recognitionsRepository.createQueryBuilder('rec');

        queryBuilder.leftJoinAndSelect('rec.empTo', 'empTo').leftJoinAndSelect('rec.empFrom', 'empFrom')
        .where("empTo.companyId = :comp_id", {comp_id: comp_id})
        .andWhere(new Brackets(comp => {

            // search by Firstname Lastname
            if (firstName_t != null && firstName_t != undefined 
                && lastName_t != null && lastName_t != undefined){
                comp.orWhere("empTo.firstName ilike :firstName_t", {firstName_t: '%'+firstName_t+'%'})
                .andWhere("empTo.lastName ilike :lastName_t", {lastName_t: '%'+lastName_t+'%'})
            }
            else {
                comp.orWhere("empTo.firstName ilike :firstName_t", {firstName_t: '%'+firstName_t+'%'})
                .orWhere("empTo.lastName ilike :lastName_t", {lastName_t: '%'+lastName_t+'%'})
            }

            if (firstName_f != null && firstName_f != undefined 
                && lastName_f != null && lastName_f != undefined){
                comp.orWhere("empFrom.firstName ilike :firstName_f", {firstName_f: '%'+firstName_f+'%'})
                .andWhere("empFrom.lastName ilike :lastName_f", {lastName_f: '%'+lastName_f+'%'})
            }
            else {
                comp.orWhere("empFrom.firstName ilike :firstName_f", {firstName_f: '%'+firstName_f+'%'})
                .orWhere("empFrom.lastName ilike :lastName_f", {lastName_f: '%'+lastName_f+'%'})
            }


            // search by $ID
            comp.orWhere(new Brackets(qb => {
                qb.where("empTo.employeeId = :empTo_id", {empTo_id: empTo_id})
                .andWhere("empFrom.employeeId = :empFrom_id", {empFrom_id: empFrom_id});
            }))


            // search by $SEARCH
            if (search != null && search != undefined){
                const arr = search.split(' ', 2)
                if (arr.length > 1) {
                    comp.orWhere(new Brackets(qb => {
                        qb.orWhere("empTo.firstName ilike :fnTo", {fnTo: '%'+arr[0]+'%'})
                        .andWhere("empTo.lastName ilike :lnTo", {lnTo: '%'+arr[1]+'%'})
                    }))
                    .orWhere(new Brackets(qb => {
                        qb.orWhere("empFrom.firstName ilike :fnFrom", {fnFrom: '%'+arr[0]+'%'})
                        .andWhere("empFrom.lastName ilike :lnFrom", {lnFrom: '%'+arr[1]+'%'})
                    }));
                }
                else {
                    comp.orWhere("empTo.lastName ilike :search", {search: '%' + search + '%'})
                    .orWhere("empTo.firstName ilike :search", {search: '%' + search + '%'})
                    .orWhere("empFrom.firstName ilike :search", {search: '%' + search + '%'})
                    .orWhere("empFrom.lastName ilike :search", {search: '%' + search + '%'})
                }
            }
            

            // search by $MSG
            comp.orWhere("msg like :msg", {msg: '%' + msg + '%'});
        }))
        return paginate<Recognition>(queryBuilder, options);
    }
}
