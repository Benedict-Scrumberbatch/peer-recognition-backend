import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn} from 'typeorm';
import { Users } from './users.entity';
import { Recognition } from './recognition.entity';
import { ReactType} from '../enum/reacttype.enum';

@Entity({name: "reaction"})
@Index(["employeeFrom","recognition","reactType"], {unique: true})
export class Reaction {
    @PrimaryGeneratedColumn('increment')
    reactionID: number;
    
    @ManyToOne(() => Users)
    @JoinColumn()
    employeeFrom: Users;

    @ManyToOne(() => Recognition, Recognition => Recognition.reactions)
    recognition: Recognition ;

    @Column("timestamp")
    reactDate: Date;

    @Column({ 
        type: "enum", 
        enum: ReactType, 
        default: ReactType.Like})
    reactType: ReactType;

}