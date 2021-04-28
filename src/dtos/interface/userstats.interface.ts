import { TagStats } from '../entity/tagstats.entity';

export interface UserStats {
    numRecsReceived: number,
    numRecsSent: number,
    tagStats: TagStats[]
}