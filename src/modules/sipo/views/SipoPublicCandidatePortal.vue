<template>
	<div class="portal min-h-screen surface-ground" :class="{ 'portal--ok': enviado }">
		<header class="portal-header">
			<img :src="logoGrupoFlesan" alt="Grupo Flesan" class="portal-logo" />
			<div class="portal-header__inner">
				<h1>Ficha de Incorporación Personal</h1>
				<p v-if="resumen?.cargo" class="portal-subtitle">
					Cargo: {{ resumen.cargo }}
				</p>
			</div>
		</header>
		<div
			class="portal-card mx-auto"
			:class="enviado ? 'portal-card--ok' : 'surface-card border-round shadow-1 mt-3 mb-5'"
		>
			<div :class="enviado ? '' : 'p-3'">
			<div v-if="loading" class="flex justify-content-center py-6"><ProgressSpinner /></div>
			<div v-else-if="errorCarga" class="p-3">{{ errorCarga }}</div>
			<div v-else-if="enviado" class="portal-ok surface-card border-round shadow-1">
				<div class="portal-ok__icon">
					<i class="pi pi-check" />
				</div>
				<h2>Información enviada</h2>
				<p>Tus datos y documentos ya fueron recibidos por Recursos Humanos. Puedes cerrar esta ventana.</p>
			</div>
			<div v-else-if="resumen?.bloqueado" class="p-3">Este enlace ya no está disponible.</div>
			<form v-else class="grid formgrid" @submit.prevent="guardar">
				<div class="col-12 flex justify-content-end mb-2">
					<Button type="button" class="portal-btn" label="Escanear Cédula" icon="pi pi-id-card" size="small" @click="scanner = true" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Nombres</label>
					<InputText v-model="form.nombres" :class="fc('nombres')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Primer Apellido</label>
					<InputText v-model="form.apellido_paterno" :class="fc('apellido_paterno')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Segundo Apellido</label>
					<InputText v-model="form.apellido_materno" :class="fc('apellido_materno')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) RUT</label>
					<InputText v-model="form.rut" maxlength="13" :class="fc('rut')" @blur="onRutBlur" />
					<small v-if="fieldErrors.rut" class="p-error">{{ fieldErrors.rut }}</small>
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Género</label>
					<Dropdown v-model="form.genero" :options="GENERO_OPTIONS" optionLabel="label" optionValue="value" placeholder="Seleccionar" :class="fc('genero')" @change="syncTratamiento" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Tratamiento</label>
					<Dropdown v-model="form.tratamiento" :options="TRATAMIENTO_OPTIONS" optionLabel="label" optionValue="value" placeholder="Seleccionar" :class="fc('tratamiento')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Fecha de Nacimiento</label>
					<Calendar v-model="form.fecha_nacimiento" dateFormat="dd-mm-yy" :maxDate="maxFechaNacimiento" :class="fc('fecha_nacimiento')" showIcon @date-select="calcEdad" />
					<small class="text-color-secondary">Solo mayores de 18 años</small>
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Edad</label>
					<InputNumber v-model="form.edad" disabled :class="fc('edad')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Nacionalidad</label>
					<Dropdown v-model="form.nacionalidad" :options="catalogos.nacionalidades" optionLabel="label" optionValue="value" filter placeholder="Seleccionar" :class="fc('nacionalidad')" />
				</div>
				<div v-if="showNacionalidadExt" class="field col-12 md:col-4">
					<label>(*) Nacionalidad extranjera</label>
					<Dropdown v-model="form.nacionalidad_ext" :options="catalogos.nacionalidades_extranjeras" optionLabel="label" optionValue="value" filter placeholder="Seleccionar" :class="fc('nacionalidad_ext')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) País de nacimiento</label>
					<Dropdown v-model="form.pais_nacimiento" :options="catalogos.paises_region_nacimiento" optionLabel="label" optionValue="value" filter placeholder="Seleccionar" :class="fc('pais_nacimiento')" @change="form.region_nacimiento = null" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Región de nacimiento</label>
					<Dropdown v-model="form.region_nacimiento" :options="regionesNacimiento" optionLabel="label" optionValue="value" filter placeholder="Seleccionar" :disabled="!form.pais_nacimiento" :class="fc('region_nacimiento')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) AFP</label>
					<Dropdown v-model="form.afp" :options="catalogos.afps" optionLabel="label" optionValue="value" filter placeholder="Seleccionar AFP" :class="fc('afp')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Isapre / Fonasa</label>
					<Dropdown v-model="form.isapre_fonasa" :options="catalogos.sistemas_salud" optionLabel="label" optionValue="value" filter placeholder="Seleccionar" :class="fc('isapre_fonasa')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Jubilado</label>
					<Dropdown v-model="form.jubilado" :options="jubiladoOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar" :class="fc('jubilado')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Estado Civil</label>
					<Dropdown v-model="form.estado_civil" :options="catalogos.estados_civiles" optionLabel="label" optionValue="value" placeholder="Seleccionar" :class="fc('estado_civil')" @change="syncTratamiento" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Teléfono Particular o Celular</label>
					<InputGroup>
						<InputGroupAddon>569</InputGroupAddon>
						<InputText v-model="telefonoLocal" maxlength="8" :class="fc('telefono')" />
					</InputGroup>
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Nombre calle</label>
					<InputText v-model="form.domicilio" :class="fc('domicilio')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Número dirección</label>
					<InputText v-model="form.numero_direccion" :class="fc('numero_direccion')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>Villa / población</label>
					<InputText v-model="form.villa" />
				</div>
				<div class="field col-12 md:col-4">
					<label>N° departamento</label>
					<InputText v-model="form.num_depto" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Región</label>
					<Dropdown v-model="form.region" :options="catalogos.regiones" optionLabel="label" optionValue="value" filter placeholder="Seleccionar" :class="fc('region')" @change="onRegionChange" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Ciudad</label>
					<Dropdown v-model="form.ciudad" :options="ciudades" optionLabel="label" optionValue="value" filter :disabled="!form.region" placeholder="Seleccionar" :class="fc('ciudad')" @change="form.comuna = null" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Comuna</label>
					<Dropdown v-model="form.comuna" :options="comunas" optionLabel="label" optionValue="value" filter :disabled="!form.ciudad" placeholder="Seleccionar" :class="fc('comuna')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) E-mail Personal</label>
					<InputText v-model="form.email_personal" :class="fc('email_personal')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Método de pago</label>
					<Dropdown v-model="form.metodo_pago" :options="catalogos.metodos_pago" optionLabel="label" optionValue="value" placeholder="Seleccionar" :class="fc('metodo_pago')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) Banco</label>
					<Dropdown v-model="form.banco" :options="catalogos.bancos" optionLabel="label" optionValue="value" filter placeholder="Seleccionar banco" :class="fc('banco')" />
				</div>
				<div class="field col-12 md:col-4">
					<label>(*) N° Cta. Bancaria</label>
					<InputText v-model="form.numero_cuenta" :class="fc('numero_cuenta')" />
				</div>

				<div class="col-12 mt-4 mb-2"><h3 class="text-base m-0">Documentos a adjuntar</h3></div>
				<div v-for="doc in documentos" :key="doc.key" class="field col-12 md:col-6 portal-doc">
					<label>{{ doc.label }}</label>
					<input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" @change="onFile(doc.key, $event)" />
					<small v-if="docExistente[doc.key]" class="text-color-secondary block">Archivo ya cargado</small>
					<small v-if="fieldErrors[doc.key]" class="p-error">{{ fieldErrors[doc.key] }}</small>
				</div>
				<small class="col-12 text-color-secondary mt-2">Máximo 4 MB · Formatos: pdf, png, jpg, jpeg, webp. El certificado de título es opcional.</small>
				<div class="col-12 flex justify-content-end mt-4 mb-4">
					<Button type="submit" class="portal-btn" label="Enviar información" icon="pi pi-check" :loading="saving" />
				</div>
			</form>
			</div>
		</div>
		<SipoQrScannerModal v-model:visible="scanner" @scanned="onScanned" />
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';
import { SipoService } from '../services/SipoService';
import { GENERO_OPTIONS, TRATAMIENTO_OPTIONS, normalizeGeneroValue } from '../sipoConstants';
import { formatPersonName } from '../utils/parseCedulaAnverso';
import { filterRutInput, formatRut, isValidRut } from '../../../utils/formatRut';
import SipoQrScannerModal, { type CedulaData } from '../components/SipoQrScannerModal.vue';
import logoGrupoFlesan from '../../../assets/img/logo_grupo_flesan.png';

const route = useRoute();
const token = String(route.params.token || '');
const loading = ref(true);
const saving = ref(false);
const enviado = ref(false);
const scanner = ref(false);
const errorCarga = ref('');
const resumen = ref<Record<string, any> | null>(null);
const catalogos = reactive<Record<string, any[]>>({});
const fieldErrors = reactive<Record<string, string>>({});
const telefonoLocal = ref('');
const docExistente = reactive<Record<string, boolean>>({});
const files = reactive<Record<string, File | null>>({});
const jubiladoOptions = [
	{ label: 'Sí', value: 'true' },
	{ label: 'No', value: 'false' },
];
const documentos = [
	{ key: 'doc_domicilio', label: '(*) Comprobante de Domicilio', required: true },
	{ key: 'doc_titulo', label: 'Certificado de Título (Opcional)', required: false },
	{ key: 'doc_afp', label: '(*) Certificado AFP', required: true },
	{ key: 'doc_salud', label: '(*) Certificado Salud', required: true },
	{ key: 'doc_cedula', label: '(*) Cédula de Identidad', required: true },
];
const form = reactive<Record<string, any>>({
	nombres: '',
	apellido_paterno: '',
	apellido_materno: '',
	rut: '',
	genero: null,
	tratamiento: null,
	fecha_nacimiento: null as Date | null,
	edad: null as number | null,
	nacionalidad: null,
	nacionalidad_ext: null,
	pais_nacimiento: null,
	region_nacimiento: null,
	afp: null,
	isapre_fonasa: null,
	jubilado: null,
	estado_civil: null,
	domicilio: '',
	numero_direccion: '',
	villa: '',
	num_depto: '',
	region: null,
	ciudad: null,
	comuna: null,
	email_personal: '',
	metodo_pago: null,
	banco: null,
	numero_cuenta: '',
});

const maxFechaNacimiento = computed(() => {
	const d = new Date();
	d.setFullYear(d.getFullYear() - 18);
	return d;
});
const showNacionalidadExt = computed(() =>
	['Extranjero', 'Extranjero-Definitiva'].includes(String(form.nacionalidad || ''))
);
const regionesNacimiento = computed(() => {
	const pais = (catalogos.paises_region_nacimiento || []).find((p: any) => p.value === form.pais_nacimiento);
	return pais?.regiones || [];
});
const ciudades = computed(() => {
	const region = (catalogos.regiones || []).find((r: any) => r.value === form.region);
	return region?.ciudades || [];
});
const comunas = computed(() => {
	const ciudad = ciudades.value.find((c: any) => c.value === form.ciudad);
	return ciudad?.comunas || [];
});
const fc = (key: string) => ['w-full', { 'p-invalid': Boolean(fieldErrors[key]) }];

const calcEdad = () => {
	const fecha = form.fecha_nacimiento as Date | null;
	if (!fecha) {
		form.edad = null;
		return;
	}
	const today = new Date();
	let years = today.getFullYear() - fecha.getFullYear();
	if (today < new Date(today.getFullYear(), fecha.getMonth(), fecha.getDate())) years -= 1;
	form.edad = years;
};
const onRegionChange = () => {
	form.ciudad = null;
	form.comuna = null;
};
const onRutBlur = () => {
	form.rut = formatRut(filterRutInput(String(form.rut || '')));
};
const onFile = (key: string, event: Event) => {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0] || null;
	fieldErrors[key] = '';
	if (file && file.size > 4 * 1024 * 1024) {
		fieldErrors[key] = 'No puede superar 4 MB.';
		files[key] = null;
		return;
	}
	files[key] = file;
};
const esCasada = () => {
	const valor = String(form.estado_civil || '').toLowerCase();
	const label = String(
		(catalogos.estados_civiles || []).find((o: any) => o.value === form.estado_civil)?.label || ''
	).toLowerCase();
	return valor.includes('casad') || label.includes('casad');
};
const syncTratamiento = () => {
	if (form.genero === 'F') {
		form.tratamiento = esCasada() ? 'Sra.' : 'Srta.';
		return;
	}
	if (form.genero === 'M') form.tratamiento = 'Sr.';
};
const onScanned = (data: CedulaData) => {
	if (data.nombres && data.nombres.trim().length >= 3) form.nombres = formatPersonName(data.nombres);
	if (data.apellidoPaterno && data.apellidoPaterno.trim().length >= 3) {
		form.apellido_paterno = formatPersonName(data.apellidoPaterno);
	}
	if (data.apellidoMaterno && data.apellidoMaterno.trim().length >= 3) {
		form.apellido_materno = formatPersonName(data.apellidoMaterno);
	}
	if (data.rut) form.rut = formatRut(data.rut);
	if (data.genero) {
		form.genero = normalizeGeneroValue(data.genero);
		syncTratamiento();
	}
	if (data.nacionalidad) {
		const nac = (catalogos.nacionalidades || []).find(
			(o: any) =>
				String(o.value).toLowerCase() === String(data.nacionalidad).toLowerCase() ||
				String(o.label || '').toLowerCase() === String(data.nacionalidad).toLowerCase()
		);
		form.nacionalidad = nac ? nac.value : data.nacionalidad;
		const texto = String(form.nacionalidad || '').toLowerCase();
		if (texto.includes('chil')) {
			const pais = (catalogos.paises_region_nacimiento || []).find((o: any) =>
				String(o.value || o.label || '').toLowerCase().includes('chile')
			);
			form.pais_nacimiento = pais?.value || 'Chile';
		}
	}
	if (data.fechaNacimiento) {
		const m = String(data.fechaNacimiento).match(/^(\d{2})-(\d{2})-(\d{4})$/);
		if (m) form.fecha_nacimiento = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
		calcEdad();
	}
};
const labelOf = (options: any[] | undefined, value: unknown) => {
	const found = (options || []).find((o) => String(o.value) === String(value));
	return found?.label || value || '';
};
const iso = (value: Date | null) => {
	if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
	const m = String(value.getMonth() + 1).padStart(2, '0');
	const d = String(value.getDate()).padStart(2, '0');
	return `${value.getFullYear()}-${m}-${d}`;
};

const validar = () => {
	Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k]);
	const requeridos: Array<[string, unknown]> = [
		['nombres', form.nombres],
		['apellido_paterno', form.apellido_paterno],
		['apellido_materno', form.apellido_materno],
		['rut', form.rut],
		['genero', form.genero],
		['tratamiento', form.tratamiento],
		['fecha_nacimiento', form.fecha_nacimiento],
		['edad', form.edad],
		['nacionalidad', form.nacionalidad],
		['pais_nacimiento', form.pais_nacimiento],
		['region_nacimiento', form.region_nacimiento],
		['afp', form.afp],
		['isapre_fonasa', form.isapre_fonasa],
		['jubilado', form.jubilado],
		['estado_civil', form.estado_civil],
		['telefono', telefonoLocal.value],
		['domicilio', form.domicilio],
		['numero_direccion', form.numero_direccion],
		['region', form.region],
		['ciudad', form.ciudad],
		['comuna', form.comuna],
		['email_personal', form.email_personal],
		['metodo_pago', form.metodo_pago],
		['banco', form.banco],
		['numero_cuenta', form.numero_cuenta],
	];
	for (const [key, value] of requeridos) {
		if (value === null || value === undefined || String(value).trim() === '') {
			fieldErrors[key] = 'Campo obligatorio';
		}
	}
	if (showNacionalidadExt.value && !form.nacionalidad_ext) {
		fieldErrors.nacionalidad_ext = 'Campo obligatorio';
	}
	if (form.rut && !isValidRut(String(form.rut))) fieldErrors.rut = 'RUT inválido.';
	if (form.edad != null && Number(form.edad) < 18) fieldErrors.edad = 'Debe ser mayor de 18 años.';
	for (const doc of documentos) {
		if (doc.required && !files[doc.key] && !docExistente[doc.key]) {
			fieldErrors[doc.key] = 'Documento obligatorio';
		}
	}
	return Object.keys(fieldErrors).length === 0;
};

const guardar = async () => {
	if (!validar()) return;
	form.rut = formatRut(String(form.rut || ''));
	saving.value = true;
	errorCarga.value = '';
	try {
		const rutCheck = await SipoService.validarRut(form.rut);
		if (Number(rutCheck?.status) !== 200) {
			fieldErrors.rut = 'No se pudo verificar el RUT en SAP. Intente nuevamente.';
			return;
		}
		if (rutCheck.data?.activo_ibuilder_sap) {
			fieldErrors.rut = rutCheck.data.mensaje || 'El trabajador aún está activo en SAP.';
			return;
		}
		const fd = new FormData();
		fd.append('enviar', 'true');
		fd.append('nombres', form.nombres);
		fd.append('apellido_paterno', form.apellido_paterno);
		fd.append('apellido_materno', form.apellido_materno);
		fd.append('rut', form.rut);
		fd.append('genero', form.genero || '');
		fd.append('tratamiento', form.tratamiento || '');
		fd.append('fecha_nacimiento', iso(form.fecha_nacimiento));
		fd.append('edad', String(form.edad ?? ''));
		fd.append('nacionalidad', labelOf(catalogos.nacionalidades, form.nacionalidad));
		fd.append('nacionalidad_ext', showNacionalidadExt.value ? String(labelOf(catalogos.nacionalidades_extranjeras, form.nacionalidad_ext)) : '');
		fd.append('pais_nacimiento', String(labelOf(catalogos.paises_region_nacimiento, form.pais_nacimiento)));
		fd.append('region_nacimiento', String(labelOf(regionesNacimiento.value, form.region_nacimiento)));
		fd.append('afp', String(labelOf(catalogos.afps, form.afp)));
		fd.append('isapre_fonasa', String(labelOf(catalogos.sistemas_salud, form.isapre_fonasa)));
		fd.append('jubilado', String(form.jubilado ?? ''));
		fd.append('estado_civil', String(labelOf(catalogos.estados_civiles, form.estado_civil)));
		fd.append('telefono', telefonoLocal.value ? `569${telefonoLocal.value}` : '');
		fd.append('domicilio', form.domicilio);
		fd.append('numero_direccion', form.numero_direccion);
		fd.append('villa', form.villa || '');
		fd.append('num_depto', form.num_depto || '');
		fd.append('region', String(labelOf(catalogos.regiones, form.region)));
		fd.append('ciudad', String(form.ciudad || ''));
		fd.append('comuna', String(form.comuna || ''));
		fd.append('email_personal', form.email_personal);
		fd.append('metodo_pago', String(labelOf(catalogos.metodos_pago, form.metodo_pago)));
		fd.append('banco', String(labelOf(catalogos.bancos, form.banco)));
		fd.append('numero_cuenta', form.numero_cuenta);
		for (const [key, file] of Object.entries(files)) {
			const raw = file ? toRaw(file) : null;
			if (raw) fd.append(key, raw, raw.name);
		}
		const response = await SipoService.guardarPortalCandidato(token, fd);
		if (Number(response?.status) !== 200) {
			errorCarga.value = response?.detail || 'No se pudo enviar la información.';
			return;
		}
		enviado.value = true;
	} catch (err: any) {
		errorCarga.value = err?.response?.data?.detail || 'No se pudo enviar la información.';
	} finally {
		saving.value = false;
	}
};

const cargar = async () => {
	loading.value = true;
	try {
		const response = await SipoService.getPortalCandidato(token);
		resumen.value = response.data;
		Object.assign(catalogos, response.data?.catalogos || {});
		Object.assign(docExistente, response.data?.documentos || {});
		const datos = response.data?.datos || {};
		form.nombres = datos.nombres || '';
		form.apellido_paterno = datos.apellido_paterno || '';
		form.apellido_materno = datos.apellido_materno || '';
		form.rut = datos.rut ? formatRut(String(datos.rut)) : '';
		form.genero = datos.genero || null;
		form.tratamiento = datos.tratamiento || null;
		form.nacionalidad = datos.nacionalidad || null;
		form.nacionalidad_ext = datos.nacionalidad_ext || null;
		form.pais_nacimiento = datos.pais_nacimiento || null;
		form.region_nacimiento = datos.region_nacimiento || null;
		form.afp = datos.afp || null;
		form.isapre_fonasa = datos.isapre_fonasa || null;
		form.jubilado = datos.jubilado === true ? 'true' : datos.jubilado === false ? 'false' : null;
		form.estado_civil = datos.estado_civil || null;
		form.domicilio = datos.domicilio || '';
		form.numero_direccion = datos.numero_direccion || '';
		form.villa = datos.villa || '';
		form.num_depto = datos.num_depto || '';
		form.region = datos.region || null;
		form.ciudad = datos.ciudad || null;
		form.comuna = datos.comuna || null;
		form.email_personal = datos.email_personal || response.data?.correo_colaborador || '';
		form.metodo_pago = datos.metodo_pago || null;
		form.banco = datos.banco || null;
		form.numero_cuenta = datos.numero_cuenta || '';
		const tel = String(datos.telefono || '');
		telefonoLocal.value = tel.startsWith('569') ? tel.slice(3) : tel.replace(/\D/g, '').slice(-8);
		if (datos.fecha_nacimiento) {
			const [y, m, d] = String(datos.fecha_nacimiento).slice(0, 10).split('-');
			if (y && m && d) form.fecha_nacimiento = new Date(Number(y), Number(m) - 1, Number(d));
			calcEdad();
		}
	} catch (err: any) {
		errorCarga.value = err?.response?.data?.detail || 'No se pudo abrir el enlace.';
	} finally {
		loading.value = false;
	}
};

onMounted(cargar);
</script>

<style scoped>
.portal {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}
.portal--ok {
	min-height: 100dvh;
}
.portal-card {
	max-width: min(1100px, calc(100% - 3rem));
	margin-left: auto;
	margin-right: auto;
	overflow: hidden;
}
.portal-card--ok {
	flex: 1;
	width: 100%;
	max-width: none;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.5rem;
	padding-bottom: 12vh;
}
.portal-ok {
	text-align: center;
	padding: 3.25rem 2.25rem 2.75rem;
	width: min(42rem, 100%);
}
.portal-ok__icon {
	width: 5.75rem;
	height: 5.75rem;
	margin: 0 auto 1.25rem;
	border-radius: 50%;
	background: #e8f6ee;
	color: #1e8e3e;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2.35rem;
}
.portal-ok h2 {
	margin: 0 0 0.75rem;
	color: #1e3a2f;
	font-size: 1.75rem;
}
.portal-ok p {
	margin: 0 auto;
	max-width: 36rem;
	color: var(--text-color-secondary);
	line-height: 1.55;
	font-size: 1.1rem;
}
.portal-header {
	position: relative;
	border-bottom: 3px solid #c41230;
	background: #fff;
}
.portal-header__inner {
	position: relative;
	max-width: 72rem;
	margin: 0 auto;
	padding: 1.25rem 1.5rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 5.5rem;
}
.portal-logo {
	position: absolute;
	left: 1.25rem;
	top: 50%;
	transform: translateY(-50%);
	width: 11rem;
	height: auto;
	z-index: 1;
}
.portal-header h1 {
	margin: 0;
	font-size: 1.25rem;
	font-weight: 700;
	color: #a30f28;
	text-transform: uppercase;
	letter-spacing: 0.02em;
	text-align: center;
}
.portal-subtitle {
	margin: 0.25rem 0 0;
	color: var(--text-color-secondary);
	font-size: 0.95rem;
	text-align: center;
}
label { font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.35rem; }
.portal-doc { margin-bottom: 1.25rem; }
.portal-doc input[type='file'] { display: block; margin-top: 0.35rem; }
.portal-doc .p-error { display: block; margin-top: 0.35rem; }
:deep(.portal-btn) { width: auto; }
.field :deep(.p-inputtext),
.field :deep(.p-dropdown),
.field :deep(.p-calendar),
.field :deep(.p-inputnumber),
.field :deep(.p-inputgroup) { width: 100%; }
</style>
