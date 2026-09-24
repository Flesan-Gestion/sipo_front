import { RouteRecordRaw } from 'vue-router';

export const sipoRoutes: RouteRecordRaw[] = [
	{
		name: 'SipoList',
		path: 'sipo',
		meta: {
			description: 'Solicitudes de Obra',
			icon: 'pi-users',
		},
		component: () => import('./SipoListPage.vue'),
	},
	{
		name: 'SipoCreate',
		path: 'sipo/nueva',
		meta: {
			description: 'Nueva Solicitud SIP Obra',
			icon: 'pi-file-edit',
		},
		component: () => import('./views/SipoFormPage.vue'),
	},
	{
		name: 'SipoDetail',
		path: 'sipo/:id',
		meta: {
			description: 'Detalle Solicitud SIP Obra',
			icon: 'pi-eye',
		},
		component: () => import('./views/SipoFormPage.vue'),
	},
	{
		name: 'SipoFichaIngresoHistorial',
		path: 'ficha-ingreso/historial',
		meta: {
			description: 'Historial de Fichas',
			icon: 'pi-history',
		},
		component: () => import('./views/SipoFichaIngresoHistorialPage.vue'),
	},
	{
		name: 'SipoFichaIngresoEdit',
		path: 'ficha-ingreso/editar/:id',
		meta: {
			description: 'Editar Ficha de Ingreso',
			icon: 'pi-pencil',
		},
		component: () => import('./views/SipoFichaIngresoPage.vue'),
	},
	{
		name: 'SipoFichaIngresoCreate',
		path: 'ficha-ingreso',
		meta: {
			description: 'Crear Nueva Ficha',
			icon: 'pi-id-card',
		},
		component: () => import('./views/SipoFichaIngresoPage.vue'),
	},
	{
		name: 'SipoUsuarios',
		path: 'usuarios',
		meta: {
			description: 'Gestión de Usuarios',
			icon: 'pi-users',
			sipoRolAdminOnly: true,
		},
		component: () => import('./views/SipoUsuariosPage.vue'),
	},
	{
		name: 'SipoConfigCargos',
		path: 'config/cargos-horarios',
		meta: {
			description: 'Cargos y Horarios',
			icon: 'pi-briefcase',
			sipoRolAdminOnly: true,
		},
		component: () => import('./views/SipoConfigCargosPage.vue'),
	},
];
