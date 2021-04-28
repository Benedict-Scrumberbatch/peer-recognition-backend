import {RockstarService} from './rockstar.service';
import {Recognition} from '../peer-recognition-dtos/entity/recognition.entity';
import {Report} from '../peer-recognition-dtos/entity/report.entity';
import {Users} from '../peer-recognition-dtos/entity/users.entity';
import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from '../peer-recognition-dtos/enum/role.enum';
import { Rockstar } from '../peer-recognition-dtos/entity/rockstar.entity';
import { ReturnRockstarDto } from '../peer-recognition-dtos/dto/rockstar-stats.dto';

@Controller('rockstar')
export class RockstarController {
    constructor(private rockstarService: RockstarService){}

    //endpoints here
    /**
     * Returns a rockstar entity object
     * @param req 
     * @returns {@link rockstar}
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    async getRockstar(@Request() req) {
        let date: Date = new Date();
        let prevMonth: number = -1;
        let year = date.getFullYear()
        if (date.getMonth() == 0)
        {
            prevMonth = 12;
            year = date.getFullYear() - 1;
        }
        else
        {
            //SQL takes 1 based months but the date object has 0 based months.
            prevMonth = date.getMonth();
        }
        //gets the rockstar user object
        let returnVal = await this.rockstarService.getRockstar(req.user.companyId, prevMonth, year);
       
        return returnVal;
    }
}