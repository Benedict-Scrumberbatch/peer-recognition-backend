import { Injectable } from '@nestjs/common';
import { DeleteResult, getConnection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../dtos/entity/recognition.entity';
import { Company } from '../dtos/entity/company.entity';
import { Users } from '../dtos/entity/users.entity';
import { Tag } from '../dtos/entity/tag.entity';
import { TagStats } from '../dtos/entity/tagstats.entity';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import { reverse } from 'node:dns';


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

    
    async findAll(): Promise<Recognition[]>{
        return this.recognitionsRepository.find();
     }

    async createRec(recDto: CreateRecDto): Promise<Recognition> {
        const rec = new Recognition();
        rec.msg = recDto.msg;
        rec.postDate = new Date();
        rec.company = await this.companyRepository.findOne({where:{companyId: recDto.company}});
        rec.empFrom = await this.userRepository.findOne({where:{employeeId: recDto.employeeFrom, companyId: recDto.company}});
        rec.empTo = await this.userRepository.findOne({where:{employeeId: recDto.employeeTo, companyId: recDto.company}});
        rec.tags = [];
        if(recDto.tags != undefined){
            for(let i = 0; i < recDto.tags.length;i++){
                const tag = await this.tagRepository.findOne({ where: { tagId: recDto.tags[i] } });
                if(tag != undefined){
                    rec.tags.push(tag);
                }
            }
        }
        await this.recognitionsRepository.save(rec);

        await this.changeUserStats(recDto, true)

        return rec
     }

    async deleteRec(id: number): Promise<DeleteResult> {
        let rec = await this.recognitionsRepository.findOne({ relations: ["empFrom", "empTo", "company", "tags"], where: { recId: id } });
        
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

        return await this.recognitionsRepository.delete({recId:id});
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
}
