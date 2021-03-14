import { Company } from "src/entity/company.entity";
import { Recognition } from "src/entity/recognition.entity";
import { Users } from "src/entity/users.entity";

export class CreateUserDto {
    readonly company: Company;

    readonly employeeId: number;
    readonly companyId: number;
    
    readonly firstName: string;
    readonly lastName: string;

    readonly isManager: boolean;
    readonly positionTitle: string;
    readonly startDate: Date

    readonly manager: Users

}