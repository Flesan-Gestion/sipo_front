import { FormRuleInterface, FormTypeRuleEnum } from "../interfaces/form-rule.interface";


export const FormRules: FormRuleInterface[] = [
    {
        name: FormTypeRuleEnum.REQUIRED,
        message: 'Este campo es requerido',
        regex: /^[^ ](.|\n)*$/
    },
    {
        name: FormTypeRuleEnum.EMAIL,
        message: 'Este correo no es válido',
        regex: /^[a-zA-Z0-9\._-]+@[a-zA-Z0-9\._-]+(\.[a-zA-Z]{2,10})+$/
    },
    {
        name: FormTypeRuleEnum.ONLY_LETTERS,
        message: 'Este campo solo acepta letras',
        regex: /^[a-zA-Z ÁÉÍÓÚáéíóú]+$/
    },
    {
        name: FormTypeRuleEnum.ONLY_NUMBERS,
        message: 'Este campo solo acepta números',
        regex: /^[0-9]+$/
    },
]