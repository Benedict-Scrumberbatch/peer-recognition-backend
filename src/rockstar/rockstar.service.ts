import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DeleteResult, getConnection, Repository, Transaction, getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Recognition } from '../peer-recognition-dtos/entity/recognition.entity';
import { Company } from '../peer-recognition-dtos/entity/company.entity';
import { Users } from '../peer-recognition-dtos/entity/users.entity';
import { Tag } from '../peer-recognition-dtos/entity/tag.entity';
import { TagStats } from '../peer-recognition-dtos/entity/tagstats.entity';
import { CreateRecDto } from '../peer-recognition-dtos/dto/create-rec.dto';
import {Report} from '../peer-recognition-dtos/entity/report.entity';
import { reverse } from 'node:dns';
import { Rockstar } from '../peer-recognition-dtos/entity/rockstar.entity';
import { RockstarStats} from '../peer-recognition-dtos/entity/rockstarstats.entity';
import { ReturnRockstarDto} from '../peer-recognition-dtos/dto/rockstar-stats.dto';




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

    async getRockstar( companyId: number, month: number, year: number): Promise<ReturnRockstarDto> {
        //gets a list of recognitions for the given month and year

        let queryString :string = `SELECT t1.empID, t1.numRecog FROM (select recognition."empToEmployeeId" as empID, count(recognition."empToEmployeeId") as numRecog from Recognition where recognition."empToCompanyId" = ${companyId} and extract(Month from recognition."postDate") = ${ month } and extract(Year from recognition."postDate") = ${ year } group by recognition."empToEmployeeId" ) t1 group by t1.empID, t1.numRecog order by t1.numrecog DESC;`
        let retQuery= await this.recognitionRepository.query(queryString);
        let rockstarUser = await this.usersRepository.findOne( {where: { employeeId : retQuery[0].empid}});
        //creates the user object for that user, assigning in all the needed info

        //one function - done
        //use insert for rockstar
        //one transaction
        //calc rockstar on DB end - done

        //gets recognitions for this rockstar
        let recogs = await this.recognitionRepository.createQueryBuilder().select("*").innerJoin("recognition_tags_tag","test","test.recognitionRecId = Recognition.recId").where("Recognition.empToCompanyId = :compID", {compID : rockstarUser.companyId}).andWhere("Recognition.empToEmployeeId = :empID", {empID: rockstarUser.employeeId}).andWhere("extract(Month from Recognition.postDate) = :prvMonth",{prvMonth:month}).andWhere("extract(Year from Recognition.postDate) = :yr",{yr:year}).getRawMany();

        let tagStatsList: RockstarStats[] = [];
        let tags: number[] = [];
        
        function checkValue (val1,val2)
        {
            return val1 == val2;
        }

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

        let rockstar: Rockstar = new Rockstar();
        rockstar.month = month;
        rockstar.year = year;

        rockstar.rockstar = rockstarUser;
        rockstar.compID = rockstarUser.companyId;

        let savedRockstar = await this.rockstarRepo.findOne({where: { compID:rockstar.compID, month: month, year:year}});
        console.log(savedRockstar);

        if (savedRockstar == undefined)
        {
             savedRockstar = await this.rockstarRepo.save(rockstar);
        }


        for (let i = 0; i< tagStatsList.length; ++i )
        {
            tagStatsList[i].rockstarID = savedRockstar.rockstarID;
        
        }
        for (let i = 0; i < tagStatsList.length; i++)
        {
            if (await this.rockstarStatsRepo.findOne({where: { month: month, year:year, rockstarID: savedRockstar.rockstarID, tag:tagStatsList[i].tag}}) == undefined)
            {
                await this.rockstarStatsRepo.save(tagStatsList[i]);
            }
        }

        
        
        let returnVal: ReturnRockstarDto = new ReturnRockstarDto();
        returnVal.rockstar = rockstar;
        returnVal.rockstarStats = tagStatsList;
        returnVal.isItADto = "yes";
        return returnVal;

        //calculate and return rockstar
        //recognition module
    }
}