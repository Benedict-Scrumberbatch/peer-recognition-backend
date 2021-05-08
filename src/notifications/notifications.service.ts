import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../dtos/entity/users.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UserNotification } from '../dtos/entity/notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(UserNotification)
        private notificationRepository: Repository<UserNotification>,
    ){} 

    async findNotifications(empId: number, companyId: number): Promise<UserNotification[]>{
        const emp = new Users()
        emp.companyId = companyId
        emp.employeeId = empId
        return await this.notificationRepository.find({where: {employeeTo: emp  }, relations: ["employeeTo", "comment", "recognition", "report", "reaction", "rockstar"]});
    }

    async deleteNotification(id: number): Promise<DeleteResult> {        
        return await this.notificationRepository.softDelete({notificationID:id});
    }
}


