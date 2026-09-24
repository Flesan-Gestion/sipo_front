import { defineStore } from "pinia";
import { ToastBodyInterface } from "../shared/interfaces/toast-message.interface";

export interface ToastState {
    body: ToastBodyInterface | null
}

export const useToastStore = defineStore('toast', {
    state: () => (
        {
            body: null
        } as ToastState
    ),
    actions: {
        show(body: ToastBodyInterface) {
            this.body = body;
        }
    }
})
