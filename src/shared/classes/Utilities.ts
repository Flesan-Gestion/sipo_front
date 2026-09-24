import router from "../../routes/router";
import { ConfirmationState, useConfirmationStore } from "../../store/confirmation";
import { useLoaderStore } from "../../store/loader";
import { useToastStore } from "../../store/toast";
import { Assets } from "../constants/assets";
import { ToastsMessages } from '../constants/toast-messages';
import { CurrencyEnum } from "../enums/currency.enum";
import { LocaleEnum } from "../enums/locale.enum";
import { AssetFileEnum } from "../interfaces/assets.interface";
import { ToastBodyInterface, ToastGroupEnum, ToastSeverityMessageEnum, ToastTypeMessageEnum } from "../interfaces/toast-message.interface";

export class Utilities {
    
	// Elimina caracteres especiales, reemplaza tildes por vocales normales y la letra ñ por n
	static cleanText(text: string) {
		text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		text = text.replace(/[^\w\s-_.()]/gi, '').replace(/ñ/gi, 'n');
		return text;
	}

	// Formatear fecha
	static formatDate(date: Date, locale: LocaleEnum = LocaleEnum.ES) {
		const formattedDate = date.toLocaleDateString(locale, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).replace(/\//g, '/');
		return formattedDate;
	}

    // Formatear hora
    static formatTime(date: Date) {
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const seconds = ("0" + date.getSeconds()).slice(-2);
        return `${hours}:${minutes}:${seconds}`;
    }

	// Formatear dinero
	static formatMoney(number: number, currency: CurrencyEnum, locale: LocaleEnum) {
		const formatNumber = new Intl.NumberFormat(locale.toString(), {
			style: "currency",
			currency: currency.toString(),
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
		return formatNumber.format(number);
	}

    // Esperar unos segundos
    static sleep(miliseconds: number) {
        return new Promise((res) => {
            setTimeout(() => {
                res(true);
            }, miliseconds);
        });
    }

    // Mostrar loader
    static showLoader(message: string | null = null) {
        useLoaderStore().show(message);
    }

    // Ocultar loader
    static hiddenLoader() {
        useLoaderStore().hidden();
    }

    // Mostrar modal de confirmación
    static showConfirmation(config:ConfirmationState) {
        useConfirmationStore().show(config);
    }

    // Navegar a otra ruta
    static navigate(name: string) {
        router.push({ name });
    }

    // Generar un mensaje toast
    static genToast(typeMessage: ToastTypeMessageEnum, life: number = 4500, group: ToastGroupEnum = ToastGroupEnum.TOP_RIGHT) {
        const message = ToastsMessages.find((m) => m.type == typeMessage);
        if (!message) return;
        const toastBody: ToastBodyInterface = {
            severity: message.severity,
            summary: message.summary,
            detail: message.detail,
            life,
            group
        };
        useToastStore().show(toastBody);
    }

    // Generar un mensaje personalizado toast
    static genCustomeToast(severity: ToastSeverityMessageEnum, summary: string, detail: string, life: number = 4500, group: ToastGroupEnum = ToastGroupEnum.TOP_RIGHT) {
        const toastBody: ToastBodyInterface = { severity, summary, detail, life, group };
        useToastStore().show(toastBody);
    }

    // Obtener archivo
    static getFile(fileName: AssetFileEnum) {
        return Assets.find(a => a.name == fileName)?.file;
    }

}
