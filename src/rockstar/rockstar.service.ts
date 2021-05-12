import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DeleteResult, getConnection, Repository, Transaction, getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../common/entity/recognition.entity';
import { Company } from '../common/entity/company.entity';
import { Users } from '../common/entity/users.entity';
import { Tag } from '../common/entity/tag.entity';
import { TagStats } from '../common/entity/tagstats.entity';
import { CreateRecDto } from '../common/dto/create-rec.dto';
import {Report} from '../common/entity/report.entity';
import { reverse } from 'node:dns';
import { Rockstar } from '../common/entity/rockstar.entity';
import { RockstarStats} from '../common/entity/rockstarstats.entity';
import { ReturnRockstarDto} from '../common/dto/rockstar-stats.dto';




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
        let recogs: Recognition[] = [];
        if (retQuery.length > 0) {
            rockstarUser = await this.usersRepository.findOne( {where: { employeeId : retQuery[0].empid}});
            recogs = await   this.recognitionRepository.createQueryBuilder('rec')
            .leftJoinAndSelect('rec.empTo', 'empTo').leftJoinAndSelect('rec.empFrom', 'empFrom')
            .leftJoinAndSelect('rec.tags', 'tags').leftJoinAndSelect('rec.reactions', 'reactions')
            .leftJoinAndSelect('rec.comments', 'comments').leftJoinAndSelect('reactions.employeeFrom', 'reactFrom')
            .leftJoinAndSelect('comments.employeeFrom', 'commentFrom')
            .leftJoinAndSelect('comments.reactions', 'commentReactions').leftJoinAndSelect('commentReactions.employeeFrom', 'commentReactionsFrom')
            .where("rec.empToCompanyId = :compID", {compID : rockstarUser.companyId}).andWhere("rec.empToEmployeeId = :empID", {empID: rockstarUser.employeeId})
            .andWhere("extract(Month from rec.createdAt) = :prvMonth",{prvMonth:month}).andWhere("extract(Year from rec.createdAt) = :yr",{yr:year}).
            getMany();
        }

        //gets recognitions for this emloyee

        let tagStatsList: RockstarStats[] = [];
        let tags: Tag[] = [];
        
        //loops through each recognition, tallying the tags they have
        for (let i = 0; i < recogs.length; i++)
        {
            const rec = recogs[i];
            for (let j = 0; j < rec.tags.length; j++) 
            {
                let tag = rec.tags[j]
                const tagSet = tags.findIndex(aTag => aTag.tagId === tag.tagId)
                    
                
                    if (tagSet === -1)
                    {
                        tags.push(tag)
                        let currStat = new RockstarStats();
                        currStat.countReceived = 1;
                        currStat.tag = tag;
                        currStat.month = month;
                        currStat.year = year;
                        tagStatsList.push(currStat);
                    }
                    else 
                    {
                        tagStatsList[tagSet].countReceived = tagStatsList[tagSet].countReceived + 1;
                    }
            }

        }

      
        //checks if the rockstar is saved already
        let savedRockstar = await this.rockstarRepo.findOne({where: { compID: companyId, month: month, year:year}, relations:['rockstar', 'recognitions', 'stats', 'recognitions.empFrom', 'recognitions.empTo', 'recognitions.tags', 'recognitions.comments', 'recognitions.comments.employeeFrom', 'recognitions.reactions', 'recognitions.reactions.employeeFrom', 'recognitions.comments.reactions', 'recognitions.comments.reactions.employeeFrom']});

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
            savedRockstar = await this.rockstarRepo.findOne({where: { compID: companyId, month: month, year:year}, relations:['rockstar', 'recognitions', 'stats', 'recognitions.empFrom', 'recognitions.empTo', 'recognitions.tags', 'recognitions.comments', 'recognitions.comments.employeeFrom', 'recognitions.reactions', 'recognitions.reactions.employeeFrom', 'recognitions.comments.reactions', 'recognitions.comments.reactions.employeeFrom']});
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