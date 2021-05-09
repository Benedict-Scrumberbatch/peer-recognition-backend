import { Controller, Get, UseGuards, Request, Delete, Param } from '@nestjs/common';
import { UserNotification } from '../dtos/entity/notification.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { DeleteResult } from 'typeorm';

@Controller('notifications')
export class NotificationsController {
    constructor(private notificationService: NotificationsService){}
    /**
     * Returns a list of all recognitions in the database for the current user's company
     * @returns an array of {@link Recognition} objects
     */
    @UseGuards(JwtAuthGuard)
    @Get('all')
    findAll(@Request() req): Promise<UserNotification[]>{
        return this.notificationService.findNotifications(req.user.employeeId, req.user.companyId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id): Promise<DeleteResult>{
        return this.notificationService.deleteNotification(id);
    }

}
