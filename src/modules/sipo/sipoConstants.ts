export type SipoEstadoCodigo = 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type SipoEstadoFiltro =
	| 'Todas'
	| 'Activas'
	| 'En espera'
	| 'En revision'
	| 'Aprobada'
	| 'Finalizada'
	| 'Cancelada'
	| 'Registro DT';

export interface SipoEstadoConfig {
	label: string;
	severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
	badgeClass?: string;
}

export const SIPO_ESTADO_CONFIG: Record<number, SipoEstadoConfig> = {
	1: { label: 'NUEVA', severity: 'success' },
	3: { label: 'INICIADA', severity: 'warning' },
	4: { label: 'RECHAZADA', severity: 'danger' },
	5: { label: 'SELECCIONANDO', severity: 'info' },
	6: { label: 'EN ESPERA', severity: 'info' },
	7: { label: 'EN REVISIÓN', severity: 'info' },
	8: { label: 'APROBADA', severity: 'success' },
	9: { label: 'CANCELADA', severity: 'danger' },
	10: { label: 'FINALIZADA', severity: 'success' },
	11: { label: 'REGISTRO DT', severity: 'success' },
};

export function getSipoEstadoConfig(estado: number | null | undefined): SipoEstadoConfig {
	const code = Number(estado);
	return SIPO_ESTADO_CONFIG[code] ?? { label: `ESTADO ${estado}`, severity: 'secondary' };
}

export function formatSipoEmpresaDisplay(row: {
	cf_rrhh_sip_uni?: string | null;
	cf_rrhh_sip_nombre_uni?: string | null;
	cf_rrhh_sip_razonsocial?: string | null;
}): string {
	const uni = (row.cf_rrhh_sip_uni || '').trim();
	const nombreUni = (row.cf_rrhh_sip_nombre_uni || '').trim();
	if (uni || nombreUni) {
		return [uni ? `[${uni}]` : '', nombreUni].filter(Boolean).join(' ');
	}
	return (row.cf_rrhh_sip_razonsocial || '').trim() || '—';
}

export function formatSipoCargoSubtext(row: {
	cf_rrhh_sip_nombre_uni?: string | null;
	cf_rrhh_sip_nombre_cc?: string | null;
	cf_rrhh_sip_cc?: string | null;
	cargo_subtext?: string | null;
}): string {
	if (row.cargo_subtext) return row.cargo_subtext;
	const nombreUni = (row.cf_rrhh_sip_nombre_uni || '').trim();
	const nombreCc = (row.cf_rrhh_sip_nombre_cc || '').trim();
	const cc = (row.cf_rrhh_sip_cc || '').trim();
	const parts: string[] = [];
	if (nombreUni) parts.push(`[${nombreUni}]`);
	if (nombreCc) parts.push(nombreCc);
	if (cc) parts.push(`[${cc}]`);
	return parts.join(' ') || '—';
}

export const estadoFiltroOptions: { label: string; value: SipoEstadoFiltro }[] = [
	{ label: 'Activas', value: 'Activas' },
	{ label: 'Todas', value: 'Todas' },
	{ label: 'En espera', value: 'En espera' },
	{ label: 'En revisión', value: 'En revision' },
	{ label: 'Aprobada', value: 'Aprobada' },
	{ label: 'Finalizada', value: 'Finalizada' },
	{ label: 'Cancelada', value: 'Cancelada' },
	{ label: 'Registro DT', value: 'Registro DT' },
];

export interface SipoObraListItem {
	cf_rrhh_sip_id: number;
	cf_rrhh_sip_adm: string | null;
	cf_rrhh_sip_as: string | null;
	cf_rrhh_sip_create_user: string | null;
	cf_rrhh_sip_rut: string | null;
	cf_rrhh_sip_cc: string | null;
	cf_rrhh_sip_status: number;
	estado_label: string;
	cf_rrhh_sip_razonsocial: string | null;
	cf_rrhh_sip_uni: string | null;
	cf_rrhh_sip_nombre_uni: string | null;
	cf_rrhh_sip_nombre_cc: string | null;
	cf_rrhh_sip_create_date: string | null;
	cf_rrhh_sip_status_date: string | null;
	cf_rrhh_sip_status_user: string | null;
	cargo_display: string;
	cargo_subtext?: string | null;
	created_at?: string | null;
	created_by_email?: string | null;
	closed_at?: string | null;
	closed_by_email?: string | null;
}

export interface SipoAccionEstado {
	codigo: string;
	label: string;
	severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
	nuevo_estado: number;
}

export interface SipoHistorialEstadoItem {
	id: number;
	solicitud: number;
	estado_anterior: number;
	estado_anterior_label: string;
	estado_nuevo: number;
	estado_nuevo_label: string;
	usuario: string;
	comentario: string;
	fecha_creacion: string;
}

export interface SipoObraDetail extends SipoObraListItem {
	cf_rrhh_sip_dep: string | null;
	cf_rrhh_sip_nombre_dep: string | null;
	cf_rrhh_sip_ubicacion: string | null;
	cf_rrhh_sip_update_date: string | null;
	cf_rrhh_sip_update_user: string | null;
	can_edit?: boolean;
	acciones_estado?: SipoAccionEstado[];
	candidatos_count?: number;
	candidatos_seleccionados_count?: number;
	historial?: SipoHistorialEstadoItem[];
}

export interface SipoObraWritePayload {
	cf_rrhh_sip_rut: string;
	cf_rrhh_sip_razonsocial: string;
	cf_rrhh_sip_uni: string;
	cf_rrhh_sip_nombre_uni: string;
	cf_rrhh_sip_dep: string;
	cf_rrhh_sip_nombre_dep: string;
	cf_rrhh_sip_cc: string;
	cf_rrhh_sip_nombre_cc: string;
	cf_rrhh_sip_adm: string;
	cf_rrhh_sip_as: string;
	cf_rrhh_sip_ubicacion: string;
	external_code_pais?: string;
}

export const CANDIDATO_SELECCION_NINGUNO = 0;
export const CANDIDATO_SELECCIONADO = 1;
export const CANDIDATO_CONTRATADO_SAP = 2;

export const SIPO_ESTADOS_APROBAR_CONTRATACION = [7, 8] as const;
export const SIPO_STATUS_EN_ESPERA = 6;
export const SIPO_STATUS_EN_REVISION = 7;

export interface SipoCandidato {
	cf_rrhh_sip_obra_id?: number;
	cf_rrhh_sip_obra_candidato_id: string;
	cf_rrhh_sip_obra_user_id?: string | null;
	cf_rrhh_sip_obra_candidato_tratamiento?: string | null;
	cf_rrhh_sip_obra_candidato_rut: string | null;
	cf_rrhh_sip_obra_candidato_nombre: string | null;
	cf_rrhh_sip_obra_candidato_segundo_nombre: string | null;
	cf_rrhh_sip_obra_candidato_ap: string | null;
	cf_rrhh_sip_obra_candidato_am: string | null;
	cf_rrhh_sip_obra_candidato_genero?: string | null;
	cf_rrhh_sip_obra_candidato_fecha_nacimiento?: string | null;
	cf_rrhh_sip_obra_candidato_pais_nacimiento?: string | null;
	cf_rrhh_sip_obra_candidato_region_nacimiento?: string | null;
	cf_rrhh_sip_obra_candidato_nacionalidad?: string | null;
	cf_rrhh_sip_obra_candidato_nacionalidad_ext?: string | null;
	cf_rrhh_sip_obra_candidato_region?: string | null;
	cf_rrhh_sip_obra_candidato_ciudad?: string | null;
	cf_rrhh_sip_obra_candidato_comuna?: string | null;
	cf_rrhh_sip_obra_candidato_villa?: string | null;
	cf_rrhh_sip_obra_candidato_direccion?: string | null;
	cf_rrhh_sip_obra_candidato_numero_dire?: string | null;
	cf_rrhh_sip_obra_candidato_num_depto?: string | null;
	cf_rrhh_sip_obra_candidato_estado_civil?: string | null;
	cf_rrhh_sip_obra_candidato_telefono?: string | null;
	nombre_completo?: string;
	cf_rrhh_sip_obra_candidato_correo: string | null;
	cf_rrhh_sip_obra_candidato_metodo_pago?: string | null;
	cf_rrhh_sip_obra_candidato_banco?: string | null;
	cf_rrhh_sip_obra_candidato_numcta?: string | null;
	cf_rrhh_sip_obra_candidato_anticipo?: string | null;
	cf_rrhh_sip_obra_candidato_nomcar: string | null;
	cf_rrhh_sip_obra_candidato_jefe_user_id?: string | null;
	cf_rrhh_sip_obra_candidato_jefe_nombre?: string | null;
	cf_rrhh_sip_obra_candidato_jefe_correo?: string | null;
	cf_rrhh_sip_obra_candidato_horario_trabajo?: string | null;
	cf_rrhh_sip_obra_candidato_sueldo: string | null;
	cf_rrhh_sip_obra_sueldo_base?: number | string | null;
	cf_rrhh_sip_obra_bono_mineria?: number | string | null;
	cf_rrhh_sip_obra_candidato_cuenta_gasto?: string | null;
	cf_rrhh_sip_obra_candidato_tipo_contrato: string | null;
	cf_rrhh_sip_obra_candidato_fecha_ingreso: string | null;
	cf_rrhh_sip_obra_candidato_termino_contrato: string | null;
	cf_rrhh_sip_obra_candidato_fecha_termino_ito?: string | null;
	cf_rrhh_sip_obra_candidato_jubilado?: string | null;
	cf_rrhh_sip_obra_candidato_nom_afp?: string | null;
	cf_rrhh_sip_obra_candidato_nom_salud?: string | null;
	cf_rrhh_sip_obra_candidato_valor_plan?: string | null;
	cf_rrhh_sip_obra_candidato_valor_uf?: string | null;
	cf_rrhh_sip_obra_candidato_seguro_covid?: string | null;
	cf_rrhh_sip_obra_candidato_ci: string | null;
	cf_rrhh_sip_obra_candidato_afp: string | null;
	cf_rrhh_sip_obra_candidato_salud: string | null;
	cf_rrhh_sip_obra_candidato_domi: string | null;
	cf_rrhh_sip_obra_candidato_doc_jubi?: string | null;
	cf_rrhh_sip_obra_candidato_jubi?: string | null;
	cf_rrhh_sip_obra_candidato_visa?: string | null;
	cf_rrhh_sip_obra_candidato_permiso_trabajo?: string | null;
	cf_rrhh_sip_obra_candidato_copia_seguro_covid?: string | null;
	cf_rrhh_sip_obra_candidato_seleccionado?: number | null;
	cf_rrhh_sip_obra_candidato_estado_builder?: number | null;
	cf_rrhh_sip_obra_candidato_registro_dt?: string | null;
	cf_rrhh_sip_obra_candidato_estado?: number | null;
	docs_ok?: boolean;
}

export interface SipoCandidatoSeleccionado extends SipoCandidato {
	revision_dt?: boolean;
}

export type SipoCandidatoWritePayload = Partial<SipoCandidato> & {
	cf_rrhh_sip_obra_candidato_rut: string;
	cf_rrhh_sip_obra_candidato_nombre: string;
	cf_rrhh_sip_obra_candidato_ap: string;
	cf_rrhh_sip_obra_candidato_nomcar: string;
	cf_rrhh_sip_obra_candidato_sueldo: string;
	cf_rrhh_sip_obra_candidato_tipo_contrato: string;
	cf_rrhh_sip_obra_candidato_fecha_ingreso: string;
};

export interface SipoReintegrarItem {
	nombre_completo: string;
	rut: string;
	fecha_ingreso: string | null;
	fecha_termino: string | null;
}

export const TIPO_CONTRATO_OPTIONS = [
	{ label: 'Plazo Fijo', value: 'Plazo Fijo' },
	{ label: 'Obra o Faena', value: 'Obra o Faena' },
];

export const TIPO_CANDIDATO_OPTIONS = [
	{ label: 'Nuevo candidato', value: 'nuevo' },
	{ label: 'Reintegrar candidato', value: 'reintegrar' },
	{ label: 'Ficha de Ingreso', value: 'ficha' },
];

export const TRATAMIENTO_OPTIONS = [
	{ label: 'Sr.', value: 'Sr.' },
	{ label: 'Sra.', value: 'Sra.' },
	{ label: 'Srta.', value: 'Srta.' },
];

export const GENERO_OPTIONS = [
	{ label: 'Masculino', value: 'M' },
	{ label: 'Femenino', value: 'F' },
];

/** Normaliza texto de cédula/legado a value del dropdown (M|F). */
export function normalizeGeneroValue(raw: unknown): string | null {
	if (raw == null || raw === '') return null;
	const key = String(raw).trim().toUpperCase();
	if (['M', 'MASCULINO', 'H', 'HOMBRE', 'MALE'].includes(key)) return 'M';
	if (['F', 'FEMENINO', 'MUJER', 'FEMALE'].includes(key)) return 'F';
	return null;
}

export const ESTADO_CIVIL_OPTIONS = [
	{ label: 'Soltero/a', value: 'Soltero' },
	{ label: 'Casado/a', value: 'Casado' },
	{ label: 'Divorciado/a', value: 'Divorciado' },
	{ label: 'Viudo/a', value: 'Viudo' },
	{ label: 'Conviviente', value: 'Conviviente' },
];

export const SI_NO_OPTIONS = [
	{ label: 'Sí', value: 'Sí' },
	{ label: 'No', value: 'No' },
];

const SUELDO_PISO_HORARIO: Record<string, { umbral: number; piso: number }> = {
	PHT00017: { umbral: 405000, piso: 376606 },
	PHT00019: { umbral: 405000, piso: 376606 },
	PHT00021: { umbral: 302000, piso: 263704 },
	PTH00134: { umbral: 253000, piso: 280000 },
	PHT00068: { umbral: 278000, piso: 280000 },
	PTH00136: { umbral: 341000, piso: 280000 },
	PHT00136: { umbral: 341000, piso: 280000 },
	PHT00027: { umbral: 266000, piso: 280000 },
	PHT00036: { umbral: 341000, piso: 293005 },
	PHT00051: { umbral: 253000, piso: 210963 },
	PTH00135: { umbral: 253000, piso: 210963 },
};

export function parseSueldoDigits(value: string | null | undefined): number {
	const digits = String(value || '').replace(/\D/g, '');
	return digits ? Number(digits) : 0;
}

export function resolveSueldoWarning(sueldo: string, cargo: string, horario: string): string | null {
	const monto = parseSueldoDigits(sueldo);
	const cargoU = (cargo || '').trim().toUpperCase();
	const turno = (horario || '').trim().toUpperCase();
	const fmt = (n: number) => n.toLocaleString('es-CL');

	if (turno && SUELDO_PISO_HORARIO[turno]) {
		const { umbral, piso } = SUELDO_PISO_HORARIO[turno];
		if (monto < umbral) {
			return `El monto Líquido Pactado no puede ser menor a ${fmt(piso)} pesos`;
		}
		return null;
	}
	if (cargoU.includes('ALUMNO EN PRACTICA') || cargoU.includes('PRACTICA PROFESIONAL')) {
		return null;
	}
	if (monto > 0 && monto < 585000) {
		return 'El monto Líquido Pactado no puede ser menor a 585.000 pesos';
	}
	return null;
}

export interface SipoMaestroCentroCosto {
	external_code: string;
	nombre: string;
	external_code_pais?: string | null;
}

export interface SipoMaestroDepartamento {
	external_code: string;
	nombre: string;
	centros_costo: SipoMaestroCentroCosto[];
}

export interface SipoMaestroUnidad {
	external_code: string;
	nombre: string;
	departamentos: SipoMaestroDepartamento[];
}

export interface SipoMaestroEmpresa {
	external_code: string;
	nombre: string;
	external_code_pais?: string | null;
	unidades: SipoMaestroUnidad[];
}

export interface SipoMaestrosResponse {
	empresas: SipoMaestroEmpresa[];
	ubicaciones: { external_code: string; nombre: string }[];
	cargos: { external_code: string; nombre: string; area_personal: string }[];
	external_code_pais?: string | null;
}

export const EXTERNAL_CODE_PAIS_CHILE = '10000001';
export const EXTERNAL_CODE_PAIS_GRUPO_2 = '10000004';

export const SIPO_PAIS_OPTIONS = [
	{ label: 'Chile', value: EXTERNAL_CODE_PAIS_CHILE },
	{ label: 'Grupo 2', value: EXTERNAL_CODE_PAIS_GRUPO_2 },
];


export interface SipoPerfilRol {
	cf_rol_id: number;
	cf_rol_name: string;
}

export interface SipoUsuarioAlcanceItem {
	id: string;
	external_code?: string;
	nombre: string;
	empresa_rut?: string;
}

export interface SipoUsuario {
	id: number;
	correo: string;
	rol_id: number;
	rol: string;
	empresas_ids?: string[];
	centros_costo_ids?: string[];
	empresas?: SipoUsuarioAlcanceItem[];
	centros_costo?: SipoUsuarioAlcanceItem[];
}

export interface SipoUsuarioCreatePayload {
	correo: string;
	rol_id?: number;
	rol_nombre?: string;
	empresas_ids?: string[];
	centros_costo_ids?: string[];
	empresas_meta?: Record<string, string>;
	centros_meta?: Record<string, { nombre?: string; empresa_rut?: string }>;
}

export interface SipoUsuarioUpdatePayload {
	rol_id?: number;
	empresas_ids?: string[];
	centros_costo_ids?: string[];
	empresas_meta?: Record<string, string>;
	centros_meta?: Record<string, { nombre?: string; empresa_rut?: string }>;
}
