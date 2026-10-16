import { NavigationGuardWithThis } from "vue-router";
import { useSecurityStore } from "../store/security";
import { useGlobalStore } from "../store/global";
import { RolesEnum } from "../shared/enums/roles.enum";
// Validaciones y Protección de rutas

const homeForRol = (rolId: number) =>
    rolId === RolesEnum.SUPERVISOR || rolId === RolesEnum.JEFE_TERRENO
        ? { name: 'SipoFichaIngresoHistorial' as const }
        : { name: 'SipoList' as const };

const beforeEachGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
    const global = useGlobalStore()

    // Validando el usuario
    const security = useSecurityStore()
    if (!security.user) {
        const token = localStorage.getItem("token")
        security.setUser(token)
    }

    const rolId = Number(security.user?.sip_rol_id);
    const esSoloFichas =
        rolId === RolesEnum.SUPERVISOR || rolId === RolesEnum.JEFE_TERRENO;

    if (to.path.startsWith("/auth") && security.user) {
        global.utl.genToast(global.tstType.USER_ALREADY_LOGGED);
        next(homeForRol(rolId));
        return;
    }

    if (to.path.startsWith("/panel") && !security.user) {
        next({ name: "Auth" });
        global.utl.genToast(global.tstType.USER_NOT_LOGGED);
        return;
    }

    const rutasBloqueadasSoloFichas = [
        'SipoList',
        'SipoCreate',
        'SipoEdit',
        'SipoDetail',
        'SipoUsuarios',
        'SipoConfigCargos',
    ];
    if (esSoloFichas && rutasBloqueadasSoloFichas.includes(String(to.name || ''))) {
        next({ name: 'SipoFichaIngresoHistorial' });
        return;
    }

    if (
        rolId === RolesEnum.JEFE_TERRENO &&
        ['SipoFichaIngresoCreate', 'SipoFichaIngresoEdit'].includes(String(to.name || ''))
    ) {
        next({ name: 'SipoFichaIngresoHistorial' });
        return;
    }

    const rutasFicha = [
        'SipoFichaIngresoCreate',
        'SipoFichaIngresoEdit',
        'SipoFichaIngresoHistorial',
    ];
    if (rolId === RolesEnum.USUARIO_OBRA && rutasFicha.includes(String(to.name || ''))) {
        next({ name: 'SipoList' });
        return;
    }

    if (to.meta.sipoRolAdminOnly && Number(security.user?.sip_rol_id) !== RolesEnum.ADMIN) {
        global.utl.genToast(global.tstType.PERMISSION_DENIED);
        next(homeForRol(rolId));
        return;
    }

    // Pasaron las validaciones. El usuario cumple con los accesos necesarios.
    next();
};

export default beforeEachGuard;
