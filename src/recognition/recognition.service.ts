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
        await this.recognitionsRepository.update(id, {deletedBy: deletor});

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
            const currTag = await this.tagRepository.findOne({ where: { tagId: recDto.tags[i] } });
            if (currTag != undefined) {

                //Employee from tag stats
                let findFrom = await this.tagStatsRepo.createQueryBuilder()
                        .where('"employeeCompanyId" = :comp', {comp: recDto.company.companyId})
                        .andWhere('"employeeEmployeeId" = :emp', { emp: recDto.empFrom.employeeId })
                        .andWhere('"tagTagId" = :tag', {tag: recDto.tags[i]})
                        .getOne();
                if (findFrom != undefined) {
                    await this.tagStatsRepo.createQueryBuilder()
                        .update()
                        .set({
                            countSent: () => `"countSent" ${sign} 1`,
                        })
                        .where("employeeCompanyId = :comp", {comp: recDto.company.companyId})
                        .andWhere("employeeEmployeeId = :emp", { emp: recDto.empFrom.employeeId })
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
                        .where('"employeeCompanyId" = :comp', {comp: recDto.company.companyId})
                        .andWhere('"employeeEmployeeId" = :emp', { emp: recDto.empTo.employeeId })
                        .andWhere('"tagTagId" = :tag', {tag: recDto.tags[i]})
                        .getOne();
                if (findTo != undefined) {
                    let res = await this.tagStatsRepo.createQueryBuilder()
                        .update()
                        .set({
                            countReceived: () => `"countReceived" ${sign} 1`,
                        })
                        .where("employeeCompanyId = :comp", {comp: recDto.company.companyId})
                        .andWhere("employeeEmployeeId = :emp", { emp: recDto.empTo.employeeId })
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
