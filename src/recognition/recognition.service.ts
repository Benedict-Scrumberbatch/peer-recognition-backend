import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DeleteResult, getConnection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../peer-recognition-dtos/entity/recognition.entity';
import { Company } from '../peer-recognition-dtos/entity/company.entity';
import { Users } from '../peer-recognition-dtos/entity/users.entity';
import { Tag } from '../peer-recognition-dtos/entity/tag.entity';
import { TagStats } from '../peer-recognition-dtos/entity/tagstats.entity';
import { CreateRecDto } from '../peer-recognition-dtos/dto/create-rec.dto';
import {Report} from '../peer-recognition-dtos/entity/report.entity';
import { reverse } from 'node:dns';
import {Comment} from '../peer-recognition-dtos/entity/comment.entity';
import {Reaction} from '../peer-recognition-dtos/entity/reaction.entity';
import { text } from 'express';
import { ReactType } from '../peer-recognition-dtos/enum/reacttype.enum'



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


    async findCompRec(id: number): Promise<Recognition[]>{
     return await this.recognitionsRepository.find({where:{companyCompanyId:id}});
    }

    async findAll(): Promise<Recognition[]>{
        return await this.recognitionsRepository.find({relations: ['empFrom', 'empTo', 'tags']});
    }
    async createRec(recognition: Recognition): Promise<Recognition> {
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

    async deleteRec(id: number, companyId: number, empId: number): Promise<DeleteResult> {
        
        let rec = await this.recognitionsRepository.findOne({ relations: ["empFrom", "empTo", "company", "tags"], where: { recId: id } });
        if(rec.company.companyId !== companyId){
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
}
