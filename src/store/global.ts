import { defineStore } from 'pinia';
import { Utilities } from '../shared/classes/Utilities';
import { ToastGroupEnum, ToastSeverityMessageEnum, ToastTypeMessageEnum } from '../shared/interfaces/toast-message.interface';
import { EssentialForm } from '../shared/classes/EssentialForm';
import { FormTypeRuleEnum } from '../shared/interfaces/form-rule.interface';
import { EssentialFormControl } from '../shared/classes/EssentialFormControl';
import { AssetFileEnum } from '../shared/interfaces/assets.interface';
import { ModalConfig } from '../shared/constants/modal-config';
import { StatusCodes } from 'http-status-codes';
import { RolesEnum } from '../shared/enums/roles.enum';


export const useGlobalStore = defineStore('global', {
    state: () => (
        {
            utl: Utilities,
            tstType: ToastTypeMessageEnum,
            tstSeverity: ToastSeverityMessageEnum,
            tstGroup: ToastGroupEnum,
            sstRule: FormTypeRuleEnum,
            assets: AssetFileEnum,
            statusCodes: StatusCodes,
            env: import.meta.env,
            modalConfig: ModalConfig,
            roles: RolesEnum
        }
    ),
    actions: {
        sstForm(controls: any) {
            return new EssentialForm(controls);
        },
        sstFormControl(value: any, rules: FormTypeRuleEnum[] = []) {
            return new EssentialFormControl(value, rules);
        }
    }
})
