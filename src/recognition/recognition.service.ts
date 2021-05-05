import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { NotificationsService } from '../notifications/notifications.service';
import { UserNotification } from '../dtos/entity/notification.entity';
import { NotificationType } from '../dtos/enum/notification-types';


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
        private reactRepo: Repository<Reaction>,
        @InjectRepository(UserNotification)
        private notificationRepository: Repository<UserNotification>,
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
        const savedRecognition = await this.recognitionsRepository.save(recognition);
        await this.changeUserStats(recognition, true);

        // notifications
        const empFromNotification = new UserNotification();
        empFromNotification.recognition = savedRecognition;
        empFromNotification.employeeTo = savedRecognition.empFrom;
        empFromNotification.notificationType = NotificationType.Recognition;
        empFromNotification.msg = `Your recognition of ${savedRecognition.empTo.firstName} ${savedRecognition.empTo.lastName} has been posted!`;

        const empToNotification = new UserNotification();
        empToNotification.recognition = savedRecognition;
        empToNotification.employeeTo = savedRecognition.empTo;
        empToNotification.notificationType = NotificationType.Recognition;
        empToNotification.msg = `You have been recognized by ${savedRecognition.empFrom.firstName} ${savedRecognition.empFrom.lastName}!`

        const empToManagerNotification = new UserNotification();
        empToManagerNotification.recognition = savedRecognition;
        empToManagerNotification.employeeTo = savedRecognition.empTo.manager;
        empToManagerNotification.notificationType = NotificationType.Recognition;
        empToManagerNotification.msg = `Your employee ${savedRecognition.empTo.firstName} ${savedRecognition.empTo.lastName} has been recognized by ${savedRecognition.empFrom.firstName} ${savedRecognition.empFrom.lastName}!`
        await this.notificationRepository.save([empFromNotification, empToNotification, empToManagerNotification])

        return savedRecognition;
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
    async reportRec(rec_id: number, reporter: Users, report: Report)
    {
        let recog = await this.recognitionsRepository.findOne( {  where: { recId: rec_id }} );

        report.employeeFrom = reporter;
        report.recognition = recog;
        const savedReport =  await this.reportRepo.save(report);

        const empFromNotification = new UserNotification();
        empFromNotification.report = savedReport;
        empFromNotification.employeeTo = savedReport.employeeFrom;
        empFromNotification.notificationType = NotificationType.Report;
        empFromNotification.msg = `Your report of ${recog.empFrom.firstName} ${recog.empFrom.lastName}'s recogniton of ${recog.empTo.firstName} ${recog.empTo.lastName} has been recieved.`;

        const admins = await this.userRepository.find({companyId: reporter.companyId, role: Role.Admin})
        const adminNotifications = admins.map(admin => {
            const adminNotif = new UserNotification();
            adminNotif.report = savedReport;
            adminNotif.employeeTo = admin;
            adminNotif.notificationType = NotificationType.Report;
            adminNotif.msg = `${savedReport.employeeFrom.firstName} ${savedReport.employeeFrom.lastName} has reported recognition ${savedReport.recognition.recId}.`;
            return adminNotif
        })
        await this.notificationRepository.save([...adminNotifications, empFromNotification])

        return savedReport;
    }

    async reportComment(comment_id: number, reporter: Users, report: Report)
    {
        let comment = await this.commentRepo.findOne( {  where: { commentID: comment_id }} );

        report.employeeFrom = reporter;
        report.comment = comment;
        const savedReport = await this.reportRepo.save(report);

        const empFromNotification = new UserNotification();
        empFromNotification.report = savedReport;
        empFromNotification.employeeTo = savedReport.employeeFrom;
        empFromNotification.notificationType = NotificationType.Report;
        empFromNotification.msg = `Your report of ${comment.employeeFrom.firstName} ${comment.employeeFrom.lastName}'s comment has been recieved.`;

        const admins = await this.userRepository.find({companyId: reporter.companyId, role: Role.Admin})
        const adminNotifications = admins.map(admin => {
            const adminNotif = new UserNotification();
            adminNotif.report = savedReport;
            adminNotif.employeeTo = admin;
            adminNotif.notificationType = NotificationType.Report;
            adminNotif.msg = `${savedReport.employeeFrom.firstName} ${savedReport.employeeFrom.lastName} has reported comment ${savedReport.comment.commentID}.`;
            return adminNotif
        })
        await this.notificationRepository.save([...adminNotifications, empFromNotification])
        return savedReport;
    }

    /**
     * Create a {@link Comment} for a {@link Recognition} and writes it to the DB
     * @param rec_id ID of the recognition to be reported
     * @param text the string of what the user wrote 
     * @param user the {@link Users} who is making the comment
     * @returns {@link Comment} the comment entity
     */
    async addComment(rec_id: number, newComment: Comment, user: Users)
    {
     
        newComment.employeeFrom = user;
        let recognition = await this.recognitionsRepository.findOne( {  where: { recId: rec_id }} );
        newComment.recognition = recognition;
        if (newComment.recognition == undefined) {
            throw new NotFoundException('no recognition with that ID was found');
        }
        const savedComment = await this.commentRepo.save(newComment);
        
        const empFromNotification = new UserNotification();
        empFromNotification.comment = savedComment;
        empFromNotification.employeeTo = savedComment.employeeFrom;
        empFromNotification.notificationType = NotificationType.Comment;
        empFromNotification.msg = `Your comment on ${recognition.empTo.firstName} ${recognition.empTo.lastName}'s recognition has been posted.`;

        const empToNotification = new UserNotification();
        empToNotification.comment = savedComment;
        empToNotification.employeeTo = recognition.empTo;
        empToNotification.notificationType = NotificationType.Comment;
        empToNotification.msg = `${savedComment.employeeFrom.firstName} ${savedComment.employeeFrom.lastName} has commented on your recognition.`;
    
        const empRecFromNotification = new UserNotification();
        empRecFromNotification.comment = savedComment;
        empRecFromNotification.employeeTo = recognition.empFrom;
        empRecFromNotification.notificationType = NotificationType.Comment;
        empRecFromNotification.msg = `${savedComment.employeeFrom.firstName} ${savedComment.employeeFrom.lastName} has commented on your recognition.`;

        await this.notificationRepository.save([empToNotification, empRecFromNotification, empFromNotification])

        return savedComment;

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
        newReaction.employeeFrom = user;
        newReaction.reactType = type;
        
        let recog = await this.recognitionsRepository.findOne( {  where: { recId: rec_id }} );
        newReaction.recognition = recog;
        const savedReaction = await this.reactRepo.save(newReaction);

        const empToNotification = new UserNotification();
        empToNotification.reaction = savedReaction;
        empToNotification.employeeTo = recog.empTo;
        empToNotification.notificationType = NotificationType.Reaction;
        empToNotification.msg = `${savedReaction.employeeFrom.firstName} ${savedReaction.employeeFrom.lastName} has reacted on your recognition.`;
    
        const empRecFromNotification = new UserNotification();
        empRecFromNotification.reaction = savedReaction;
        empRecFromNotification.employeeTo = recog.empFrom;
        empRecFromNotification.notificationType = NotificationType.Comment;
        empRecFromNotification.msg = `${savedReaction.employeeFrom.firstName} ${savedReaction.employeeFrom.lastName} has reacted on your recognition.`;

        return savedReaction;
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
