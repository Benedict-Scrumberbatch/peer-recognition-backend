export class CreateRecDto{
    readonly recognitionID: number;
    readonly company: number;
    readonly post_time: Date;
    readonly employeeFrom: number;
    readonly employeeTo: number;
    readonly msg: string;
    readonly tags: number[];
}