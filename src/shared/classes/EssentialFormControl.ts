import { FormRules } from "../constants/form-rules";
import { FormRuleInterface, FormTypeRuleEnum } from "../interfaces/form-rule.interface";

export class EssentialFormControl {

    existError: boolean = false;
    error: FormRuleInterface | null = null;
    doValidate: boolean = true;
    visible: boolean = true;
    value: any;
    defaultValue: any;
    rules: FormTypeRuleEnum[];

    constructor(value: any, rules: FormTypeRuleEnum[] = []) {
        this.value = value;
        this.defaultValue = value;
        this.rules = rules;
    }

    // False = Error
    // True = Todo OK
    validate() {
        if (this.doValidate && this.visible) {
            for (const ruleName of this.rules) {
                const rule = FormRules.find(fr => fr.name == ruleName);

                if (rule && (!rule?.regex.test(this.value) || this.value === null)) {
                    this.existError = true;
                    this.error = rule;
                    return false;
                }
            }
        }

        this.doValidate = true;
        this.existError = false;
        this.error = null;
        return true;
    }

    // Obtiene la clase invalid para los elementos del form
    getClass() {
        return this.existError ? 'p-invalid' : '';
    }

    // Limpia el control individualmente
    clear() {
        this.value = null;
    }

    // Limpia el control pero para la limpieza general del formulario
    clearInAllForm() {
        this.doValidate = false;
        this.value = null;
        setTimeout(() => {
            this.existError = false;
            this.error = null;
            this.doValidate = true;
        }, 1)
    }

    // Agrega una regla al control
    addRule(rule: FormTypeRuleEnum) {
        this.rules = [...this.rules, rule];
    }

    // Elimina una regla al control
    deleteRule(rule: FormTypeRuleEnum) {
        this.rules = this.rules.filter(r => r != rule);
    }

    // Muestra al control
    show() {
        this.visible = true;
    }

    // Oculta al control
    hidden() {
        this.clear();
        this.visible = false;
    }

}