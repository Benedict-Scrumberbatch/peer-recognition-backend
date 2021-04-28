import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Brackets, DeleteResult, getConnection, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../dtos/entity/recognition.entity';
import { Company } from '../dtos/entity/company.entity';
import { Users } from '../dtos/entity/users.entity';
import { Tag } from '../dtos/entity/tag.entity';
import { TagStats } from '../dtos/entity/tagstats.entity';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
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
        private tagStatsRepo: Repository<TagStats>
    ){}

    async findCompRec(id: number): Promise<Recognition[]>{
     return await this.recognitionsRepository.find({relations: ['empFrom', 'empTo', 'tags'], where:{companyCompanyId:id}});
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
        await this.recognitionsRepository.update(id, {deletedBy: deletor});

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
        .where("user.companyId = :id", {id: comp_id})
        .andWhere(new Brackets(comp => {
            comp.andWhere(new Brackets(qb => {
                qb.where("empTo.firstName ilike :firstName_t", {firstName_t: '%' + firstName_t + '%'})
                .andWhere("empTo.lastName ilike :lastName_t", {lastName_t: '%' + lastName_t + '%'});
            }))

            .orWhere(new Brackets(qb => {
                qb.where("empFrom.firstName ilike :firstName_f", {firstName_f: '%' + firstName_f + '%'})
                .andWhere("empFrom.lastName ilike :lastName_f", {lastName_f: '%' + lastName_f + '%'});
            }))
            .orWhere(new Brackets(qb => {
                qb.where("empTo.employeeId = :empTo_id", {empTo_id: empTo_id})
                .andWhere("empFrom.employeeId = :empFrom_id", {empFrom_id: empFrom_id});
            }))
            
            .orWhere("empTo.lastName ilike :search", {search: '%' + search + '%'})
            .orWhere("empTo.firstName ilike :search", {search: '%' + search + '%'})
            .orWhere("empFrom.firstName ilike :search", {search: '%' + search + '%'})
            .orWhere("empFrom.lastName ilike :search", {search: '%' + search + '%'})

            .orWhere("msg like :msg", {msg: '%' + msg + '%'});
        }))
        return paginate<Recognition>(queryBuilder, options);
    }
}
