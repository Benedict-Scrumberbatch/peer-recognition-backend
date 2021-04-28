import { Rockstar } from "src/peer-recognition-dtos/entity/rockstar.entity";
import { RockstarStats } from "src/peer-recognition-dtos/entity/rockstarstats.entity";
import { Users } from "src/peer-recognition-dtos/entity/users.entity";

export class ReturnRockstarDto{
    rockstar: Rockstar;
    rockstarStats: RockstarStats[];
    isItADto: string
}