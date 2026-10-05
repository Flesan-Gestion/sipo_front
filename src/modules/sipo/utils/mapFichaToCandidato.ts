import { formatRut } from '../../../utils/formatRut';
import { formatMontoCl, parseMontoCl } from '../../../utils/formatters';

type Opt = { label?: string; value?: string | number; regiones?: Opt[]; ciudades?: any[]; comunas?: Opt[] };

const hasValue = (v: unknown) =>
	v !== null && v !== undefined && String(v).trim() !== '';

export const findOptionValue = (options: Opt[] | undefined, raw: unknown): string | null => {
	if (!hasValue(raw)) return null;
	const text = String(raw).trim();
	const list = options || [];
	const byValue = list.find((o) => String(o.value) === text);
	if (byValue) return String(byValue.value);
	const lower = text.toLowerCase();
	const byLabel = list.find((o) => String(o.label || '').trim().toLowerCase() === lower);
	if (byLabel) return String(byLabel.value);
	const byIncludes = list.find((o) => {
		const label = String(o.label || '').trim().toLowerCase();
		return label.includes(lower) || lower.includes(label);
	});
	return byIncludes ? String(byIncludes.value) : null;
};

const splitNombres = (nombres: string) => {
	const parts = nombres.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return { primero: '', segundo: '' };
	if (parts.length === 1) return { primero: parts[0], segundo: '' };
	return { primero: parts[0], segundo: parts.slice(1).join(' ') };
};

export const mapGeneroToSapCode = (raw: unknown): string | null => {
	if (!hasValue(raw)) return null;
	const key = String(raw).trim().toUpperCase();
	if (['M', 'MASCULINO', 'H', 'HOMBRE', 'MALE'].includes(key)) return 'M';
	if (['F', 'FEMENINO', 'MUJER', 'FEMALE'].includes(key)) return 'F';
	return null;
};

const parseDateInput = (value: unknown): Date | null => {
	if (!value) return null;
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
	const text = String(value).trim().slice(0, 10);
	const m = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return null;
	const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
	return Number.isNaN(d.getTime()) ? null : d;
};

export interface FichaToCandidatoResult {
	formPatch: Record<string, any>;
	camposCompletados: string[];
	camposFaltantes: string[];
}

export function mapFichaToCandidatoForm(
	ficha: Record<string, any>,
	maestros: Record<string, any[]>
): FichaToCandidatoResult {
	const { primero, segundo } = splitNombres(String(ficha.nombres || ''));
	const afp = findOptionValue(maestros.afps, ficha.afp);
	const salud = findOptionValue(maestros.sistemas_salud, ficha.isapre_fonasa);
	const estadoCivil = findOptionValue(maestros.estados_civiles, ficha.estado_civil);
	const banco = findOptionValue(maestros.bancos, ficha.banco);
	const metodoPago = findOptionValue(
		maestros.metodos_pago,
		ficha.metodo_pago || ficha.tipo_cuenta
	);
	const cuentaGasto = findOptionValue(maestros.cuentas_gasto, ficha.cuenta_gasto);
	const tipoContrato =
		findOptionValue(maestros.tipos_contrato, ficha.tipo_contrato) ||
		ficha.tipo_contrato ||
		'Plazo Fijo';
	const nacionalidad = findOptionValue(maestros.nacionalidades, ficha.nacionalidad);
	const nacionalidadExt = findOptionValue(
		maestros.nacionalidades_extranjeras,
		ficha.nacionalidad_ext
	);
	const region = findOptionValue(maestros.regiones, ficha.region) || ficha.region || null;

	const paisNacimiento =
		findOptionValue(maestros.paises_region_nacimiento, ficha.pais_nacimiento) ||
		ficha.pais_nacimiento ||
		null;
	let regionNacimiento: string | null = ficha.region_nacimiento || null;
	const paisOpt = (maestros.paises_region_nacimiento || []).find(
		(p) => String(p.value) === String(paisNacimiento)
	);
	if (paisOpt?.regiones?.length && ficha.region_nacimiento) {
		regionNacimiento =
			findOptionValue(paisOpt.regiones, ficha.region_nacimiento) || ficha.region_nacimiento;
	}

	let ciudad: string | null = ficha.ciudad || null;
	let comuna: string | null = ficha.comuna || null;
	const regionOpt = (maestros.regiones || []).find((r) => String(r.value) === String(region));
	if (regionOpt?.ciudades?.length && ficha.ciudad) {
		const ciu = regionOpt.ciudades.find(
			(c: Opt) =>
				String(c.value) === String(ficha.ciudad) ||
				String(c.label || '').toLowerCase() === String(ficha.ciudad).toLowerCase()
		);
		ciudad = ciu ? String(ciu.value) : ficha.ciudad;
		const com = (ciu?.comunas || []).find(
			(x: Opt) =>
				String(x.value) === String(ficha.comuna) ||
				String(x.label || '').toLowerCase() === String(ficha.comuna).toLowerCase()
		);
		if (com) comuna = String(com.value);
	}

	const horario =
		findOptionValue(maestros.horarios, ficha.horario) ||
		(hasValue(ficha.horario) ? String(ficha.horario) : null);

	const formPatch: Record<string, any> = {
		cf_rrhh_sip_obra_candidato_tratamiento: ficha.tratamiento || null,
		cf_rrhh_sip_obra_candidato_nombre: primero || null,
		cf_rrhh_sip_obra_candidato_segundo_nombre: segundo || null,
		cf_rrhh_sip_obra_candidato_ap: ficha.apellido_paterno || null,
		cf_rrhh_sip_obra_candidato_am: ficha.apellido_materno || null,
		cf_rrhh_sip_obra_candidato_genero: mapGeneroToSapCode(ficha.genero),
		cf_rrhh_sip_obra_candidato_rut: ficha.rut ? formatRut(String(ficha.rut)) : null,
		cf_rrhh_sip_obra_candidato_fecha_nacimiento: parseDateInput(ficha.fecha_nacimiento),
		cf_rrhh_sip_obra_candidato_estado_civil: estadoCivil,
		cf_rrhh_sip_obra_candidato_pais_nacimiento: paisNacimiento,
		cf_rrhh_sip_obra_candidato_region_nacimiento: regionNacimiento,
		cf_rrhh_sip_obra_candidato_nacionalidad: nacionalidad,
		cf_rrhh_sip_obra_candidato_nacionalidad_ext: nacionalidadExt,
		cf_rrhh_sip_obra_candidato_telefono: ficha.telefono || null,
		cf_rrhh_sip_obra_candidato_correo: ficha.email_personal || null,
		cf_rrhh_sip_obra_candidato_direccion: ficha.domicilio || null,
		cf_rrhh_sip_obra_candidato_villa: ficha.villa || null,
		cf_rrhh_sip_obra_candidato_numero_dire: ficha.numero_direccion || null,
		cf_rrhh_sip_obra_candidato_num_depto: ficha.num_depto || null,
		cf_rrhh_sip_obra_candidato_region: region,
		cf_rrhh_sip_obra_candidato_ciudad: ciudad,
		cf_rrhh_sip_obra_candidato_comuna: comuna,
		cf_rrhh_sip_obra_candidato_metodo_pago: metodoPago,
		cf_rrhh_sip_obra_candidato_banco: banco,
		cf_rrhh_sip_obra_candidato_numcta: ficha.numero_cuenta || null,
		cf_rrhh_sip_obra_candidato_anticipo: 'Sí',
		cf_rrhh_sip_obra_candidato_nom_afp: afp,
		cf_rrhh_sip_obra_candidato_nom_salud: salud,
		cf_rrhh_sip_obra_candidato_jubilado: ficha.jubilado ? 'Sí' : 'No',
		cf_rrhh_sip_obra_candidato_nomcar: ficha.cargo || null,
		cf_rrhh_sip_obra_candidato_jefe_user_id: ficha.jefe_user_id || null,
		cf_rrhh_sip_obra_candidato_jefe_nombre: ficha.jefe_nombre || null,
		cf_rrhh_sip_obra_candidato_jefe_correo: ficha.jefe_correo || null,
		cf_rrhh_sip_obra_candidato_fecha_ingreso: parseDateInput(ficha.fecha_ingreso),
		cf_rrhh_sip_obra_candidato_sueldo: (() => {
			const n = parseMontoCl(ficha.sueldo_liquido);
			return n == null ? null : formatMontoCl(n);
		})(),
		cf_rrhh_sip_obra_candidato_horario_trabajo: horario,
		cf_rrhh_sip_obra_candidato_cuenta_gasto: cuentaGasto,
		cf_rrhh_sip_obra_candidato_tipo_contrato: tipoContrato,
		cf_rrhh_sip_obra_candidato_termino_contrato: ficha.termino_contrato || null,
		cf_rrhh_sip_obra_candidato_fecha_termino_ito: parseDateInput(ficha.fecha_termino_ito),
		cf_rrhh_sip_obra_candidato_ci: ficha.doc_cedula || null,
		cf_rrhh_sip_obra_candidato_afp: ficha.doc_afp || null,
		cf_rrhh_sip_obra_candidato_salud: ficha.doc_salud || null,
		cf_rrhh_sip_obra_candidato_domi: ficha.doc_domicilio || null,
	};

	const labelsCheck: [string, unknown][] = [
		['Tratamiento', formPatch.cf_rrhh_sip_obra_candidato_tratamiento],
		['Primer nombre', formPatch.cf_rrhh_sip_obra_candidato_nombre],
		['Primer Apellido', formPatch.cf_rrhh_sip_obra_candidato_ap],
		['Segundo Apellido', formPatch.cf_rrhh_sip_obra_candidato_am],
		['Género', formPatch.cf_rrhh_sip_obra_candidato_genero],
		['RUT', formPatch.cf_rrhh_sip_obra_candidato_rut],
		['Fecha de nacimiento', formPatch.cf_rrhh_sip_obra_candidato_fecha_nacimiento],
		['Estado civil', formPatch.cf_rrhh_sip_obra_candidato_estado_civil],
		['País de nacimiento', formPatch.cf_rrhh_sip_obra_candidato_pais_nacimiento],
		['Región de nacimiento', formPatch.cf_rrhh_sip_obra_candidato_region_nacimiento],
		['Nacionalidad', formPatch.cf_rrhh_sip_obra_candidato_nacionalidad],
		['Teléfono', formPatch.cf_rrhh_sip_obra_candidato_telefono],
		['Correo', formPatch.cf_rrhh_sip_obra_candidato_correo],
		['Nombre calle', formPatch.cf_rrhh_sip_obra_candidato_direccion],
		['Número dirección', formPatch.cf_rrhh_sip_obra_candidato_numero_dire],
		['Región', formPatch.cf_rrhh_sip_obra_candidato_region],
		['Ciudad', formPatch.cf_rrhh_sip_obra_candidato_ciudad],
		['Comuna', formPatch.cf_rrhh_sip_obra_candidato_comuna],
		['Método de pago', formPatch.cf_rrhh_sip_obra_candidato_metodo_pago],
		['Banco', formPatch.cf_rrhh_sip_obra_candidato_banco],
		['N° cuenta', formPatch.cf_rrhh_sip_obra_candidato_numcta],
		['AFP', formPatch.cf_rrhh_sip_obra_candidato_nom_afp],
		['Salud', formPatch.cf_rrhh_sip_obra_candidato_nom_salud],
		['Jubilado', formPatch.cf_rrhh_sip_obra_candidato_jubilado],
		['Cargo', formPatch.cf_rrhh_sip_obra_candidato_nomcar],
		['Jefe Directo', formPatch.cf_rrhh_sip_obra_candidato_jefe_user_id],
		['Fecha ingreso', formPatch.cf_rrhh_sip_obra_candidato_fecha_ingreso],
		['Sueldo', formPatch.cf_rrhh_sip_obra_candidato_sueldo],
		['Horario', formPatch.cf_rrhh_sip_obra_candidato_horario_trabajo],
		['Cuenta de gasto', formPatch.cf_rrhh_sip_obra_candidato_cuenta_gasto],
		['Tipo de contrato', formPatch.cf_rrhh_sip_obra_candidato_tipo_contrato],
		['Término contrato', formPatch.cf_rrhh_sip_obra_candidato_termino_contrato],
		['Cédula (documento)', formPatch.cf_rrhh_sip_obra_candidato_ci],
		['Certificado AFP (documento)', formPatch.cf_rrhh_sip_obra_candidato_afp],
		['Certificado salud (documento)', formPatch.cf_rrhh_sip_obra_candidato_salud],
		['Comprobante de domicilio (documento)', formPatch.cf_rrhh_sip_obra_candidato_domi],
	];

	if (nacionalidad === 'Extranjero' || nacionalidad === 'Extranjero-Definitiva') {
		labelsCheck.push(['Nacionalidad extranjera', formPatch.cf_rrhh_sip_obra_candidato_nacionalidad_ext]);
	}

	const camposCompletados = labelsCheck.filter(([, v]) => hasValue(v)).map(([label]) => label);
	const camposFaltantes = labelsCheck.filter(([, v]) => !hasValue(v)).map(([label]) => label);

	return {
		formPatch,
		camposCompletados,
		camposFaltantes,
	};
}
