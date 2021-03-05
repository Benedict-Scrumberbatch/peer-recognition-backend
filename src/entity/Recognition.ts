import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Company } from "./Company";
import { Users } from "./Users";
import { Tag } from "./Tag";

@Entity({name: "recognition", synchronize: false})
export class Recognition {
    @PrimaryGeneratedColumn()
    recId: number;

    @ManyToOne(()=> Company, company=>company.tags)
    company: Company;

    @Column("timestamp")
    postDate: Date;

    @ManyToOne(()=> Users, users=>users.recsSent)
    @JoinColumn()
    empFrom: Users;

    @ManyToOne(()=> Users, users=>users.recsReceived)
    @JoinColumn()
    empTo: Users;
}