export class CreateRecDto{
    readonly company: number;
    readonly employeeFrom: number;
    readonly employeeTo: number;
    readonly msg: string;
    readonly tags: number[];
}