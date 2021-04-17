import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../dtos/enum/role.enum';
import { ROLES_KEY } from './roles.decorator';

/**
 * Roles guard is responsible for verifying if a user should be allowed to access the endpoint.
 * 
 * @example```
  import { Roles } from '../roles/roles.decorator';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { UsersService } from './users.service';
  import { Role } from '../roles/role.enum';
  import { RolesGuard } from '../roles/roles.guard';
  @Controller('users')
  export class UsersController {
      constructor (private usersService: UsersService) {}
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin, Role.Employee)
      @Get('profile')
      getProfile(@Request() req) {
          return this.usersService.getProfile(req.user.employeeId, req.user.companyId);
      }
  }```
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor (private reflector: Reflector) {}

    /**
     * This method verifies the user role.
     * @param context This parameter is passed automatically by nest.
     * @returns True if user role matches the restriction, false otherwise.
     */
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(), 
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.role === role);
    }
}