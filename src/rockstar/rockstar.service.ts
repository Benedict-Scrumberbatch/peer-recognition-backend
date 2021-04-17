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
import { Rockstar } from 'src/dtos/entity/rockstar.entity';
import { exception } from 'node:console';



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

    async getRockstar( companyId: number, prevMonth: number, year: number): Promise<Rockstar> {
        //gets a list of recognitions for the given month and year
        let prevRockstar = await this.rockstarRepo.findOne({where:{year : year, month:prevMonth, compID:companyId}})
        if (prevRockstar.compID == companyId)
        {
            return prevRockstar;
        }

        let queryString :string = `SELECT t1.empID, t1.numRecog FROM (select recognition."empToEmployeeId" as empID, count(recognition."empToEmployeeId") as numRecog from Recognition where recognition."empToCompanyId" = ${companyId} and extract(Month from recognition."postDate") = ${ prevMonth } and extract(Year from recognition."postDate") = ${ year } group by recognition."empToEmployeeId" ) t1 group by t1.empID;`
        let retQuery= await this.recognitionRepository.query(queryString);
        if (retQuery.length < 1)
        {
            throw new exception("No recognitions found for that month");
        }
        else if (retQuery.length > 1)
        {
            throw new exception("Too many users returned");
        }

        let rawRockstar = retQuery;
        //creates the user object for that user, assigning in all the needed info

        //one function - done
        //use insert for rockstar
        //one transaction
        //calc rockstar on DB end - done
        let rockstarUser: Users = new Users();
        rockstarUser.company = rawRockstar.companyId;
        rockstarUser.employeeId = rawRockstar.employeeId;

        rockstarUser.firstName = rawRockstar.firstName;
        rockstarUser.lastName = rawRockstar.lastName;

        rockstarUser.isManager = rawRockstar.isManager;
        rockstarUser.positionTitle = rawRockstar.positionTitle;
        rockstarUser.startDate = new Date(rawRockstar.startDate);
        rockstarUser.role = rawRockstar.role;

        rockstarUser.manager = await this.usersRepository.findOne({where:{employeeId : rawRockstar.managerEmployeeId}})

        //gets recognitions for this rockstar
        let recogs = await this.recognitionRepository.createQueryBuilder().select("*").innerJoin("recognition_tags_tag","test","test.recognitionRecId = Recognition.recId").where("Recognition.empToCompanyId = :compID", {compID : rockstarUser.company}).andWhere("Recognition.empToEmployeeId = :empID", {empID: rockstarUser.employeeId}).andWhere("extract(Month from Recognition.postDate) = :prvMonth",{prvMonth:prevMonth}).andWhere("extract(Year from Recognition.postDate) = :yr",{yr:year}).getRawMany();
        let results = {};
        for (let i = 0; i < recogs.length; ++i)
        {
            if (!(recogs[i].tagTagID in results))
            {
                results[recogs[i].tagTagId]= 1;
            }
            else 
            {
                let numTag = results[recogs[i].tagTagId];
                results[recogs[i].tagTagId]= numTag + 1;
            }
        }

        let rockstar:Rockstar = new Rockstar();
        rockstar.month = prevMonth;
        rockstar.year = year;
        rockstar.stats = results;
        rockstar.recognitions = recogs;
        rockstar.rockstar = rockstarUser;
        rockstar.compID = rockstarUser.companyId;

        await this.rockstarRepo.create
        return rockstar;

        //calculate and return rockstar
        //recognition module
    }
}