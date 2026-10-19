import { computed } from 'vue';
import { useSecurityStore } from '../store/security';
import { RolesEnum } from '../shared/enums/roles.enum';

export function useSipoPermissions() {
	const security = useSecurityStore();

	const rolId = computed(() => Number(security.user?.sip_rol_id ?? 0));
	const email = computed(() => (security.user?.email || '').trim().toLowerCase());

	const isAdmin = computed(() => rolId.value === RolesEnum.ADMIN);
	const isRrhh = computed(() => rolId.value === RolesEnum.RRHH);
	const canCreate = computed(() => Boolean(security.user));
	const canCancel = computed(() => isAdmin.value);
	const canViewAll = computed(() => isAdmin.value || isRrhh.value);

	const canCancelRow = (status: number) => isAdmin.value && Number(status) < 9;
	/** Admin/RRHH (revisión DT, sync SAP, etc.). */
	const canApprove = computed(() => isAdmin.value || isRrhh.value);

	const isObraAdm = (obra?: { cf_rrhh_sip_adm?: string | null } | null) => {
		const adm = (obra?.cf_rrhh_sip_adm || '').trim().toLowerCase();
		return Boolean(email.value && adm && email.value === adm);
	};

	const isObraAsistente = (obra?: { cf_rrhh_sip_as?: string | null } | null) => {
		const as = (obra?.cf_rrhh_sip_as || '').trim().toLowerCase();
		return Boolean(email.value && as && email.value === as);
	};

	/** Admin/RRHH o admin de obra. Asistente no. */
	const canApproveContratacion = (
		obra?: {
			can_aprobar_contratacion?: boolean;
			cf_rrhh_sip_adm?: string | null;
		} | null
	) => {
		if (obra?.can_aprobar_contratacion != null) return Boolean(obra.can_aprobar_contratacion);
		return canApprove.value || isObraAdm(obra);
	};

	/** Admin/RRHH, adm o asistente. */
	const canToggleSeleccion = (
		obra?: {
			can_toggle_seleccion?: boolean;
			cf_rrhh_sip_adm?: string | null;
			cf_rrhh_sip_as?: string | null;
		} | null
	) => {
		if (obra?.can_toggle_seleccion != null) return Boolean(obra.can_toggle_seleccion);
		return canApprove.value || isObraAdm(obra) || isObraAsistente(obra);
	};

	/** Admin/RRHH o admin de obra. Asistente no. */
	const canSeleccionarTodos = (
		obra?: {
			can_seleccionar_todos?: boolean;
			cf_rrhh_sip_adm?: string | null;
		} | null
	) => {
		if (obra?.can_seleccionar_todos != null) return Boolean(obra.can_seleccionar_todos);
		return canApprove.value || isObraAdm(obra);
	};

	const lupaSeverity = (row: {
		cf_rrhh_sip_adm?: string | null;
		cf_rrhh_sip_as?: string | null;
		cf_rrhh_sip_create_user?: string | null;
	}) => {
		const mail = email.value;
		if (!mail) return 'secondary' as const;
		if ((row.cf_rrhh_sip_adm || '').toLowerCase() === mail) return 'success' as const;
		if (
			(row.cf_rrhh_sip_as || '').toLowerCase() === mail ||
			(row.cf_rrhh_sip_create_user || '').toLowerCase() === mail
		) {
			return 'info' as const;
		}
		if (isAdmin.value || isRrhh.value) return 'danger' as const;
		return 'warning' as const;
	};

	return {
		rolId,
		email,
		isAdmin,
		isRrhh,
		canCreate,
		canCancel,
		canViewAll,
		canCancelRow,
		canApprove,
		canApproveContratacion,
		canToggleSeleccion,
		canSeleccionarTodos,
		isObraAdm,
		isObraAsistente,
		lupaSeverity,
	};
}
