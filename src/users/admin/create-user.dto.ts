export class CreateUserDto {

    readonly companyId: number;
    
    readonly firstName: string;
    readonly lastName: string;

    readonly isManager: boolean;
    readonly positionTitle: string;

    readonly manager: number;

    readonly pswd: string;
}