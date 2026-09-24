
export interface FormRuleInterface {
    name: FormTypeRuleEnum
    message: string
    regex: RegExp
}

export enum FormTypeRuleEnum {
    REQUIRED = 'REQUIRED',
    EMAIL = 'EMAIL',
    ONLY_LETTERS = 'ONLY_LETTERS',
    ONLY_NUMBERS = 'ONLY_NUMBERS'
}
