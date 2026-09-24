import { defineStore } from 'pinia';

export interface LoaderState {
    visible: boolean
    message: string | null
}

export const useLoaderStore = defineStore('loader', {
    state: () => (
        {
            visible: false,
            message: null
        } as LoaderState
    ),
    actions: {
        show(message: string | null = null) {
            this.visible = true;
            this.message = message;
        },
        hidden() {
            this.visible = false;
            this.message = null;
        }
    }
})
