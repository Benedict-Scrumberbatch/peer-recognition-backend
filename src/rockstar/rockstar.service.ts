import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DeleteResult, getConnection, Repository, Transaction, getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../../peer-recognition-dtos/entity/recognition.entity';
import { Company } from '../../peer-recognition-dtos/entity/company.entity';
import { Users } from '../../peer-recognition-dtos/entity/users.entity';
import { Tag } from '../../peer-recognition-dtos/entity/tag.entity';
import { TagStats } from '../../peer-recognition-dtos/entity/tagstats.entity';
import { CreateRecDto } from '../../peer-recognition-dtos/dto/create-rec.dto';
import {Report} from '../../peer-recognition-dtos/entity/report.entity';
import { reverse } from 'node:dns';
import { Rockstar } from '../../peer-recognition-dtos/entity/rockstar.entity';



@Injectable()
export class RockstarService {
    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>, 
        @InjectRepository(Recognition)
        private recognitionRepository: Repository<Recognition>,
        @InjectRepository(TagStats)
        private tagStatsRepo: Repository<TagStats>,
        @InjectRepository(Report)
        private reportRepo: Repository<Report>,
        @InjectRepository(Rockstar)
        private rockstarRepo: Repository<Rockstar>
    ){} 

    async getRockstar( companyId: number, month: number, year: number): Promise<Rockstar> {
        //gets a list of recognitions for the given month and year
        let prevRockstar = await this.rockstarRepo.findOne({where:{year : year, month : month, compID:companyId}});
        if (prevRockstar != null)
        {
            return prevRockstar;
        }

        let queryString :string = `SELECT t1.empID, t1.numRecog FROM (select recognition."empToEmployeeId" as empID, count(recognition."empToEmployeeId") as numRecog from Recognition where recognition."empToCompanyId" = ${companyId} and extract(Month from recognition."postDate") = ${ month } and extract(Year from recognition."postDate") = ${ year } group by recognition."empToEmployeeId" ) t1 group by t1.empID, t1.numRecog order by t1.numrecog DESC;`
        let retQuery= await this.recognitionRepository.query(queryString);
        let rockstarUser = await this.usersRepository.findOne( {where: { employeeId : retQuery[0].empid}});
        let rawRockstar = retQuery;
        //creates the user object for that user, assigning in all the needed info

        //one function - done
        //use insert for rockstar
        //one transaction
        //calc rockstar on DB end - done

        //gets recognitions for this rockstar
        let recogs = await this.recognitionRepository.createQueryBuilder().select("*").innerJoin("recognition_tags_tag","test","test.recognitionRecId = Recognition.recId").where("Recognition.empToCompanyId = :compID", {compID : rockstarUser.companyId}).andWhere("Recognition.empToEmployeeId = :empID", {empID: rockstarUser.employeeId}).andWhere("extract(Month from Recognition.postDate) = :prvMonth",{prvMonth:month}).andWhere("extract(Year from Recognition.postDate) = :yr",{yr:year}).getRawMany();
        let results = {};
        let tagStatsList: TagStats[] = [];
        for (let i = 0; i < recogs.length; ++i)
        {
            if (!(recogs[i].tagTagID in results))
            {
                results[recogs[i].tagTagId]= 1;
                const currTag = await this.tagRepository.findOne({ where: { tagId: recogs[i].tagTagId } });
                let currStat = new TagStats();
                currStat.countReceived = 1;
                currStat.countSent = 0;
                currStat.employee = new Users();
                currStat.tag = currTag;
                currStat.tagstatId = recogs[i].tagTagId;

            }
            else 
            {

                tagStatsList.find(a => a.tagstatId = recogs[i].tagTagID).countReceived += 1;
            }
        }

        let rockstar:Rockstar = new Rockstar();
        rockstar.month = month;
        rockstar.year = year;
        rockstar.stats = tagStatsList;
        rockstar.recognitions = recogs;
        rockstar.rockstar = rockstarUser;
        rockstar.compID = rockstarUser.companyId;

        await this.rockstarRepo.save(rockstar);
        return rockstar;

        //calculate and return rockstar
        //recognition module
    }
}