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
	const canApprove = computed(() => isAdmin.value || isRrhh.value);

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
		lupaSeverity,
	};
}
