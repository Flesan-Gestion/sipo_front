import { usePrimeVue } from "primevue/config";

export default function setLocaleES() {
    const primevue = usePrimeVue();

    if (!primevue?.config?.locale) return;

    // Configuración de idioma para tabla de filtros
    primevue.config.locale.startsWith = "Empieza en";
    primevue.config.locale.contains = "Contiene";
    primevue.config.locale.notContains = "No contiene";
    primevue.config.locale.endsWith = "Termina en";
    primevue.config.locale.equals = "Igual";
    primevue.config.locale.notEquals = "No es igual";
    primevue.config.locale.matchAll = "Coincide cualquiera";
    primevue.config.locale.matchAny = "Coincide todos";
    primevue.config.locale.clear = "Limpiar";
    primevue.config.locale.apply = "Aplicar";
    primevue.config.locale.addRule = "Agregar filtro";
    primevue.config.locale.removeRule = "Eliminar filtro";
    primevue.config.locale.dateIs = "Fecha es";
    primevue.config.locale.dateBefore = "Fecha antes de";
    primevue.config.locale.dateAfter = "Fecha después de";
    primevue.config.locale.dateIsNot = "Fecha no es";

    // Configuración de idioma para calendario
    primevue.config.locale.dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    primevue.config.locale.dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
    primevue.config.locale.dayNamesMin = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
    primevue.config.locale.monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    primevue.config.locale.monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    // Configuración para feedback de contraseñas
    primevue.config.locale.weak = 'Contraseña débil';
    primevue.config.locale.medium = 'Contraseña Media';
    primevue.config.locale.strong = 'Contraseña Fuerte';
    primevue.config.locale.passwordPrompt = 'Ingresa una contraseña';
}