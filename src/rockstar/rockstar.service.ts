import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DeleteResult, getConnection, Repository, Transaction, getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../dtos/entity/recognition.entity';
import { Company } from '../dtos/entity/company.entity';
import { Users } from '../dtos/entity/users.entity';
import { Tag } from '../dtos/entity/tag.entity';
import { TagStats } from '../dtos/entity/tagstats.entity';
import { CreateRecDto } from '../dtos/dto/create-rec.dto';
import {Report} from '../dtos/entity/report.entity';
import { reverse } from 'node:dns';
import { Rockstar } from '../dtos/entity/rockstar.entity';
import { RockstarStats} from '../dtos/entity/rockstarstats.entity';
import { ReturnRockstarDto} from '../dtos/dto/rockstar-stats.dto';




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
        private rockstarRepo: Repository<Rockstar>,
        @InjectRepository(RockstarStats)
        private rockstarStatsRepo: Repository<RockstarStats>
    ){} 
    
    /**
     * `GET` endpoint to get all user in company
     * 
     * Returns {@link Users}[ ]
     * @param companyId /companyID - number
     * @param month /numerical month 1-12
     * @param year /numerical year (2021)
     * @returns {@link ReturnRockstarDto} /object containing all the necessary info on the rockstar
     */

    async getRockstar( companyId: number, month: number, year: number): Promise<ReturnRockstarDto> {
       
         //gets a list of recognitions for the given month, year and company
        let queryString :string = `SELECT t1.empID, t1.numRecog FROM (select recognition."empToEmployeeId" as empID, count(recognition."empToEmployeeId") as numRecog from Recognition where recognition."empToCompanyId" = ${companyId} and extract(Month from recognition."createdAt") = ${ month } and extract(Year from recognition."createdAt") = ${ year } group by recognition."empToEmployeeId" ) t1 group by t1.empID, t1.numRecog order by t1.numrecog DESC;`

        let retQuery= await this.recognitionRepository.query(queryString);
        //takes the first employeeID in the list (sorted so highest number of recognitions is on top, and finds the employee in the DB)
        let rockstarUser: Users;
        let recogs = [];
        if (retQuery.length > 0) {
            rockstarUser = await this.usersRepository.findOne( {where: { employeeId : retQuery[0].empid}});
            recogs = await this.recognitionRepository.createQueryBuilder().select("*").innerJoin("recognition_tags_tag","test","test.recognitionRecId = Recognition.recId").where("Recognition.empToCompanyId = :compID", {compID : rockstarUser.companyId}).andWhere("Recognition.empToEmployeeId = :empID", {empID: rockstarUser.employeeId}).andWhere("extract(Month from Recognition.createdAt) = :prvMonth",{prvMonth:month}).andWhere("extract(Year from Recognition.createdAt) = :yr",{yr:year}).getRawMany();
        }

        //gets recognitions for this emloyee

        let tagStatsList: RockstarStats[] = [];
        let tags: number[] = [];
        
        //loops through each recognition, tallying the tags they have
        for (let i = 0; i < recogs.length; ++i)
        {
            let num = parseInt(recogs[i].tags);
            if (isNaN(num))
            {
                
            
                if (!tags.includes(recogs[i].tagTagId) )
                {
                    tags.push(recogs[i].tagTagId)
                    const currTag = await this.tagRepository.findOne({ where: { tagId: recogs[i].tagTagId } });
                    let currStat = new RockstarStats();
                    currStat.countReceived = 1;
                    currStat.tag = currTag;
                    currStat.month = month;
                    currStat.year = year;
                    tagStatsList.push(currStat);
                }
                else 
                {
                    let index = tags.indexOf(recogs[i].tagTagId);
                    tagStatsList[index].countReceived = tagStatsList[index].countReceived + 1;
                }
            }
        }

      
        //checks if the rockstar is saved already
        let savedRockstar = await this.rockstarRepo.findOne({where: { compID: companyId, month: month, year:year}, relations:['rockstar', 'recognitions', 'stats', 'recognitions.empFrom', 'recognitions.empTo', 'recognitions.tags']});

        //if not already there, saves it 
        if (!savedRockstar && rockstarUser)
        {
            //assembles the rockstar object
            let rockstar: Rockstar = new Rockstar();
            rockstar.month = month;
            rockstar.year = year;
            rockstar.recognitions = recogs;

            rockstar.rockstar = rockstarUser;
            rockstar.compID = rockstarUser.companyId;
            await this.rockstarRepo.save(rockstar);
            savedRockstar = await this.rockstarRepo.findOne({where: { compID: companyId, month: month, year:year}, relations:['rockstar', 'recognitions', 'stats', 'recognitions.empFrom', 'recognitions.empTo', 'recognitions.tags']});
        }

        //passes the rockstar's ID in the rockstar table to the tags 
        for (let i = 0; i< tagStatsList.length; ++i )
        {
            tagStatsList[i].rockstarID = savedRockstar.rockstarID;
        
        }
        //checks if each tag exists, if not writes them to the rockstar tag DB
        for (let i = 0; i < tagStatsList.length; i++)
        {
            if (await this.rockstarStatsRepo.findOne({where: { month: month, year:year, rockstarID: savedRockstar.rockstarID, tag:tagStatsList[i].tag}}) == undefined)
            {
                await this.rockstarStatsRepo.save(tagStatsList[i]);
            }
        }

        
        //assembles the DTO for return
        let returnVal: ReturnRockstarDto = new ReturnRockstarDto();
        returnVal.rockstar = savedRockstar;
        returnVal.rockstarStats = tagStatsList;
        return returnVal;

    }
}