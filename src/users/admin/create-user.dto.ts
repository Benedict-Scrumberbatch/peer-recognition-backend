export class CreateUserDto {
    readonly userId: number;
    readonly companyId: number;

    readonly username: string;
    readonly password: string;
    
    readonly firstName: string;
    readonly lastName: string;

    readonly isManager: boolean;
    readonly positionTitle: string;
    readonly startDate: Date

}