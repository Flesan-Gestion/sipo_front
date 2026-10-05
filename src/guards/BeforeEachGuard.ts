import { NavigationGuardWithThis } from "vue-router";
import { useSecurityStore } from "../store/security";
import { useGlobalStore } from "../store/global";
import { RolesEnum } from "../shared/enums/roles.enum";
// Validaciones y Protección de rutas

const beforeEachGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
    const global = useGlobalStore()

    // Validando el usuario
    const security = useSecurityStore()
    if (!security.user) {
        const token = localStorage.getItem("token")
        security.setUser(token)
    }

    if (to.path.startsWith("/auth") && security.user) {
        global.utl.genToast(global.tstType.USER_ALREADY_LOGGED);
        next(
            Number(security.user?.sip_rol_id) === RolesEnum.SUPERVISOR
                ? { name: 'SipoFichaIngresoHistorial' }
                : { name: 'SipoList' }
        );
        return;
    }

    if (to.path.startsWith("/panel") && !security.user) {
        next({ name: "Auth" });
        global.utl.genToast(global.tstType.USER_NOT_LOGGED);
        return;
    }

    const esSupervisor = Number(security.user?.sip_rol_id) === RolesEnum.SUPERVISOR;
    const rutasBloqueadasSupervisor = [
        'SipoList',
        'SipoCreate',
        'SipoEdit',
        'SipoDetail',
        'SipoUsuarios',
        'SipoConfigCargos',
    ];
    if (esSupervisor && rutasBloqueadasSupervisor.includes(String(to.name || ''))) {
        next({ name: 'SipoFichaIngresoHistorial' });
        return;
    }

    if (to.meta.sipoRolAdminOnly && Number(security.user?.sip_rol_id) !== RolesEnum.ADMIN) {
        global.utl.genToast(global.tstType.PERMISSION_DENIED);
        next(esSupervisor ? { name: 'SipoFichaIngresoHistorial' } : { name: 'SipoList' });
        return;
    }

    // Pasaron las validaciones. El usuario cumple con los accesos necesarios.
    next();
};

export default beforeEachGuard;
