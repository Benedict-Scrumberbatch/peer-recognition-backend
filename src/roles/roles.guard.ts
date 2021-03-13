import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';

/**
 * Roles guard is responsible for verifying if a user should be allowed to access the endpoint.
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor (private reflector: Reflector) {}

    /**
     * This method verifies the user role.
     * @param context Execution context
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