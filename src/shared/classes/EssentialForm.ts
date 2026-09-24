import { watchEffect } from 'vue';

export class EssentialForm {

    controls: any;

    constructor(controls: any) {
        this.controls = controls; // Un arreglo de EssentialFormControl
    }

    //Aplica los watchers para la validación constante
    applyWatchers() {
        watchEffect(() => {
            Object.keys(this.controls).forEach((key) => {
                if (this.controls[key].value != null) this.controls[key].validate();
            });
        });
    }

    // Valida todo el formulario 
    validateAll() {
        let isFine = true;
        for (const key of Object.keys(this.controls)) {
            if (!this.controls[key].validate()) {
                isFine = false;
            }
        }
        return isFine;
    }

    // Limpia el formulario
    reset() {
        for (const key of Object.keys(this.controls)) {
            this.controls[key].clearInAllForm();
            this.controls[key].value = this.controls[key].defaultValue;
        }
    }

    // Retorna los valores de los controles
    value() {
        const controlsValue: any = {}
        Object.keys(this.controls).forEach((k: string) => {
            controlsValue[k] = this.controls[k].value
        });
        return controlsValue;
    }

	// Retorna el valor de un controlador en específico
	get(control:string){
		return this.controls[control].value;
	}

    // Actualiza los valores de los controles
    matchValue(controls: any) {
        Object.keys(controls).forEach(k => {
            this.controls[k].value = controls[k];
        });
    }

    // Cambia el valor de un control 
    set(control: string, value: any) {
        this.controls[control].value = value;
    }

    // Recibe un arreglo de controles a mostrar
    showControls(controls: string[]) {
        for (let control of controls) {
            this.controls[control].show();
        }
    }

    // Recibe un arreglo de controles a ocultar
    hiddenControls(controls: string[]) {
        for (let control of controls) {
            this.controls[control].hidden();
        }
    }

    // Recibe un arreglo de controles a limpiar
    clearControls(controls: string[]) {
        for (let control of controls) {
            this.controls[control].clear();
        }
    }

}