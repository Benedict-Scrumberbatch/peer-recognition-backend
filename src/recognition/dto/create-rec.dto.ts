import { Company } from "src/entity/company.entity";
import { Users } from "src/entity/users.entity";

export class CreateRecDto{
    readonly recognitionID: number;
    readonly company: Company;
    readonly post_time: Date;
    readonly employeeFrom: Users;
    readonly employeeTo: Users;
    readonly msg: string;
}