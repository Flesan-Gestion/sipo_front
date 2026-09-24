import { defineStore } from "pinia";

export interface ConfirmationState {
    visible?: boolean
    header?: string
    labelAccept?: string
    labelReject?: string
    message: string
    accept: Function
    reject: Function
}

export const useConfirmationStore = defineStore('confirmation', {
    state: () => (
        {
            visible: false,
            header: '¿Estás seguro?',
            labelAccept: 'Sí, estoy seguro',
            labelReject: 'No, no estoy seguro',
            message: '',
            accept: () => { },
            reject: () => { }
        } as ConfirmationState
    ),
    actions: {
        show(config: ConfirmationState) {
            this.visible = true;
            this.header = config.header ? config.header : '¿Estás seguro?';
            this.message = config.message;
            this.labelAccept = config.labelAccept ? config.labelAccept : 'Sí, estoy seguro';
            this.labelReject = config.labelReject ? config.labelReject : 'No, no estoy seguro';
            this.accept = config.accept;
            this.reject = config.reject;
        },
        hidden() {
            this.visible = false;
            this.header = '¿Estás seguro?';
            this.labelAccept = 'Sí, estoy seguro';
            this.labelReject = 'No, no estoy seguro';
            this.message = '';
            this.accept = () => { };
            this.reject = () => { };
        }
    }
});