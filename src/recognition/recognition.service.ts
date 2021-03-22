import { Injectable } from '@nestjs/common';
import { DeleteResult, getConnection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../entity/recognition.entity';
import { Company } from '../entity/company.entity';
import { Users } from '../entity/users.entity';
import { Tag } from '../entity/tag.entity';
import { TagStats } from '../entity/tagstats.entity';
import { CreateRecDto } from './dto/create-rec.dto';
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
        rec.empFrom = await this.userRepository.findOne({where:{employeeId: recDto.employeeFrom}});
        rec.empTo = await this.userRepository.findOne({where:{employeeId: recDto.employeeTo}});
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
                let test = await this.tagStatsRepo.findOne({ where: { employee: userFrom, tag: currTag} })
                if (test != undefined) {
                    await this.tagStatsRepo.createQueryBuilder()
                        .update()
                        .set({
                            countSent: () => `"countSent" ${sign} 1`,
                        })
                        .where("employeeEmployeeId = :emp", { emp: recDto.employeeFrom })
                        .andWhere("employeeCompanyId = :comp", {comp: recDto.company})
                        .andWhere("tagTagId = :tag", {tag: recDto.tags[i]})
                        .execute();
                }
                else {
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
                let comp = await this.tagStatsRepo.findOne({relations: ["employee", "tag"], where: {tagstatId: 40}})
                let test2 = await this.tagStatsRepo.findOne({ where: { employee: userTo, tag: currTag} })
                if (test2 != undefined) {
                    let res = await this.tagStatsRepo.createQueryBuilder()
                        .update()
                        .set({
                            countReceived: () => `"countReceived" ${sign} 1`,
                        })
                        .where("employeeEmployeeId = :emp", { emp: recDto.employeeTo })
                        .andWhere("employeeCompanyId = :comp", {comp: recDto.company})
                        .andWhere("tagTagId = :tag", {tag: recDto.tags[i]})
                        .execute();
                }
                else {
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
