import { Rockstar } from "src/dtos/entity/rockstar.entity";
import { RockstarStats } from "src/dtos/entity/rockstarstats.entity";
import { Users } from "src/dtos/entity/users.entity";

export class ReturnRockstarDto{
    rockstar: Rockstar;
    rockstarStats: RockstarStats[];
    isItADto: string
}