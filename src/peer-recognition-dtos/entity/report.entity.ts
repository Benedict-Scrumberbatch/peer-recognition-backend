import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn,  Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Users } from './users.entity';
import { Recognition } from './recognition.entity';

@Entity({name: "report"})
@Index(["employeeFrom","recognition","ReportDate"], {unique: true})
export class Report {
    @PrimaryGeneratedColumn('increment')
    reportID: number;
    
    @ManyToOne(() => Users)
    @JoinColumn()
    employeeFrom: Users;

    @ManyToOne(() => Recognition, Recognition => Recognition.reports)
    recognition: Recognition ;

    @Column("timestamp")
    ReportDate: Date

    @CreateDateColumn({ type: 'timestamp' })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt?: Date;

}