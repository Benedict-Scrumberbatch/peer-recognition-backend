import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DeleteResult, getConnection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../dtos/entity/recognition.entity';
import { Company } from '../dtos/entity/company.entity';
import { Users } from '../dtos/entity/users.entity';
import { Tag } from '../dtos/entity/tag.entity';
import { TagStats } from '../dtos/entity/tagstats.entity';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import { Role } from '../dtos/enum/role.enum';


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
        private tagStatsRepo: Repository<TagStats>
    ){}
    /**
     * Finds the recognitions for given {@link Company}
     * @param id companyId number
     * @returns an array of {@link Recognition} objects
     */
    async findCompRec(id: number): Promise<Recognition[]>{
     return await this.recognitionsRepository.find({relations: ['empFrom', 'empTo', 'tags'], where:{companyCompanyId:id}});
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
        await this.recognitionsRepository.update(id, {deletedBy: deletor});

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
}
